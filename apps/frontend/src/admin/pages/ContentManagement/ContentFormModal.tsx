import React, { useEffect, useState } from 'react';
import { Form, Input, Modal } from 'antd';
import type { ContentResponse } from '@/shared/api/endpoints/content';
import RichTextEditor from '@/admin/components/RichTextEditor';

/** 등록이면 contentKey 포함, 수정이면 없음. category 는 항상 PAGE */
export interface ContentFormSubmit {
  contentKey?: string;
  title: string;
  description?: string;
  sortOrder?: number;
  content: string;
  category: string;
}

interface ContentFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  /** mode 가 edit 일 때 수정 대상 */
  editing: ContentResponse | null;
  loading: boolean;
  onSubmit: (values: ContentFormSubmit) => void;
  onCancel: () => void;
}

/**
 * 컨텐츠 등록/수정 모달. 본문은 antd Form 밖의 state(CKEditor)로 관리한다.
 * 컨텐츠 키는 등록할 때만 입력받는다(수정 불가).
 */
const ContentFormModal: React.FC<ContentFormModalProps> = ({ open, mode, editing, loading, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && editing) {
      form.setFieldsValue({
        title: editing.title,
        description: editing.description,
        sortOrder: editing.sortOrder,
      });
      setContent(editing.content || '');
    } else {
      form.resetFields();
      setContent('');
    }
  }, [open, mode, editing, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit({ ...values, content, category: 'PAGE' });
    } catch {
      // 검증 실패 메시지는 antd Form 이 각 항목 아래에 표시한다
    }
  };

  return (
    <Modal
      title={mode === 'edit' ? '컨텐츠 수정' : '컨텐츠 등록'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={960}
      okText={mode === 'edit' ? '수정' : '등록'}
      cancelText="취소"
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        {mode === 'create' && (
          <Form.Item
            name="contentKey"
            label="컨텐츠 키"
            rules={[
              { required: true, message: '컨텐츠 키를 입력해주세요' },
              { pattern: /^[a-zA-Z0-9_-]+$/, message: '영문, 숫자, _, - 만 사용 가능합니다' },
            ]}
            extra="고유 식별 키 (예: about-us, terms-of-service)"
          >
            <Input placeholder="예: about-us" />
          </Form.Item>
        )}
        <Form.Item
          name="title"
          label="제목"
          rules={[{ required: true, message: '제목을 입력해주세요' }]}
        >
          <Input placeholder="컨텐츠 제목" />
        </Form.Item>
        <Form.Item name="sortOrder" label="정렬순서" style={{ width: 120 }}>
          <Input type="number" placeholder="0" />
        </Form.Item>
        <Form.Item name="description" label="설명">
          <Input.TextArea
            rows={2}
            placeholder={mode === 'edit' ? '관리용 메모' : '관리용 메모 (사용자에게 노출되지 않음)'}
          />
        </Form.Item>
        <Form.Item label="내용">
          {open && <RichTextEditor value={content} onChange={setContent} minHeight={300} />}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ContentFormModal;
