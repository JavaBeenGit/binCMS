import React from 'react';
import { Button, Card, Descriptions, Modal, Tag } from 'antd';
import dayjs from 'dayjs';
import type { PopupResponse } from '@/shared/api/endpoints/popup';
import { getExposureStatus } from './popupStatus';

interface PopupDetailModalProps {
  open: boolean;
  popup: PopupResponse | null;
  onClose: () => void;
  onEdit: (popup: PopupResponse) => void;
}

const PopupDetailModal: React.FC<PopupDetailModalProps> = ({ open, popup, onClose, onEdit }) => (
  <Modal
    title="팝업 상세"
    open={open}
    onCancel={onClose}
    footer={[
      <Button key="edit" type="primary" onClick={() => popup && onEdit(popup)}>
        수정
      </Button>,
      <Button key="close" onClick={onClose}>
        닫기
      </Button>,
    ]}
    width={960}
  >
    {popup && (
      <>
        <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
          <Descriptions.Item label="ID">{popup.id}</Descriptions.Item>
          <Descriptions.Item label="제목">{popup.title}</Descriptions.Item>
          <Descriptions.Item label="크기">
            {popup.popupWidth} × {popup.popupHeight} px
          </Descriptions.Item>
          <Descriptions.Item label="위치">
            X: {popup.positionX}, Y: {popup.positionY}
          </Descriptions.Item>
          <Descriptions.Item label="노출기간" span={2}>
            {popup.startDt && popup.endDt
              ? `${dayjs(popup.startDt).format('YYYY-MM-DD HH:mm')} ~ ${dayjs(popup.endDt).format('YYYY-MM-DD HH:mm')}`
              : '상시'}
          </Descriptions.Item>
          <Descriptions.Item label="노출상태">
            <Tag color={getExposureStatus(popup).color}>{getExposureStatus(popup).text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="정렬순서">{popup.sortOrder}</Descriptions.Item>
          <Descriptions.Item label="등록일">{popup.regDt?.substring(0, 19)}</Descriptions.Item>
          <Descriptions.Item label="수정일">{popup.modDt?.substring(0, 19)}</Descriptions.Item>
        </Descriptions>
        <Card title="내용 미리보기" size="small">
          <div
            className="ck-content"
            dangerouslySetInnerHTML={{ __html: popup.content || '<p>내용 없음</p>' }}
            style={{ minHeight: 200, padding: 16 }}
          />
        </Card>
      </>
    )}
  </Modal>
);

export default PopupDetailModal;
