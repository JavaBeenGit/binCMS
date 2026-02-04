package com.bincms.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
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
    private LocalDateTime regDt;
    
    @LastModifiedDate
    @Column(name = "MOD_DT", nullable = false)
    private LocalDateTime modDt;
    
    @CreatedBy
    @Column(name = "REG_NO", updatable = false, length = 100)
    private String regNo;
    
    @LastModifiedBy
    @Column(name = "MOD_NO", length = 100)
    private String modNo;
}
