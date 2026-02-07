import React, { useState } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, InputNumber, Switch,
  message, Tag, Popconfirm, Card, Descriptions, DatePicker,
  Input as AntInput,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  SearchOutlined, ReloadOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor, Essentials, Bold, Italic, Underline, Strikethrough,
  Heading, Paragraph, Link, List, BlockQuote, Table as CKTable,
  TableToolbar, Indent, IndentBlock, MediaEmbed, Alignment,
  Font, HorizontalLine, SourceEditing, HtmlEmbed, Image,
  ImageToolbar, ImageCaption, ImageStyle, ImageResize, PasteFromOffice,
  CodeBlock, RemoveFormat, FindAndReplace, Highlight, PageBreak,
  SpecialCharacters, SpecialCharactersEssentials,
  GeneralHtmlSupport,
} from 'ckeditor5';
import dayjs from 'dayjs';
import {
  popupApi,
  PopupResponse,
  PopupCreateRequest,
  PopupUpdateRequest,
} from '../../api/endpoints/popup';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;

const PopupManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPopup, setSelectedPopup] = useState<PopupResponse | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [createEditorData, setCreateEditorData] = useState('');
  const [editEditorData, setEditEditorData] = useState('');

  // ── 데이터 조회 ──
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['popups', currentPage, pageSize, searchKeyword],
    queryFn: async () => {
      const res = searchKeyword
        ? await popupApi.search(searchKeyword, currentPage - 1, pageSize)
        : await popupApi.getAll(currentPage - 1, pageSize);
      return res.data.data;
    },
  });

  // ── Mutations ──
  const createMutation = useMutation({
    mutationFn: (data: PopupCreateRequest) => popupApi.create(data),
    onSuccess: (res) => {
      message.success(res.data.message || '팝업이 등록되었습니다');
      setIsCreateModalOpen(false);
      createForm.resetFields();
      setCreateEditorData('');
      queryClient.invalidateQueries({ queryKey: ['popups'] });
    },
    onError: () => message.error('팝업 등록에 실패했습니다'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PopupUpdateRequest }) =>
      popupApi.update(id, data),
    onSuccess: (res) => {
      message.success(res.data.message || '팝업이 수정되었습니다');
      setIsEditModalOpen(false);
      editForm.resetFields();
      setEditEditorData('');
      queryClient.invalidateQueries({ queryKey: ['popups'] });
    },
    onError: () => message.error('팝업 수정에 실패했습니다'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => popupApi.delete(id),
    onSuccess: () => {
      message.success('팝업이 삭제되었습니다');
      queryClient.invalidateQueries({ queryKey: ['popups'] });
    },
    onError: () => message.error('삭제에 실패했습니다'),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      active ? popupApi.activate(id) : popupApi.deactivate(id),
    onSuccess: () => {
      message.success('상태가 변경되었습니다');
      queryClient.invalidateQueries({ queryKey: ['popups'] });
    },
    onError: () => message.error('상태 변경에 실패했습니다'),
  });

  // ── CKEditor 설정 ──
  const editorConfig = {
    licenseKey: 'GPL',
    plugins: [
      Essentials, Bold, Italic, Underline, Strikethrough,
      Heading, Paragraph, Link, List, BlockQuote, CKTable,
      TableToolbar, Indent, IndentBlock, MediaEmbed, Alignment,
      Font, HorizontalLine, SourceEditing, HtmlEmbed, Image,
      ImageToolbar, ImageCaption, ImageStyle, ImageResize, PasteFromOffice,
      CodeBlock, RemoveFormat, FindAndReplace, Highlight, PageBreak,
      SpecialCharacters, SpecialCharactersEssentials,
      GeneralHtmlSupport,
    ],
    htmlSupport: {
      allow: [{ name: /.*/, attributes: true, classes: true, styles: true }],
    },
    toolbar: {
      items: [
        'heading', '|',
        'bold', 'italic', 'underline', 'strikethrough', '|',
        'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
        'alignment', '|',
        'bulletedList', 'numberedList', 'outdent', 'indent', '|',
        'link', 'blockQuote', 'insertTable', 'mediaEmbed', 'horizontalLine', '|',
        'codeBlock', 'htmlEmbed', 'specialCharacters', 'pageBreak', '|',
        'highlight', 'removeFormat', 'findAndReplace', '|',
        'sourceEditing', '|',
        'undo', 'redo',
      ],
      shouldNotGroupWhenFull: true,
    },
    table: { contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'] },
    language: 'ko',
  } as any;

  // ── 핸들러 ──
  const handleCreate = () => {
    createForm.validateFields().then((values) => {
      const dateRange = values.dateRange;
      createMutation.mutate({
        title: values.title,
        content: createEditorData,
        popupWidth: values.popupWidth,
        popupHeight: values.popupHeight,
        positionX: values.positionX,
        positionY: values.positionY,
        startDt: dateRange?.[0] ? dateRange[0].format('YYYY-MM-DDTHH:mm:ss') : undefined,
        endDt: dateRange?.[1] ? dateRange[1].format('YYYY-MM-DDTHH:mm:ss') : undefined,
        sortOrder: values.sortOrder,
      });
    });
  };

  const handleEdit = (record: PopupResponse) => {
    setSelectedPopup(record);
    editForm.setFieldsValue({
      title: record.title,
      popupWidth: record.popupWidth,
      popupHeight: record.popupHeight,
      positionX: record.positionX,
      positionY: record.positionY,
      sortOrder: record.sortOrder,
      dateRange: record.startDt && record.endDt
        ? [dayjs(record.startDt), dayjs(record.endDt)]
        : undefined,
    });
    setEditEditorData(record.content || '');
    setIsEditModalOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedPopup) return;
    editForm.validateFields().then((values) => {
      const dateRange = values.dateRange;
      updateMutation.mutate({
        id: selectedPopup.id,
        data: {
          title: values.title,
          content: editEditorData,
          popupWidth: values.popupWidth,
          popupHeight: values.popupHeight,
          positionX: values.positionX,
          positionY: values.positionY,
          startDt: dateRange?.[0] ? dateRange[0].format('YYYY-MM-DDTHH:mm:ss') : undefined,
          endDt: dateRange?.[1] ? dateRange[1].format('YYYY-MM-DDTHH:mm:ss') : undefined,
          sortOrder: values.sortOrder,
        },
      });
    });
  };

  const handleDetail = (record: PopupResponse) => {
    setSelectedPopup(record);
    setIsDetailModalOpen(true);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    refetch();
  };

  // ── 노출 상태 판단 ──
  const getExposureStatus = (record: PopupResponse) => {
    if (record.useYn !== 'Y') return { color: 'default', text: '미사용' };
    const now = dayjs();
    if (record.startDt && now.isBefore(dayjs(record.startDt))) return { color: 'orange', text: '대기' };
    if (record.endDt && now.isAfter(dayjs(record.endDt))) return { color: 'red', text: '종료' };
    return { color: 'green', text: '노출중' };
  };

  // ── 테이블 컬럼 ──
  const columns: ColumnsType<PopupResponse> = [
    {
      title: '번호',
      key: 'no',
      width: 70,
      align: 'center',
      render: (_: unknown, __: PopupResponse, index: number) =>
        (data?.totalElements || 0) - ((currentPage - 1) * pageSize + index),
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      onHeaderCell: () => ({ style: { textAlign: 'center' as const } }),
    },
    {
      title: '크기 (W×H)',
      key: 'size',
      width: 120,
      align: 'center',
      render: (_: unknown, record: PopupResponse) =>
        `${record.popupWidth || '-'} × ${record.popupHeight || '-'}`,
    },
    {
      title: '노출기간',
      key: 'period',
      width: 200,
      align: 'center',
      render: (_: unknown, record: PopupResponse) => {
        if (!record.startDt && !record.endDt) return '상시';
        const start = record.startDt ? dayjs(record.startDt).format('YY.MM.DD HH:mm') : '-';
        const end = record.endDt ? dayjs(record.endDt).format('YY.MM.DD HH:mm') : '-';
        return `${start} ~ ${end}`;
      },
    },
    {
      title: '노출상태',
      key: 'exposure',
      width: 90,
      align: 'center',
      render: (_: unknown, record: PopupResponse) => {
        const status = getExposureStatus(record);
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '사용',
      dataIndex: 'useYn',
      key: 'useYn',
      width: 90,
      align: 'center',
      render: (useYn: string, record: PopupResponse) => (
        <Switch
          checked={useYn === 'Y'}
          checkedChildren="사용"
          unCheckedChildren="미사용"
          onChange={(checked) =>
            toggleActiveMutation.mutate({ id: record.id, active: checked })
          }
        />
      ),
    },
    {
      title: '등록일',
      dataIndex: 'regDt',
      key: 'regDt',
      width: 110,
      align: 'center',
      render: (dt: string) => dt?.substring(0, 10),
    },
    {
      title: '관리',
      key: 'action',
      width: 150,
      align: 'center',
      render: (_: unknown, record: PopupResponse) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)} />
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="정말 삭제하시겠습니까?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="삭제"
            cancelText="취소"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ── 폼 공통 항목 렌더링 ──
  const renderFormFields = (
    isOpen: boolean,
    editorData: string,
    setEditorData: (v: string) => void,
  ) => (
    <>
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
        {isOpen && (
          <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}>
            <CKEditor
              editor={ClassicEditor}
              config={editorConfig}
              data={editorData}
              onChange={(_event, editor) => {
                setEditorData(editor.getData());
              }}
              onReady={(editor) => {
                const el = editor.editing.view.document.getRoot();
                if (el) {
                  editor.editing.view.change((writer) => {
                    writer.setStyle('min-height', '300px', el);
                  });
                }
              }}
            />
          </div>
        )}
      </Form.Item>
    </>
  );

  return (
    <div>
      <Card
        title="팝업 관리"
        extra={
          <Space>
            <AntInput.Search
              placeholder="제목 검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
              style={{ width: 280 }}
              allowClear
              onClear={() => {
                setSearchKeyword('');
                setCurrentPage(1);
                setTimeout(() => refetch(), 0);
              }}
            />
            <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                createForm.resetFields();
                setCreateEditorData('');
                setIsCreateModalOpen(true);
              }}
            >
              팝업 등록
            </Button>
          </Space>
        }
      >
        <Table
          bordered
          columns={columns}
          dataSource={data?.content}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize,
            total: data?.totalElements || 0,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}건`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          size="middle"
        />
      </Card>

      {/* ── 등록 모달 ── */}
      <Modal
        title="팝업 등록"
        open={isCreateModalOpen}
        onOk={handleCreate}
        onCancel={() => setIsCreateModalOpen(false)}
        width={960}
        okText="등록"
        cancelText="취소"
        confirmLoading={createMutation.isPending}
      >
        <Form form={createForm} layout="vertical">
          {renderFormFields(isCreateModalOpen, createEditorData, setCreateEditorData)}
        </Form>
      </Modal>

      {/* ── 수정 모달 ── */}
      <Modal
        title="팝업 수정"
        open={isEditModalOpen}
        onOk={handleUpdate}
        onCancel={() => setIsEditModalOpen(false)}
        width={960}
        okText="수정"
        cancelText="취소"
        confirmLoading={updateMutation.isPending}
      >
        <Form form={editForm} layout="vertical">
          {renderFormFields(isEditModalOpen, editEditorData, setEditEditorData)}
        </Form>
      </Modal>

      {/* ── 상세 모달 ── */}
      <Modal
        title="팝업 상세"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="edit" type="primary" onClick={() => {
            setIsDetailModalOpen(false);
            if (selectedPopup) handleEdit(selectedPopup);
          }}>
            수정
          </Button>,
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            닫기
          </Button>,
        ]}
        width={960}
      >
        {selectedPopup && (
          <>
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="ID">{selectedPopup.id}</Descriptions.Item>
              <Descriptions.Item label="제목">{selectedPopup.title}</Descriptions.Item>
              <Descriptions.Item label="크기">
                {selectedPopup.popupWidth} × {selectedPopup.popupHeight} px
              </Descriptions.Item>
              <Descriptions.Item label="위치">
                X: {selectedPopup.positionX}, Y: {selectedPopup.positionY}
              </Descriptions.Item>
              <Descriptions.Item label="노출기간" span={2}>
                {selectedPopup.startDt && selectedPopup.endDt
                  ? `${dayjs(selectedPopup.startDt).format('YYYY-MM-DD HH:mm')} ~ ${dayjs(selectedPopup.endDt).format('YYYY-MM-DD HH:mm')}`
                  : '상시'}
              </Descriptions.Item>
              <Descriptions.Item label="노출상태">
                <Tag color={getExposureStatus(selectedPopup).color}>
                  {getExposureStatus(selectedPopup).text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="정렬순서">{selectedPopup.sortOrder}</Descriptions.Item>
              <Descriptions.Item label="등록일">{selectedPopup.regDt?.substring(0, 19)}</Descriptions.Item>
              <Descriptions.Item label="수정일">{selectedPopup.modDt?.substring(0, 19)}</Descriptions.Item>
            </Descriptions>
            <Card title="내용 미리보기" size="small">
              <div
                className="ck-content"
                dangerouslySetInnerHTML={{ __html: selectedPopup.content || '<p>내용 없음</p>' }}
                style={{ minHeight: 200, padding: 16 }}
              />
            </Card>
          </>
        )}
      </Modal>
    </div>
  );
};

export default PopupManagement;
