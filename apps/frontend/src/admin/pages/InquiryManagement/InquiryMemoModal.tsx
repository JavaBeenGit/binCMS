import React, { useEffect, useState } from 'react';
import { Input, Modal } from 'antd';
import type { InquiryResponse } from '@/shared/api/endpoints/inquiry';

const { TextArea } = Input;

interface InquiryMemoModalProps {
  open: boolean;
  inquiry: InquiryResponse | null;
  loading: boolean;
  onSubmit: (memo: string) => void;
  onCancel: () => void;
}

/**
 * 관리자 메모 모달. 열릴 때 기존 메모를 입력창에 채운다.
 */
const InquiryMemoModal: React.FC<InquiryMemoModalProps> = ({ open, inquiry, loading, onSubmit, onCancel }) => {
  const [memo, setMemo] = useState<string>('');

  useEffect(() => {
    if (open && inquiry) setMemo(inquiry.adminMemo || '');
  }, [open, inquiry]);

  return (
    <Modal
      title="관리자 메모"
      open={open}
      onOk={() => onSubmit(memo)}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="저장"
      cancelText="취소"
    >
      {inquiry && (
        <div>
          <p style={{ marginBottom: 8 }}>
            <strong>{inquiry.name}</strong>님의 문의에 대한 관리자 메모
          </p>
          <TextArea
            rows={5}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="처리 내용, 메모 등을 입력하세요"
          />
        </div>
      )}
    </Modal>
  );
};

export default InquiryMemoModal;
