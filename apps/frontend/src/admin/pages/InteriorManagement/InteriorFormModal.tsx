import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Modal, Upload, message } from 'antd';
import { LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import type { InteriorCategory, InteriorResponse } from '@/shared/api/endpoints/interior';
import { fileApi } from '@/shared/api/endpoints/file';
import RichTextEditor from '@/admin/components/RichTextEditor';
import { CATEGORY_MAP } from './interiorHelpers';

export interface InteriorFormSubmit {
  title: string;
  content: string;
  thumbnailUrl?: string;
  sortOrder?: number;
}

interface InteriorFormModalProps {
  open: boolean;
  /** null 이면 새 글 */
  editing: InteriorResponse | null;
  /** URL로 고정된 카테고리(하위 메뉴). 없으면 전체 화면 */
  category?: InteriorCategory;
  loading: boolean;
  onSubmit: (values: InteriorFormSubmit) => void;
  onCancel: () => void;
}

/**
 * 인테리어 등록/수정 모달. 본문(CKEditor)과 대표 이미지는 antd Form 밖의 state 로 관리한다.
 */
const InteriorFormModal: React.FC<InteriorFormModalProps> = ({ open, editing, category, loading, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [content, setContent] = useState('');
  // thumbnailUrl: 서버에 보낼 값(업로드 응답의 thumbnailUrl 우선) / thumbnailPreview: 폼에 보여 줄 원본 이미지
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // 열릴 때마다 비우고, 수정이면 기존 값을 채운다
  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (editing) {
      form.setFieldsValue({ title: editing.title, sortOrder: editing.sortOrder });
      setContent(editing.content || '');
      setThumbnailUrl(editing.thumbnailUrl || null);
      setThumbnailPreview(editing.thumbnailUrl || null);
    } else {
      setContent('');
      setThumbnailUrl(null);
      setThumbnailPreview(null);
    }
  }, [open, editing, form]);

  const handleOk = async () => {
    try {
      if (!content.trim()) {
        message.warning('내용을 입력해주세요.');
        return;
      }
      const values = await form.validateFields();
      onSubmit({
        title: values.title,
        content,
        thumbnailUrl: thumbnailUrl || undefined,
        sortOrder: values.sortOrder,
      });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={editing ? '시공사례 수정' : '시공사례 등록'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={1000}
      okText={editing ? '수정' : '등록'}
      cancelText="취소"
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        {!category && !editing && (
          <Form.Item label="카테고리">
            <Input value="카테고리는 하위 메뉴에서 자동 지정됩니다" disabled />
          </Form.Item>
        )}
        {editing && !category && (
          <Form.Item label="카테고리">
            <Input value={editing.categoryName} disabled />
          </Form.Item>
        )}
        {category && (
          <Form.Item label="카테고리">
            <Input value={CATEGORY_MAP[category]} disabled />
          </Form.Item>
        )}

        <Form.Item
          name="title"
          label="제목"
          rules={[
            { required: true, message: '제목을 입력해주세요.' },
            { max: 200, message: '제목은 200자 이내로 입력해주세요.' },
          ]}
        >
          <Input placeholder="제목을 입력하세요" />
        </Form.Item>

        <Form.Item label="대표 이미지">
          <Upload
            accept="image/*"
            showUploadList={false}
            customRequest={async ({ file, onSuccess, onError }) => {
              try {
                setUploading(true);
                const res = await fileApi.upload(file as File, 'INTERIOR');
                const uploaded = res.data;
                const apiBase = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8080';
                const fullThumbUrl = uploaded.thumbnailUrl ? apiBase + uploaded.thumbnailUrl : apiBase + uploaded.fileUrl;
                const fullFileUrl = apiBase + uploaded.fileUrl;
                setThumbnailUrl(fullThumbUrl);
                setThumbnailPreview(fullFileUrl);
                message.success('이미지가 업로드되었습니다.');
                onSuccess?.(uploaded);
              } catch (err) {
                message.error('이미지 업로드에 실패했습니다.');
                onError?.(err as Error);
              } finally {
                setUploading(false);
              }
            }}
          >
            {thumbnailPreview ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={thumbnailPreview}
                  alt="대표 이미지"
                  style={{ width: 200, height: 150, objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }}
                />
                <div
                  style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'rgba(0,0,0,0.5)', color: '#fff',
                    textAlign: 'center', padding: '4px 0', borderRadius: '0 0 8px 8px',
                    fontSize: 12,
                  }}
                >
                  클릭하여 변경
                </div>
              </div>
            ) : (
              <div
                style={{
                  width: 200, height: 150, border: '1px dashed #d9d9d9',
                  borderRadius: 8, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  background: '#fafafa',
                }}
              >
                {uploading ? <LoadingOutlined /> : <UploadOutlined style={{ fontSize: 24, color: '#999' }} />}
                <div style={{ marginTop: 8, color: '#999' }}>이미지 업로드</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item label="내용" required>
          {open && <RichTextEditor value={content} onChange={setContent} />}
        </Form.Item>

        <Form.Item name="sortOrder" label="정렬 순서" initialValue={0}>
          <InputNumber min={0} style={{ width: 120 }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InteriorFormModal;
