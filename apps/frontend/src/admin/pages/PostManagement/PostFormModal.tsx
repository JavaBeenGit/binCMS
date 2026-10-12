import React, { useEffect, useState } from 'react';
import { Form, Input, Modal, Select, Switch, message } from 'antd';
import type { PostResponse } from '@/shared/api/endpoints/post';
import type { BoardResponse } from '@/shared/api/endpoints/board';
import RichTextEditor from '@/admin/components/RichTextEditor';

export interface PostFormSubmit {
  boardId?: number;
  title: string;
  noticeYn: 'Y' | 'N';
  content: string;
}

interface PostFormModalProps {
  open: boolean;
  /** null 이면 새 글 */
  editing: PostResponse | null;
  boards?: BoardResponse[];
  /** 게시판이 URL로 고정된 화면(공지/FAQ/자유)이면 이름만 보여 주고 선택은 받지 않는다 */
  fixedBoardName?: string;
  loading: boolean;
  onSubmit: (values: PostFormSubmit) => void;
  onCancel: () => void;
}

/**
 * 게시글 작성/수정 모달. 본문은 antd Form 밖의 state(CKEditor)로 관리한다.
 */
const PostFormModal: React.FC<PostFormModalProps> = ({ open, editing, boards, fixedBoardName, loading, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.setFieldsValue({ boardId: editing.boardId, title: editing.title, noticeYn: editing.noticeYn === 'Y' });
      setContent(editing.content || '');
    } else {
      form.resetFields();
      setContent('');
    }
  }, [open, editing, form]);

  const handleOk = async () => {
    if (!content.trim()) {
      message.warning('내용을 입력해주세요.');
      return;
    }
    try {
      const values = await form.validateFields();
      onSubmit({ boardId: values.boardId, title: values.title, noticeYn: values.noticeYn ? 'Y' : 'N', content });
    } catch {
      // 검증 실패 메시지는 antd Form 이 각 항목 아래에 표시한다
    }
  };

  return (
    <Modal
      title={editing ? '게시글 수정' : '게시글 작성'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      width={1000}
      okText={editing ? '수정' : '작성'}
      cancelText="취소"
    >
      <Form form={form} layout="vertical" initialValues={{ noticeYn: false }}>
        {fixedBoardName ? (
          <Form.Item label="게시판">
            <Input value={fixedBoardName} disabled />
          </Form.Item>
        ) : (
          <Form.Item name="boardId" label="게시판" rules={[{ required: true, message: '게시판을 선택해주세요.' }]}>
            <Select
              placeholder="게시판 선택"
              disabled={!!editing}
              options={boards?.map((b) => ({ label: b.boardName, value: b.id }))}
            />
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

        <Form.Item label="내용" required>
          {open && <RichTextEditor value={content} onChange={setContent} />}
        </Form.Item>

        <Form.Item name="noticeYn" label="공지글" valuePropName="checked">
          <Switch checkedChildren="공지" unCheckedChildren="일반" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PostFormModal;
