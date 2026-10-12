package com.bincms.domain.popup.service;

import com.bincms.common.dto.PageResponse;
import com.bincms.common.exception.BusinessException;
import com.bincms.common.exception.ErrorCode;
import com.bincms.domain.popup.dto.PopupCreateRequest;
import com.bincms.domain.popup.dto.PopupResponse;
import com.bincms.domain.popup.dto.PopupUpdateRequest;
import com.bincms.domain.popup.entity.Popup;
import com.bincms.domain.popup.repository.PopupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PopupService {

    private final PopupRepository popupRepository;

    @Transactional
    public PopupResponse createPopup(PopupCreateRequest request) {
        Popup popup = Popup.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .popupWidth(request.getPopupWidth())
                .popupHeight(request.getPopupHeight())
                .positionX(request.getPositionX())
                .positionY(request.getPositionY())
                .startDt(request.getStartDt())
                .endDt(request.getEndDt())
                .sortOrder(request.getSortOrder())
                .build();
        return PopupResponse.from(popupRepository.save(popup));
    }

    public PageResponse<PopupResponse> getAllPopups(Pageable pageable) {
        return PageResponse.of(
                popupRepository.findAllByOrderBySortOrderAscIdDesc(pageable)
                        .map(PopupResponse::from)
        );
    }

    public PageResponse<PopupResponse> searchPopups(String keyword, Pageable pageable) {
        return PageResponse.of(
                popupRepository.searchByKeyword(keyword, pageable)
                        .map(PopupResponse::from)
        );
    }

    public PopupResponse getPopupById(Long id) {
        Popup popup = popupRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.POPUP_NOT_FOUND));
        return PopupResponse.from(popup);
    }

    /** 현재 노출 대상인 활성 팝업 목록 */
    public List<PopupResponse> getActivePopups() {
        return popupRepository.findActivePopups(LocalDateTime.now())
                .stream()
                .map(PopupResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public PopupResponse updatePopup(Long id, PopupUpdateRequest request) {
        Popup popup = popupRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.POPUP_NOT_FOUND));
        popup.update(
                request.getTitle(),
                request.getContent(),
                request.getPopupWidth(),
                request.getPopupHeight(),
                request.getPositionX(),
                request.getPositionY(),
                request.getStartDt(),
                request.getEndDt(),
                request.getSortOrder()
        );
        return PopupResponse.from(popup);
    }

    @Transactional
    public void deletePopup(Long id) {
        Popup popup = popupRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.POPUP_NOT_FOUND));
        popupRepository.delete(popup);
    }

    @Transactional
    public PopupResponse activatePopup(Long id) {
        Popup popup = popupRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.POPUP_NOT_FOUND));
        popup.activate();
        return PopupResponse.from(popup);
    }

    @Transactional
    public PopupResponse deactivatePopup(Long id) {
        Popup popup = popupRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.POPUP_NOT_FOUND));
        popup.deactivate();
        return PopupResponse.from(popup);
    }
}
