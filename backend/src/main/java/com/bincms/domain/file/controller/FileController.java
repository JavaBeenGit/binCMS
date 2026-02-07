package com.bincms.domain.file.controller;

import com.bincms.common.dto.ApiResponse;
import com.bincms.domain.file.dto.FileResponse;
import com.bincms.domain.file.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 파일 업로드 API 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileController {
    
    private final FileService fileService;
    
    /**
     * 파일 업로드
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FileResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "refType", required = false) String refType,
            @RequestParam(value = "refId", required = false) Long refId) {
        FileResponse response = fileService.upload(file, refType, refId);
        return ApiResponse.success(response, "파일이 업로드되었습니다");
    }
    
    /**
     * 파일 정보 조회
     */
    @GetMapping("/{id}")
    public ApiResponse<FileResponse> getFile(@PathVariable Long id) {
        FileResponse response = fileService.getFileById(id);
        return ApiResponse.success(response);
    }
    
    /**
     * 참조 기준 파일 목록
     */
    @GetMapping("/ref")
    public ApiResponse<List<FileResponse>> getFilesByRef(
            @RequestParam String refType,
            @RequestParam Long refId) {
        List<FileResponse> files = fileService.getFilesByRef(refType, refId);
        return ApiResponse.success(files);
    }
    
    /**
     * 파일 삭제
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteFile(@PathVariable Long id) {
        fileService.deleteFile(id);
        return ApiResponse.success(null, "파일이 삭제되었습니다");
    }
}
