package com.bincms.domain.file.service;

import com.bincms.common.exception.BusinessException;
import com.bincms.common.exception.ErrorCode;
import com.bincms.domain.file.dto.FileResponse;
import com.bincms.domain.file.entity.FileInfo;
import com.bincms.domain.file.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Iterator;
import java.util.List;
import java.util.UUID;

/**
 * 파일 업로드 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FileService {
    
    private final FileRepository fileRepository;
    
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    
    @Value("${file.base-url:/uploads}")
    private String baseUrl;
    
    /** 썸네일 최대 너비(px) */
    private static final int THUMBNAIL_WIDTH = 400;
    
    /** 허용 이미지 확장자 */
    private static final List<String> ALLOWED_IMAGE_EXT = List.of("jpg", "jpeg", "png", "gif", "webp", "bmp");
    
    /**
     * 파일 업로드 (이미지인 경우 썸네일 자동 생성)
     */
    @Transactional
    public FileResponse upload(MultipartFile file, String refType, Long refId) {
        validateFile(file);
        
        String originalName = file.getOriginalFilename();
        String ext = getExtension(originalName);
        String storedName = UUID.randomUUID() + "." + ext;
        
        // 날짜별 디렉토리: uploads/2026/02/08/
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String dirPath = uploadDir + "/" + datePath;
        
        try {
            // 디렉토리 생성
            Path dir = Paths.get(dirPath);
            Files.createDirectories(dir);
            
            // 원본 파일 저장
            String filePath = datePath + "/" + storedName;
            Path targetPath = Paths.get(uploadDir, datePath, storedName);
            file.transferTo(targetPath.toFile());
            log.info("File uploaded: {}", filePath);
            
            // 썸네일 생성 (이미지인 경우)
            String thumbnailPath = null;
            if (isImage(ext)) {
                thumbnailPath = generateThumbnail(targetPath, datePath, storedName, ext);
            }
            
            // DB 저장
            FileInfo fileInfo = FileInfo.builder()
                    .originalName(originalName)
                    .storedName(storedName)
                    .filePath(filePath)
                    .thumbnailPath(thumbnailPath)
                    .fileSize(file.getSize())
                    .contentType(file.getContentType())
                    .fileExt(ext)
                    .refType(refType)
                    .refId(refId)
                    .build();
            
            FileInfo saved = fileRepository.save(fileInfo);
            return FileResponse.from(saved, baseUrl);
            
        } catch (IOException e) {
            log.error("File upload failed", e);
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "파일 업로드에 실패했습니다.");
        }
    }
    
    /**
     * 파일 정보 조회
     */
    public FileResponse getFileById(Long id) {
        FileInfo fileInfo = fileRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.FILE_NOT_FOUND));
        return FileResponse.from(fileInfo, baseUrl);
    }
    
    /**
     * 참조 기준 파일 목록 조회
     */
    public List<FileResponse> getFilesByRef(String refType, Long refId) {
        List<FileInfo> files = fileRepository.findByRefTypeAndRefIdAndUseYn(refType, refId, "Y");
        return files.stream()
                .map(f -> FileResponse.from(f, baseUrl))
                .toList();
    }
    
    /**
     * 파일 삭제 (논리 삭제)
     */
    @Transactional
    public void deleteFile(Long id) {
        FileInfo fileInfo = fileRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.FILE_NOT_FOUND));
        fileInfo.deactivate();
    }
    
    // ── Private 메서드 ──
    
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "파일이 비어있습니다.");
        }
        // 최대 10MB
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "파일 크기는 10MB를 초과할 수 없습니다.");
        }
    }
    
    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
    
    private boolean isImage(String ext) {
        return ALLOWED_IMAGE_EXT.contains(ext.toLowerCase());
    }
    
    /**
     * 썸네일 생성 (가로 400px 비율 유지, JPG 품질 0.7)
     */
    private String generateThumbnail(Path originalPath, String datePath,
                                      String storedName, String ext) {
        try {
            BufferedImage originalImage = ImageIO.read(originalPath.toFile());
            if (originalImage == null) {
                log.warn("Cannot read image for thumbnail: {}", originalPath);
                return null;
            }
            
            int origWidth = originalImage.getWidth();
            int origHeight = originalImage.getHeight();
            
            // 비율 유지 축소 (원본이 400px 이하여도 썸네일 품질 압축 적용)
            int thumbWidth = Math.min(origWidth, THUMBNAIL_WIDTH);
            double ratio = (double) thumbWidth / origWidth;
            int thumbHeight = (int) (origHeight * ratio);
            
            BufferedImage thumbImage = new BufferedImage(thumbWidth, thumbHeight, BufferedImage.TYPE_INT_RGB);
            Graphics2D g2d = thumbImage.createGraphics();
            g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2d.drawImage(originalImage, 0, 0, thumbWidth, thumbHeight, null);
            g2d.dispose();
            
            // 포맷 결정 (gif/webp/bmp → png로 대체, 나머지 → jpg)
            String outputFormat = ext.equalsIgnoreCase("png") ? "png" : "jpg";
            if (ext.equalsIgnoreCase("gif") || ext.equalsIgnoreCase("webp") || ext.equalsIgnoreCase("bmp")) {
                outputFormat = "png";
            }
            
            String thumbExt = outputFormat;
            String thumbName = "thumb_" + storedName.substring(0, storedName.lastIndexOf('.')) + "." + thumbExt;
            String thumbPath = datePath + "/" + thumbName;
            Path thumbTargetPath = Paths.get(uploadDir, datePath, thumbName);
            
            if ("jpg".equals(outputFormat)) {
                // JPG: 압축 품질 0.7 (70%) 로 저장하여 용량 절감
                writeJpgWithQuality(thumbImage, thumbTargetPath.toFile(), 0.7f);
            } else {
                ImageIO.write(thumbImage, outputFormat, thumbTargetPath.toFile());
            }
            
            long originalSize = Files.size(originalPath);
            long thumbSize = Files.size(thumbTargetPath);
            log.info("Thumbnail created: {} ({}x{}) - original: {}KB, thumb: {}KB",
                    thumbPath, thumbWidth, thumbHeight,
                    originalSize / 1024, thumbSize / 1024);
            
            return thumbPath;
            
        } catch (IOException e) {
            log.error("Thumbnail generation failed", e);
            return null;
        }
    }
    
    /**
     * JPG 압축 품질을 지정하여 저장
     */
    private void writeJpgWithQuality(BufferedImage image, File output, float quality) throws IOException {
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
        if (!writers.hasNext()) {
            throw new IOException("No JPG writer available");
        }
        ImageWriter writer = writers.next();
        ImageWriteParam param = writer.getDefaultWriteParam();
        param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        param.setCompressionQuality(quality); // 0.0 ~ 1.0 (1.0 = 최고 품질)
        
        try (ImageOutputStream ios = ImageIO.createImageOutputStream(output)) {
            writer.setOutput(ios);
            writer.write(null, new IIOImage(image, null, null), param);
        } finally {
            writer.dispose();
        }
    }
}
