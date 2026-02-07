package com.bincms.domain.file.dto;

import com.bincms.domain.file.entity.FileInfo;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 파일 정보 응답 DTO
 */
@Getter
@Builder
public class FileResponse {
    
    private Long id;
    private String originalName;
    private String storedName;
    private String filePath;
    private String thumbnailPath;
    private String fileUrl;
    private String thumbnailUrl;
    private Long fileSize;
    private String contentType;
    private String fileExt;
    private String refType;
    private Long refId;
    private String useYn;
    private LocalDateTime regDt;
    
    public static FileResponse from(FileInfo fileInfo, String baseUrl) {
        return FileResponse.builder()
                .id(fileInfo.getId())
                .originalName(fileInfo.getOriginalName())
                .storedName(fileInfo.getStoredName())
                .filePath(fileInfo.getFilePath())
                .thumbnailPath(fileInfo.getThumbnailPath())
                .fileUrl(baseUrl + "/" + fileInfo.getFilePath())
                .thumbnailUrl(fileInfo.getThumbnailPath() != null
                        ? baseUrl + "/" + fileInfo.getThumbnailPath() : null)
                .fileSize(fileInfo.getFileSize())
                .contentType(fileInfo.getContentType())
                .fileExt(fileInfo.getFileExt())
                .refType(fileInfo.getRefType())
                .refId(fileInfo.getRefId())
                .useYn(fileInfo.getUseYn())
                .regDt(fileInfo.getRegDt())
                .build();
    }
}
