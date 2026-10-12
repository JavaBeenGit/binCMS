package com.bincms.domain.file.entity;

import com.bincms.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

/**
 * 파일 정보 엔티티
 */
@Entity
@Table(name = "TB_FILES", indexes = {
    @Index(name = "IDX_FILES_REF", columnList = "REF_TYPE, REF_ID")
})
@Comment("파일 정보")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FileInfo extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("파일 ID")
    private Long id;
    
    @Column(name = "ORIGINAL_NAME", nullable = false, length = 500)
    @Comment("원본 파일명")
    private String originalName;
    
    @Column(name = "STORED_NAME", nullable = false, length = 500)
    @Comment("저장 파일명")
    private String storedName;
    
    @Column(name = "FILE_PATH", nullable = false, length = 1000)
    @Comment("파일 저장 경로")
    private String filePath;
    
    @Column(name = "THUMBNAIL_PATH", length = 1000)
    @Comment("썸네일 경로")
    private String thumbnailPath;
    
    @Column(name = "FILE_SIZE", nullable = false)
    @Comment("파일 크기(bytes)")
    private Long fileSize;
    
    @Column(name = "CONTENT_TYPE", nullable = false, length = 100)
    @Comment("MIME 타입")
    private String contentType;
    
    @Column(name = "FILE_EXT", length = 20)
    @Comment("파일 확장자")
    private String fileExt;
    
    @Column(name = "REF_TYPE", length = 50)
    @Comment("참조 타입 (INTERIOR, POST 등)")
    private String refType;
    
    @Column(name = "REF_ID")
    @Comment("참조 ID")
    private Long refId;
    
    @Column(name = "USE_YN", nullable = false, length = 1)
    @Comment("사용 여부")
    private String useYn;
    
    @Builder
    public FileInfo(String originalName, String storedName, String filePath,
                    String thumbnailPath, Long fileSize, String contentType,
                    String fileExt, String refType, Long refId) {
        this.originalName = originalName;
        this.storedName = storedName;
        this.filePath = filePath;
        this.thumbnailPath = thumbnailPath;
        this.fileSize = fileSize;
        this.contentType = contentType;
        this.fileExt = fileExt;
        this.refType = refType;
        this.refId = refId;
        this.useYn = "Y";
    }
    
    public void updateRef(String refType, Long refId) {
        this.refType = refType;
        this.refId = refId;
    }
    
    public void deactivate() {
        this.useYn = "N";
    }
}
