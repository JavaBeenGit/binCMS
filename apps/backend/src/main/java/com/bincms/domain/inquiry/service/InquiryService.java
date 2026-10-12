package com.bincms.domain.inquiry.service;

import com.bincms.common.dto.PageResponse;
import com.bincms.domain.inquiry.dto.InquiryCreateRequest;
import com.bincms.domain.inquiry.dto.InquiryResponse;
import com.bincms.domain.inquiry.entity.Inquiry;
import com.bincms.domain.inquiry.repository.InquiryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class InquiryService {

    private final InquiryRepository inquiryRepository;

    /**
     * 견적문의 등록 (공개 API)
     */
    @Transactional
    public InquiryResponse createInquiry(InquiryCreateRequest request) {
        Inquiry inquiry = Inquiry.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .inquiryType(request.getType())
                .budget(request.getBudget())
                .address(request.getAddress())
                .content(request.getContent())
                .status("PENDING")
                .build();

        Inquiry saved = inquiryRepository.save(inquiry);
        log.info("새 견적문의 등록 - ID: {}, 이름: {}, 연락처: {}", saved.getId(), saved.getName(), saved.getPhone());
        return InquiryResponse.from(saved);
    }

    /**
     * 견적문의 목록 조회 (관리자)
     */
    @Transactional(readOnly = true)
    public PageResponse<InquiryResponse> getInquiries(int page, int size) {
        Page<InquiryResponse> result = inquiryRepository
                .findAllByOrderByIdDesc(PageRequest.of(page, size))
                .map(InquiryResponse::from);
        return PageResponse.of(result);
    }

    /**
     * 견적문의 상태별 조회 (관리자)
     */
    @Transactional(readOnly = true)
    public PageResponse<InquiryResponse> getInquiriesByStatus(String status, int page, int size) {
        Page<InquiryResponse> result = inquiryRepository
                .findByStatusOrderByIdDesc(status, PageRequest.of(page, size))
                .map(InquiryResponse::from);
        return PageResponse.of(result);
    }

    /**
     * 견적문의 상세 조회 (관리자)
     */
    @Transactional(readOnly = true)
    public InquiryResponse getInquiry(Long id) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("견적문의를 찾을 수 없습니다. ID: " + id));
        return InquiryResponse.from(inquiry);
    }

    /**
     * 견적문의 상태 변경 (관리자)
     */
    @Transactional
    public InquiryResponse updateStatus(Long id, String status) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("견적문의를 찾을 수 없습니다. ID: " + id));
        inquiry.updateStatus(status);
        log.info("견적문의 상태 변경 - ID: {}, 상태: {}", id, status);
        return InquiryResponse.from(inquiry);
    }

    /**
     * 견적문의 메모 수정 (관리자)
     */
    @Transactional
    public InquiryResponse updateMemo(Long id, String memo) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("견적문의를 찾을 수 없습니다. ID: " + id));
        inquiry.updateAdminMemo(memo);
        return InquiryResponse.from(inquiry);
    }
}
