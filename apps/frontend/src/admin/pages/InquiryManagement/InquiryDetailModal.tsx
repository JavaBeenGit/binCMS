import React from 'react';
import { Button, Descriptions, Modal, Space, Tag } from 'antd';
import { EnvironmentOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { InquiryResponse } from '@/shared/api/endpoints/inquiry';
import { BUDGET_MAP, STATUS_MAP, TYPE_MAP } from './inquiryLabels';

interface InquiryDetailModalProps {
  open: boolean;
  /** 상세 조회 결과(아직 없으면 목록의 행) */
  inquiry: InquiryResponse | null;
  onClose: () => void;
  onChangeStatus: (inquiry: InquiryResponse) => void;
  onEditMemo: (inquiry: InquiryResponse) => void;
}

const InquiryDetailModal: React.FC<InquiryDetailModalProps> = ({ open, inquiry, onClose, onChangeStatus, onEditMemo }) => (
  <Modal
    title={
      <Space>
        <span>견적문의 상세</span>
        {inquiry && (
          <Tag
            icon={STATUS_MAP[inquiry.status]?.icon}
            color={STATUS_MAP[inquiry.status]?.color}
          >
            {STATUS_MAP[inquiry.status]?.label || inquiry.status}
          </Tag>
        )}
      </Space>
    }
    open={open}
    onCancel={onClose}
    footer={[
      <Button key="status" onClick={() => { onClose(); if (inquiry) onChangeStatus(inquiry); }}>
        상태변경
      </Button>,
      <Button key="memo" onClick={() => { onClose(); if (inquiry) onEditMemo(inquiry); }}>
        메모 작성
      </Button>,
      <Button key="close" type="primary" onClick={onClose}>
        닫기
      </Button>,
    ]}
    width={700}
  >
    {inquiry && (
      <Descriptions bordered column={2} size="small" style={{ marginTop: 16 }}>
        <Descriptions.Item label={<Space><UserOutlined /> 이름</Space>}>
          <strong>{inquiry.name}</strong>
        </Descriptions.Item>
        <Descriptions.Item label={<Space><PhoneOutlined /> 연락처</Space>}>
          <a href={`tel:${inquiry.phone}`}>{inquiry.phone}</a>
        </Descriptions.Item>
        <Descriptions.Item label={<Space><MailOutlined /> 이메일</Space>} span={2}>
          {inquiry.email ? <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a> : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="시공유형">
          <Tag color="blue">{TYPE_MAP[inquiry.inquiryType] || inquiry.inquiryType}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="예상 예산">
          {inquiry.budget ? (BUDGET_MAP[inquiry.budget] || inquiry.budget) : '-'}
        </Descriptions.Item>
        <Descriptions.Item label={<Space><EnvironmentOutlined /> 시공 장소</Space>} span={2}>
          {inquiry.address || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="문의 내용" span={2}>
          <div style={{ whiteSpace: 'pre-wrap', minHeight: 60 }}>
            {inquiry.content}
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="관리자 메모" span={2}>
          <div style={{ whiteSpace: 'pre-wrap', minHeight: 40, color: inquiry.adminMemo ? '#333' : '#ccc' }}>
            {inquiry.adminMemo || '메모 없음'}
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="접수일시">
          {inquiry.regDt ? dayjs(inquiry.regDt).format('YYYY-MM-DD HH:mm:ss') : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="수정일시">
          {inquiry.modDt ? dayjs(inquiry.modDt).format('YYYY-MM-DD HH:mm:ss') : '-'}
        </Descriptions.Item>
      </Descriptions>
    )}
  </Modal>
);

export default InquiryDetailModal;
