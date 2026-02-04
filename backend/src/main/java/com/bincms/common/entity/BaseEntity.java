package com.bincms.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import org.hibernate.annotations.Comment;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {
    
    @CreatedDate
    @Column(name = "REG_DT", nullable = false, updatable = false)
    @Comment("등록일시")
    private LocalDateTime regDt;
    
    @LastModifiedDate
    @Column(name = "MOD_DT", nullable = false)
    @Comment("수정일시")
    private LocalDateTime modDt;
    
    @CreatedBy
    @Column(name = "REG_NO", updatable = false, length = 100)
    @Comment("등록자")
    private String regNo;
    
    @LastModifiedBy
    @Column(name = "MOD_NO", length = 100)
    @Comment("수정자")
    private String modNo;
}
