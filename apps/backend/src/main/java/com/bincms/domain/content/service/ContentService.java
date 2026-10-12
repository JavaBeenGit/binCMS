package com.bincms.domain.content.service;

import com.bincms.common.dto.PageResponse;
import com.bincms.common.exception.BusinessException;
import com.bincms.common.exception.ErrorCode;
import com.bincms.domain.content.dto.ContentCreateRequest;
import com.bincms.domain.content.dto.ContentResponse;
import com.bincms.domain.content.dto.ContentUpdateRequest;
import com.bincms.domain.content.entity.Content;
import com.bincms.domain.content.repository.ContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContentService {

    private final ContentRepository contentRepository;

    /**
     * 컨텐츠 생성
     */
    @Transactional
    public ContentResponse createContent(ContentCreateRequest request) {
        if (contentRepository.existsByContentKey(request.getContentKey())) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "이미 사용중인 컨텐츠 키입니다: " + request.getContentKey());
        }

        Content content = Content.builder()
                .contentKey(request.getContentKey())
                .title(request.getTitle())
                .content(request.getContent())
                .category("PAGE")
                .description(request.getDescription())
                .sortOrder(request.getSortOrder())
                .build();

        return ContentResponse.from(contentRepository.save(content));
    }

    /**
     * 컨텐츠 목록 조회 (관리자 - 전체)
     */
    public PageResponse<ContentResponse> getAllContents(Pageable pageable) {
        return PageResponse.of(
                contentRepository.findAllByOrderBySortOrderAscIdDesc(pageable)
                        .map(ContentResponse::from)
        );
    }

    /**
     * 컨텐츠 목록 조회 (사용중인 것만)
     */
    public PageResponse<ContentResponse> getActiveContents(Pageable pageable) {
        return PageResponse.of(
                contentRepository.findByUseYnOrderBySortOrderAscIdDesc("Y", pageable)
                        .map(ContentResponse::from)
        );
    }

    /**
     * 카테고리별 컨텐츠 조회
     */
    public PageResponse<ContentResponse> getContentsByCategory(String category, Pageable pageable) {
        return PageResponse.of(
                contentRepository.findByCategoryAndUseYnOrderBySortOrderAscIdDesc(category, "Y", pageable)
                        .map(ContentResponse::from)
        );
    }

    /**
     * 컨텐츠 검색
     */
    public PageResponse<ContentResponse> searchContents(String keyword, Pageable pageable) {
        return PageResponse.of(
                contentRepository.searchByKeyword("Y", keyword, pageable)
                        .map(ContentResponse::from)
        );
    }

    /**
     * 컨텐츠 단건 조회 (ID)
     */
    public ContentResponse getContentById(Long id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.CONTENT_NOT_FOUND));
        return ContentResponse.from(content);
    }

    /**
     * 컨텐츠 단건 조회 (컨텐츠 키) - 프론트엔드 표시용
     */
    @Transactional
    public ContentResponse getContentByKey(String contentKey) {
        Content content = contentRepository.findByContentKey(contentKey)
                .orElseThrow(() -> new BusinessException(ErrorCode.CONTENT_NOT_FOUND,
                        "컨텐츠를 찾을 수 없습니다: " + contentKey));
        content.increaseViewCount();
        return ContentResponse.from(content);
    }

    /**
     * 컨텐츠 수정
     */
    @Transactional
    public ContentResponse updateContent(Long id, ContentUpdateRequest request) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.CONTENT_NOT_FOUND));

        content.update(
                request.getTitle(),
                request.getContent(),
                "PAGE",
                request.getDescription(),
                request.getSortOrder()
        );

        return ContentResponse.from(content);
    }

    /**
     * 컨텐츠 삭제 (소프트 삭제)
     */
    @Transactional
    public void deleteContent(Long id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.CONTENT_NOT_FOUND));
        content.deactivate();
    }

    /**
     * 컨텐츠 활성화
     */
    @Transactional
    public ContentResponse activateContent(Long id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.CONTENT_NOT_FOUND));
        content.activate();
        return ContentResponse.from(content);
    }

    /**
     * 컨텐츠 비활성화
     */
    @Transactional
    public ContentResponse deactivateContent(Long id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.CONTENT_NOT_FOUND));
        content.deactivate();
        return ContentResponse.from(content);
    }
}
