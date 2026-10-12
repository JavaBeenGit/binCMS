import React, { useEffect, useState } from 'react';
import { Modal, Select, Space } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons';
import type { InquiryResponse } from '@/shared/api/endpoints/inquiry';

interface InquiryStatusModalProps {
  open: boolean;
  inquiry: InquiryResponse | null;
  loading: boolean;
  onSubmit: (status: string) => void;
  onCancel: () => void;
}

/**
 * 상태 변경 모달. 열릴 때 현재 상태를 선택값으로 채운다.
 */
const InquiryStatusModal: React.FC<InquiryStatusModalProps> = ({ open, inquiry, loading, onSubmit, onCancel }) => {
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    if (open && inquiry) setStatus(inquiry.status);
  }, [open, inquiry]);

  return (
    <Modal
      title="상태 변경"
      open={open}
      onOk={() => onSubmit(status)}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="변경"
      cancelText="취소"
    >
      {inquiry && (
        <div>
          <p style={{ marginBottom: 16 }}>
            <strong>{inquiry.name}</strong>님의 문의 상태를 변경합니다.
          </p>
          <Select
            style={{ width: '100%' }}
            value={status}
            onChange={(val) => setStatus(val)}
          >
            <Select.Option value="PENDING">
              <Space><ClockCircleOutlined style={{ color: '#fa8c16' }} /> 대기</Space>
            </Select.Option>
            <Select.Option value="IN_PROGRESS">
              <Space><SyncOutlined style={{ color: '#1890ff' }} /> 처리중</Space>
            </Select.Option>
            <Select.Option value="COMPLETED">
              <Space><CheckCircleOutlined style={{ color: '#52c41a' }} /> 완료</Space>
            </Select.Option>
            <Select.Option value="CANCELLED">
              <Space><CloseCircleOutlined style={{ color: '#999' }} /> 취소</Space>
            </Select.Option>
          </Select>
        </div>
      )}
    </Modal>
  );
};

export default InquiryStatusModal;
