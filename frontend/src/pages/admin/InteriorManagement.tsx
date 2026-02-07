import React, { useState } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, InputNumber,
  message, Tag, Popconfirm, Card, Row, Col, Image, Segmented, Upload,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  AppstoreOutlined, UnorderedListOutlined, EyeOutlined, PictureOutlined,
  UploadOutlined, LoadingOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor, Essentials, Bold, Italic, Underline, Strikethrough,
  Heading, Paragraph, Link, List, BlockQuote, Table as CKTable,
  TableToolbar, Indent, IndentBlock, MediaEmbed, Alignment,
  Font, HorizontalLine, SourceEditing, HtmlEmbed, Image as CKImage,
  ImageToolbar, ImageCaption, ImageStyle, ImageResize, PasteFromOffice,
  CodeBlock, RemoveFormat, FindAndReplace, Highlight, PageBreak,
  SpecialCharacters, SpecialCharactersEssentials,
  GeneralHtmlSupport,
} from 'ckeditor5';
import {
  interiorApi,
  InteriorResponse,
  InteriorCreateRequest,
  InteriorUpdateRequest,
  InteriorCategory,
} from '../../api/endpoints/interior';
import type { ColumnsType } from 'antd/es/table';
import { fileApi } from '../../api/endpoints/file';

const CATEGORY_MAP: Record<InteriorCategory, string> = {
  ONSITE: '현장시공',
  SELF_TIP: '셀프시공 팁',
  STORY: '인테리어스토리',
};

interface InteriorManagementProps {
  category?: InteriorCategory;
}

const InteriorManagement: React.FC<InteriorManagementProps> = ({ category }) => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InteriorResponse | null>(null);
  const [selectedItem, setSelectedItem] = useState<InteriorResponse | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [editorData, setEditorData] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

  // CKEditor 설정
  const editorConfig = {
    licenseKey: 'GPL',
    plugins: [
      Essentials, Bold, Italic, Underline, Strikethrough,
      Heading, Paragraph, Link, List, BlockQuote, CKTable,
      TableToolbar, Indent, IndentBlock, MediaEmbed, Alignment,
      Font, HorizontalLine, SourceEditing, HtmlEmbed, CKImage,
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

  // 데이터 조회
  const { data: pageData, isLoading } = useQuery({
    queryKey: ['interiors', category, searchKeyword],
    queryFn: async () => {
      if (searchKeyword) {
        const res = await interiorApi.search(searchKeyword, category);
        return res.data;
      } else if (category) {
        const res = await interiorApi.getByCategory(category);
        return res.data;
      } else {
        const res = await interiorApi.getAll();
        return res.data;
      }
    },
  });

  const items = pageData?.content || [];

  // 생성
  const createMutation = useMutation({
    mutationFn: (data: InteriorCreateRequest) => interiorApi.create(data),
    onSuccess: () => {
      message.success('인테리어가 등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['interiors'] });
      handleCancel();
    },
    onError: () => message.error('등록에 실패했습니다.'),
  });

  // 수정
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: InteriorUpdateRequest }) =>
      interiorApi.update(id, data),
    onSuccess: () => {
      message.success('인테리어가 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['interiors'] });
      handleCancel();
    },
    onError: () => message.error('수정에 실패했습니다.'),
  });

  // 삭제
  const deleteMutation = useMutation({
    mutationFn: (id: number) => interiorApi.delete(id),
    onSuccess: () => {
      message.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['interiors'] });
    },
    onError: () => message.error('삭제에 실패했습니다.'),
  });

  // 핸들러
  const handleCreate = () => {
    setEditingItem(null);
    form.resetFields();
    setEditorData('');
    setThumbnailUrl(null);
    setThumbnailPreview(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: InteriorResponse) => {
    setEditingItem(item);
    form.setFieldsValue({
      title: item.title,
      sortOrder: item.sortOrder,
    });
    setEditorData(item.content || '');
    setThumbnailUrl(item.thumbnailUrl || null);
    setThumbnailPreview(item.thumbnailUrl || null);
    setIsModalOpen(true);
  };

  const handleDetail = (item: InteriorResponse) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    form.resetFields();
    setEditorData('');
    setThumbnailUrl(null);
    setThumbnailPreview(null);
  };

  const handleSubmit = async () => {
    try {
      if (!editorData.trim()) {
        message.warning('내용을 입력해주세요.');
        return;
      }
      const values = await form.validateFields();

      if (editingItem) {
        updateMutation.mutate({
          id: editingItem.id,
          data: {
            title: values.title,
            content: editorData,
            thumbnailUrl: thumbnailUrl || undefined,
            sortOrder: values.sortOrder,
          },
        });
      } else {
        createMutation.mutate({
          category: category!,
          title: values.title,
          content: editorData,
          thumbnailUrl: thumbnailUrl || undefined,
          sortOrder: values.sortOrder,
        });
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // 페이지 제목
  const pageTitle = category ? CATEGORY_MAP[category] : '인테리어 관리';

  // 썸네일 추출: thumbnailUrl이 없으면 content에서 첫 <img src> 추출
  const getThumbnail = (item: InteriorResponse): string | null => {
    if (item.thumbnailUrl) return item.thumbnailUrl;
    const match = item.content?.match(/<img[^>]+src="([^"]+)"/);
    return match ? match[1] : null;
  };

  // ── 갤러리 뷰 ──
  const renderGalleryView = () => (
    <Row gutter={[16, 16]}>
      {items.map((item: InteriorResponse) => {
        const thumb = getThumbnail(item);
        return (
          <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              cover={
                thumb ? (
                  <div style={{ height: 200, overflow: 'hidden' }}>
                    <img
                      alt={item.title}
                      src={thumb}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f5f5f5',
                      color: '#bbb',
                      fontSize: 48,
                    }}
                  >
                    <PictureOutlined />
                  </div>
                )
              }
              actions={[
                <EyeOutlined key="view" onClick={() => handleDetail(item)} />,
                <EditOutlined key="edit" onClick={() => handleEdit(item)} />,
                <Popconfirm
                  key="delete"
                  title="삭제하시겠습니까?"
                  onConfirm={() => deleteMutation.mutate(item.id)}
                  okText="예"
                  cancelText="아니오"
                >
                  <DeleteOutlined />
                </Popconfirm>,
              ]}
            >
              <Card.Meta
                title={item.title}
                description={
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    {!category && <Tag color="blue">{item.categoryName}</Tag>}
                    <span style={{ color: '#999', fontSize: 12 }}>
                      조회 {item.viewCount} · {new Date(item.regDt).toLocaleDateString('ko-KR')}
                    </span>
                  </Space>
                }
              />
            </Card>
          </Col>
        );
      })}
      {items.length === 0 && !isLoading && (
        <Col span={24}>
          <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
            등록된 인테리어가 없습니다.
          </div>
        </Col>
      )}
    </Row>
  );

  // ── 리스트(테이블) 뷰 ──
  const columns: ColumnsType<InteriorResponse> = [
    {
      title: '번호',
      key: 'index',
      width: 70,
      align: 'center',
      onHeaderCell: () => ({ style: { textAlign: 'center' } }),
      render: (_, __, idx) => idx + 1,
    },
    {
      title: '썸네일',
      key: 'thumbnail',
      width: 80,
      align: 'center',
      onHeaderCell: () => ({ style: { textAlign: 'center' } }),
      render: (_, record) => {
        const thumb = getThumbnail(record);
        return thumb ? (
          <Image src={thumb} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />
        ) : (
          <PictureOutlined style={{ fontSize: 24, color: '#ccc' }} />
        );
      },
    },
    ...(!category
      ? [{
          title: '카테고리',
          dataIndex: 'categoryName',
          key: 'categoryName',
          width: 120,
          onHeaderCell: () => ({ style: { textAlign: 'center' as const } }),
        }]
      : []),
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      onHeaderCell: () => ({ style: { textAlign: 'center' } }),
      render: (text, record) => (
        <a onClick={() => handleDetail(record)} style={{ color: '#1890ff' }}>
          {text}
        </a>
      ),
    },
    {
      title: '조회수',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 80,
      align: 'center',
      onHeaderCell: () => ({ style: { textAlign: 'center' } }),
    },
    {
      title: '정렬',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 70,
      align: 'center',
      onHeaderCell: () => ({ style: { textAlign: 'center' } }),
    },
    {
      title: '상태',
      dataIndex: 'useYn',
      key: 'useYn',
      width: 80,
      align: 'center',
      onHeaderCell: () => ({ style: { textAlign: 'center' } }),
      render: (v) => <Tag color={v === 'Y' ? 'green' : 'red'}>{v === 'Y' ? '사용' : '미사용'}</Tag>,
    },
    {
      title: '등록일',
      dataIndex: 'regDt',
      key: 'regDt',
      width: 120,
      onHeaderCell: () => ({ style: { textAlign: 'center' } }),
      render: (text) => new Date(text).toLocaleDateString('ko-KR'),
    },
    {
      title: '작업',
      key: 'action',
      width: 120,
      align: 'center',
      onHeaderCell: () => ({ style: { textAlign: 'center' } }),
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>
            수정
          </Button>
          <Popconfirm
            title="삭제하시겠습니까?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="예"
            cancelText="아니오"
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              삭제
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{pageTitle}</h2>
        <Space>
          <Segmented
            options={[
              { label: '갤러리', value: 'gallery', icon: <AppstoreOutlined /> },
              { label: '리스트', value: 'list', icon: <UnorderedListOutlined /> },
            ]}
            value={viewMode}
            onChange={(v) => setViewMode(v as 'gallery' | 'list')}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            등록
          </Button>
        </Space>
      </div>

      {/* 검색 */}
      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="제목 또는 내용 검색"
          style={{ width: 300 }}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onSearch={() => queryClient.invalidateQueries({ queryKey: ['interiors'] })}
          allowClear
        />
      </div>

      {/* 뷰 */}
      {viewMode === 'gallery' ? (
        renderGalleryView()
      ) : (
        <Table
          bordered
          columns={columns}
          dataSource={items}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: (pageData?.pageable?.pageNumber || 0) + 1,
            pageSize: pageData?.pageable?.pageSize || 20,
            total: pageData?.totalElements || 0,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}개`,
          }}
        />
      )}

      {/* 등록/수정 모달 */}
      <Modal
        title={editingItem ? '인테리어 수정' : '인테리어 등록'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={1000}
        okText={editingItem ? '수정' : '등록'}
        cancelText="취소"
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical">
          {!category && !editingItem && (
            <Form.Item label="카테고리">
              <Input value="카테고리는 하위 메뉴에서 자동 지정됩니다" disabled />
            </Form.Item>
          )}
          {editingItem && !category && (
            <Form.Item label="카테고리">
              <Input value={editingItem.categoryName} disabled />
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

          <Form.Item
            label="대표 이미지"
          >
            <Upload
              accept="image/*"
              showUploadList={false}
              customRequest={async ({ file, onSuccess, onError }) => {
                try {
                  setUploading(true);
                  const res = await fileApi.upload(file as File, 'INTERIOR');
                  const uploaded = res.data;
                  const apiBase = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8080';
                  const fullThumbUrl = uploaded.thumbnailUrl
                    ? apiBase + uploaded.thumbnailUrl
                    : apiBase + uploaded.fileUrl;
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
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'rgba(0,0,0,0.5)', color: '#fff',
                    textAlign: 'center', padding: '4px 0', borderRadius: '0 0 8px 8px',
                    fontSize: 12,
                  }}>
                    클릭하여 변경
                  </div>
                </div>
              ) : (
                <div style={{
                  width: 200, height: 150, border: '1px dashed #d9d9d9',
                  borderRadius: 8, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  background: '#fafafa',
                }}>
                  {uploading ? <LoadingOutlined /> : <UploadOutlined style={{ fontSize: 24, color: '#999' }} />}
                  <div style={{ marginTop: 8, color: '#999' }}>이미지 업로드</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item label="내용" required>
            <div className="interior-editor-wrapper">
              <style>{`.interior-editor-wrapper .ck-editor__editable { min-height: 400px; }`}</style>
              {isModalOpen && (
                <CKEditor
                  editor={ClassicEditor}
                  config={editorConfig}
                  data={editorData}
                  onChange={(_event, editor) => {
                    setEditorData(editor.getData());
                  }}
                />
              )}
            </div>
          </Form.Item>

          <Form.Item name="sortOrder" label="정렬 순서" initialValue={0}>
            <InputNumber min={0} style={{ width: 120 }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 상세보기 모달 */}
      <Modal
        title={selectedItem?.title || '상세보기'}
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        footer={[
          <Button key="edit" type="primary" onClick={() => { setIsDetailOpen(false); if (selectedItem) handleEdit(selectedItem); }}>
            수정
          </Button>,
          <Button key="close" onClick={() => setIsDetailOpen(false)}>
            닫기
          </Button>,
        ]}
        width={900}
      >
        {selectedItem && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Tag color="blue">{selectedItem.categoryName}</Tag>
                <span style={{ color: '#999' }}>
                  조회 {selectedItem.viewCount} · {new Date(selectedItem.regDt).toLocaleString('ko-KR')}
                </span>
              </Space>
            </div>
            {selectedItem.thumbnailUrl && (
              <div style={{ marginBottom: 16, textAlign: 'center' }}>
                <Image src={selectedItem.thumbnailUrl} style={{ maxHeight: 300, objectFit: 'contain' }} />
              </div>
            )}
            <div
              style={{
                border: '1px solid #f0f0f0',
                borderRadius: 8,
                padding: 24,
                minHeight: 200,
              }}
              dangerouslySetInnerHTML={{ __html: selectedItem.content }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InteriorManagement;
