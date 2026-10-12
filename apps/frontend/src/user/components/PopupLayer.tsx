import React, { useState, useEffect, useCallback } from 'react';
import { publicPopupApi } from '../../api/endpoints/public';
import { PopupResponse } from '../../api/endpoints/popup';
import { CloseOutlined } from '@ant-design/icons';
import './PopupLayer.css';

/** 쿠키에 팝업 ID를 저장해 오늘 하루동안 숨김 처리 */
const COOKIE_PREFIX = 'popup_dismiss_';

const setDismissCookie = (popupId: number) => {
  const now = new Date();
  // 자정까지 남은 시간 계산
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const expires = midnight.toUTCString();
  document.cookie = `${COOKIE_PREFIX}${popupId}=1; expires=${expires}; path=/`;
};

const isDismissed = (popupId: number): boolean => {
  return document.cookie.includes(`${COOKIE_PREFIX}${popupId}=1`);
};

const PopupLayer: React.FC = () => {
  const [popups, setPopups] = useState<PopupResponse[]>([]);

  useEffect(() => {
    const fetchPopups = async () => {
      try {
        const res = await publicPopupApi.getActive();
        if (res.success && res.data) {
          // 쿠키로 숨긴 팝업 필터링
          const visible = res.data.filter((p) => !isDismissed(p.id));
          setPopups(visible);
        }
      } catch (e) {
        // 팝업 실패 시 무시
      }
    };
    fetchPopups();
  }, []);

  const handleClose = useCallback((popupId: number) => {
    setPopups((prev) => prev.filter((p) => p.id !== popupId));
  }, []);

  const handleDismissToday = useCallback((popupId: number) => {
    setDismissCookie(popupId);
    setPopups((prev) => prev.filter((p) => p.id !== popupId));
  }, []);

  if (popups.length === 0) return null;

  return (
    <>
      {/* 오버레이 */}
      <div className="popup-overlay" />

      {popups.map((popup, index) => {
        const width = popup.popupWidth || 500;
        const height = popup.popupHeight || 400;

        return (
          <div
            key={popup.id}
            className="popup-layer"
            style={{
              width,
              maxHeight: '90vh',
              // 여러 팝업일 때 중앙 정렬 + 살짝 오프셋
              left: `calc(50% - ${width / 2}px + ${index * 30}px)`,
              top: `calc(50% - ${Math.min(height, window.innerHeight * 0.45)}px + ${index * 30}px)`,
              zIndex: 10000 + index,
            }}
          >
            {/* 헤더 */}
            <div className="popup-layer-header">
              <span className="popup-layer-title">{popup.title}</span>
              <button
                className="popup-layer-close"
                onClick={() => handleClose(popup.id)}
                aria-label="닫기"
              >
                <CloseOutlined />
              </button>
            </div>

            {/* 내용 */}
            <div
              className="popup-layer-content"
              style={{ minHeight: height - 100 }}
              dangerouslySetInnerHTML={{ __html: popup.content || '' }}
            />

            {/* 하단 버튼 */}
            <div className="popup-layer-footer">
              <button
                className="popup-dismiss-btn"
                onClick={() => handleDismissToday(popup.id)}
              >
                하루동안 열지 않기
              </button>
              <button
                className="popup-close-btn"
                onClick={() => handleClose(popup.id)}
              >
                닫기
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default PopupLayer;
