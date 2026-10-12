package com.bincms.domain.file.repository;

import com.bincms.domain.file.entity.FileInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 파일 정보 Repository
 */
@Repository
public interface FileRepository extends JpaRepository<FileInfo, Long> {
    
    List<FileInfo> findByRefTypeAndRefIdAndUseYn(String refType, Long refId, String useYn);
    
    List<FileInfo> findByIdInAndUseYn(List<Long> ids, String useYn);
}
