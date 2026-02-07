import React, { useState } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, Switch,
  message, Tag, Popconfirm, Card, Descriptions, Tooltip, Input as AntInput,
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
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import {
  contentApi,
  ContentResponse,
  ContentCreateRequest,
  ContentUpdateRequest,
} from '../../api/endpoints/content';
import type { ColumnsType } from 'antd/es/table';

const ContentManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentResponse | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  // CKEditor 데이터를 별도 state로 관리 (Antd Form과 분리)
  const [createEditorData, setCreateEditorData] = useState('');
  const [editEditorData, setEditEditorData] = useState('');

  // ── 데이터 조회 ──
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['contents', currentPage, pageSize, searchKeyword],
    queryFn: async () => {
      const res = searchKeyword
        ? await contentApi.search(searchKeyword, currentPage - 1, pageSize)
        : await contentApi.getAll(currentPage - 1, pageSize);
      return res.data.data;
    },
  });

  // ── Mutations ──
  const createMutation = useMutation({
    mutationFn: (data: ContentCreateRequest) => contentApi.create(data),
    onSuccess: (res) => {
      message.success(res.data.message || '컨텐츠가 등록되었습니다');
      setIsCreateModalOpen(false);
      createForm.resetFields();
      setCreateEditorData('');
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
    onError: () => message.error('컨텐츠 등록에 실패했습니다'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ContentUpdateRequest }) =>
      contentApi.update(id, data),
    onSuccess: (res) => {
      message.success(res.data.message || '컨텐츠가 수정되었습니다');
      setIsEditModalOpen(false);
      editForm.resetFields();
      setEditEditorData('');
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
    onError: () => message.error('컨텐츠 수정에 실패했습니다'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => contentApi.delete(id),
    onSuccess: () => {
      message.success('컨텐츠가 삭제되었습니다');
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
    onError: () => message.error('삭제에 실패했습니다'),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      active ? contentApi.activate(id) : contentApi.deactivate(id),
    onSuccess: () => {
      message.success('상태가 변경되었습니다');
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
    onError: () => message.error('상태 변경에 실패했습니다'),
  });

  // ── CKEditor 설정 ──
  const editorConfig = {
    plugins: [
      Essentials, Bold, Italic, Underline, Strikethrough,
      Heading, Paragraph, Link, List, BlockQuote, CKTable,
      TableToolbar, Indent, IndentBlock, MediaEmbed, Alignment,
      Font, HorizontalLine, SourceEditing, HtmlEmbed, Image,
      ImageToolbar, ImageCaption, ImageStyle, ImageResize, PasteFromOffice,
      CodeBlock, RemoveFormat, FindAndReplace, Highlight, PageBreak,
      SpecialCharacters, SpecialCharactersEssentials,
    ],
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
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
    },
    language: 'ko',
  };

  // ── 핸들러 ──
  const handleCreate = () => {
    createForm.validateFields().then((values) => {
      createMutation.mutate({
        ...values,
        content: createEditorData,
        category: 'PAGE',
      });
    });
  };

  const handleEdit = (record: ContentResponse) => {
    setSelectedContent(record);
    editForm.setFieldsValue({
      title: record.title,
      description: record.description,
      sortOrder: record.sortOrder,
    });
    setEditEditorData(record.content || '');
    setIsEditModalOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedContent) return;
    editForm.validateFields().then((values) => {
      updateMutation.mutate({
        id: selectedContent.id,
        data: {
          ...values,
          content: editEditorData,
          category: 'PAGE',
        },
      });
    });
  };

  const handleDetail = (record: ContentResponse) => {
    setSelectedContent(record);
    setIsDetailModalOpen(true);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    refetch();
  };

  // ── 테이블 컬럼 ──
  const columns: ColumnsType<ContentResponse> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      align: 'center',
    },
    {
      title: '컨텐츠 키',
      dataIndex: 'contentKey',
      key: 'contentKey',
      width: 180,
      render: (text: string) => (
        <Tooltip title={text}>
          <Tag color="blue">{text}</Tag>
        </Tooltip>
      ),
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '조회수',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 80,
      align: 'center',
    },
    {
      title: '상태',
      dataIndex: 'useYn',
      key: 'useYn',
      width: 80,
      align: 'center',
      render: (useYn: string, record: ContentResponse) => (
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
      render: (_: unknown, record: ContentResponse) => (
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

  return (
    <div>
      <Card
        title="컨텐츠 관리"
        extra={
          <Space>
            <AntInput.Search
              placeholder="제목, 키 검색"
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
              컨텐츠 등록
            </Button>
          </Space>
        }
      >
        <Table
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
        title="컨텐츠 등록"
        open={isCreateModalOpen}
        onOk={handleCreate}
        onCancel={() => setIsCreateModalOpen(false)}
        width={960}
        okText="등록"
        cancelText="취소"
        confirmLoading={createMutation.isPending}
      >
        <Form form={createForm} layout="vertical">
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
            <Input.TextArea rows={2} placeholder="관리용 메모 (사용자에게 노출되지 않음)" />
          </Form.Item>
          <Form.Item label="내용">
            {isCreateModalOpen && (
              <CKEditor
                editor={ClassicEditor}
                config={editorConfig}
                data={createEditorData}
                onChange={(_event, editor) => {
                  setCreateEditorData(editor.getData());
                }}
              />
            )}
          </Form.Item>
        </Form>
      </Modal>

      {/* ── 수정 모달 ── */}
      <Modal
        title="컨텐츠 수정"
        open={isEditModalOpen}
        onOk={handleUpdate}
        onCancel={() => setIsEditModalOpen(false)}
        width={960}
        okText="수정"
        cancelText="취소"
        confirmLoading={updateMutation.isPending}
      >
        <Form form={editForm} layout="vertical">
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
            <Input.TextArea rows={2} placeholder="관리용 메모" />
          </Form.Item>
          <Form.Item label="내용">
            {isEditModalOpen && (
              <CKEditor
                editor={ClassicEditor}
                config={editorConfig}
                data={editEditorData}
                onChange={(_event, editor) => {
                  setEditEditorData(editor.getData());
                }}
              />
            )}
          </Form.Item>
        </Form>
      </Modal>

      {/* ── 상세 모달 ── */}
      <Modal
        title="컨텐츠 상세"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="edit" type="primary" onClick={() => {
            setIsDetailModalOpen(false);
            if (selectedContent) handleEdit(selectedContent);
          }}>
            수정
          </Button>,
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            닫기
          </Button>,
        ]}
        width={960}
      >
        {selectedContent && (
          <>
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="ID">{selectedContent.id}</Descriptions.Item>
              <Descriptions.Item label="컨텐츠 키">
                <Tag color="blue">{selectedContent.contentKey}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="제목" span={2}>{selectedContent.title}</Descriptions.Item>
              <Descriptions.Item label="조회수">{selectedContent.viewCount}</Descriptions.Item>
              <Descriptions.Item label="상태">
                <Tag color={selectedContent.useYn === 'Y' ? 'green' : 'red'}>
                  {selectedContent.useYn === 'Y' ? '사용' : '미사용'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="정렬순서">{selectedContent.sortOrder}</Descriptions.Item>
              <Descriptions.Item label="등록일">{selectedContent.regDt?.substring(0, 19)}</Descriptions.Item>
              <Descriptions.Item label="수정일">{selectedContent.modDt?.substring(0, 19)}</Descriptions.Item>
              {selectedContent.description && (
                <Descriptions.Item label="설명" span={2}>{selectedContent.description}</Descriptions.Item>
              )}
            </Descriptions>
            <Card title="내용 미리보기" size="small">
              <div
                className="ck-content"
                dangerouslySetInnerHTML={{ __html: selectedContent.content || '<p>내용 없음</p>' }}
                style={{ minHeight: 200, padding: 16 }}
              />
            </Card>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ContentManagement;
