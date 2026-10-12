package com.bincms.domain.interior.service;

import com.bincms.common.dto.PageResponse;
import com.bincms.common.exception.BusinessException;
import com.bincms.common.exception.ErrorCode;
import com.bincms.domain.interior.dto.InteriorCreateRequest;
import com.bincms.domain.interior.dto.InteriorResponse;
import com.bincms.domain.interior.dto.InteriorUpdateRequest;
import com.bincms.domain.interior.entity.Interior;
import com.bincms.domain.interior.entity.InteriorCategory;
import com.bincms.domain.interior.repository.InteriorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 인테리어 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InteriorService {
    
    private final InteriorRepository interiorRepository;
    
    @Transactional
    public InteriorResponse create(InteriorCreateRequest request) {
        Interior interior = Interior.builder()
                .category(request.getCategory())
                .title(request.getTitle())
                .content(request.getContent())
                .thumbnailUrl(request.getThumbnailUrl())
                .sortOrder(request.getSortOrder())
                .build();
        
        Interior saved = interiorRepository.save(interior);
        return InteriorResponse.from(saved);
    }
    
    public PageResponse<InteriorResponse> getByCategory(InteriorCategory category, Pageable pageable) {
        Page<Interior> page = interiorRepository.findByCategoryAndUseYnOrderBySortOrderAscIdDesc(
                category, "Y", pageable);
        return PageResponse.of(page.map(InteriorResponse::from));
    }
    
    public PageResponse<InteriorResponse> getAll(Pageable pageable) {
        Page<Interior> page = interiorRepository.findByUseYnOrderBySortOrderAscIdDesc("Y", pageable);
        return PageResponse.of(page.map(InteriorResponse::from));
    }
    
    public PageResponse<InteriorResponse> search(InteriorCategory category, String keyword, Pageable pageable) {
        Page<Interior> page;
        if (category != null) {
            page = interiorRepository.searchByCategoryAndKeyword(category, "Y", keyword, pageable);
        } else {
            page = interiorRepository.searchByKeyword("Y", keyword, pageable);
        }
        return PageResponse.of(page.map(InteriorResponse::from));
    }
    
    @Transactional
    public InteriorResponse getById(Long id) {
        Interior interior = interiorRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.INTERIOR_NOT_FOUND));
        interior.increaseViewCount();
        return InteriorResponse.from(interior);
    }
    
    @Transactional
    public InteriorResponse update(Long id, InteriorUpdateRequest request) {
        Interior interior = interiorRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.INTERIOR_NOT_FOUND));
        interior.update(request.getTitle(), request.getContent(),
                request.getThumbnailUrl(), request.getSortOrder());
        return InteriorResponse.from(interior);
    }
    
    @Transactional
    public void delete(Long id) {
        Interior interior = interiorRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.INTERIOR_NOT_FOUND));
        interior.deactivate();
    }
}
