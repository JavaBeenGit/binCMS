package com.bincms.domain.inquiry.repository;

import com.bincms.domain.inquiry.entity.Inquiry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    Page<Inquiry> findAllByOrderByIdDesc(Pageable pageable);

    Page<Inquiry> findByStatusOrderByIdDesc(String status, Pageable pageable);
}
