package com.bincms.domain.member.controller;

import com.bincms.common.dto.ApiResponse;
import com.bincms.domain.inquiry.repository.InquiryRepository;
import com.bincms.domain.interior.repository.InteriorRepository;
import com.bincms.domain.member.repository.MemberRepository;
import com.bincms.domain.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 관리자 대시보드 요약 숫자. 운영자가 로그인하자마자 "처리할 문의가 있는지"를 보게 하는 것이 목적.
 */
@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final MemberRepository memberRepository;
    private final PostRepository postRepository;
    private final InteriorRepository interiorRepository;
    private final InquiryRepository inquiryRepository;

    @GetMapping("/summary")
    @Transactional(readOnly = true)
    public ApiResponse<Map<String, Long>> summary() {
        Map<String, Long> data = new LinkedHashMap<>();
        data.put("members", memberRepository.count());
        data.put("posts", postRepository.countByUseYn("Y"));
        data.put("interiors", interiorRepository.countByUseYn("Y"));
        data.put("pendingInquiries", inquiryRepository.countByStatus("PENDING"));
        return ApiResponse.success(data);
    }
}
