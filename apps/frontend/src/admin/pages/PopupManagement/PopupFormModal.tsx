import React, { useEffect, useState } from 'react';
import { DatePicker, Form, Input, InputNumber, Modal, Space } from 'antd';
import dayjs from 'dayjs';
import type { PopupCreateRequest, PopupResponse } from '@/shared/api/endpoints/popup';
import RichTextEditor from '@/admin/components/RichTextEditor';

const { RangePicker } = DatePicker;

/** 등록·수정 요청 본문이 같은 모양이라 등록 타입을 그대로 쓴다 */
export type PopupFormSubmit = PopupCreateRequest;

interface PopupFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  /** mode 가 edit 일 때 수정 대상 */
  editing: PopupResponse | null;
  loading: boolean;
  onSubmit: (values: PopupFormSubmit) => void;
  onCancel: () => void;
}

/**
 * 팝업 등록/수정 모달. 본문은 antd Form 밖의 state(CKEditor)로 관리한다.
 */
const PopupFormModal: React.FC<PopupFormModalProps> = ({ open, mode, editing, loading, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && editing) {
      form.setFieldsValue({
        title: editing.title,
        popupWidth: editing.popupWidth,
        popupHeight: editing.popupHeight,
        positionX: editing.positionX,
        positionY: editing.positionY,
        sortOrder: editing.sortOrder,
        dateRange: editing.startDt && editing.endDt
          ? [dayjs(editing.startDt), dayjs(editing.endDt)]
          : undefined,
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
      const dateRange = values.dateRange;
      onSubmit({
        title: values.title,
        content,
        popupWidth: values.popupWidth,
        popupHeight: values.popupHeight,
        positionX: values.positionX,
        positionY: values.positionY,
        startDt: dateRange?.[0] ? dateRange[0].format('YYYY-MM-DDTHH:mm:ss') : undefined,
        endDt: dateRange?.[1] ? dateRange[1].format('YYYY-MM-DDTHH:mm:ss') : undefined,
        sortOrder: values.sortOrder,
      });
    } catch {
      // 검증 실패 메시지는 antd Form 이 각 항목 아래에 표시한다
    }
  };

  return (
    <Modal
      title={mode === 'edit' ? '팝업 수정' : '팝업 등록'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={960}
      okText={mode === 'edit' ? '수정' : '등록'}
      cancelText="취소"
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="팝업 제목"
          rules={[{ required: true, message: '제목을 입력해주세요' }]}
        >
          <Input placeholder="팝업 제목" />
        </Form.Item>

        <Space size="large" style={{ width: '100%' }}>
          <Form.Item name="popupWidth" label="너비 (px)" initialValue={500}>
            <InputNumber min={100} max={2000} style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="popupHeight" label="높이 (px)" initialValue={400}>
            <InputNumber min={100} max={2000} style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="positionX" label="X 위치 (px)" initialValue={100}>
            <InputNumber min={0} style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="positionY" label="Y 위치 (px)" initialValue={100}>
            <InputNumber min={0} style={{ width: 120 }} />
          </Form.Item>
        </Space>

        <Space size="large" style={{ width: '100%' }}>
          <Form.Item name="dateRange" label="노출기간">
            <RangePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              placeholder={['시작일시', '종료일시']}
            />
          </Form.Item>
          <Form.Item name="sortOrder" label="정렬순서" initialValue={0}>
            <InputNumber min={0} style={{ width: 100 }} />
          </Form.Item>
        </Space>

        <Form.Item label="내용">
          {open && <RichTextEditor value={content} onChange={setContent} minHeight={300} />}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PopupFormModal;
