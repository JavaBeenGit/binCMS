import React, { useState } from 'react';
import { Button, Space, Table, message } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  contentApi,
  ContentCreateRequest,
  ContentResponse,
  ContentUpdateRequest,
} from '@/shared/api/endpoints/content';
import PageHeader from '@/admin/components/PageHeader';
import SearchBar from '@/admin/components/SearchBar';
import ListSummary from '@/admin/components/ListSummary';
import { buildContentColumns } from './contentColumns';
import ContentFormModal, { ContentFormSubmit } from './ContentFormModal';
import ContentDetailModal from './ContentDetailModal';

const PAGE_SIZE = 10;

/**
 * 컨텐츠 관리 — 목록·등록·수정·상세·사용 여부 토글 (category 는 PAGE 고정)
 */
const ContentManagement: React.FC = () => {
  const queryClient = useQueryClient();
  /** 1부터 시작하는 현재 페이지 */
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentResponse | null>(null);

  // ── 데이터 조회 ──
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['contents', currentPage, PAGE_SIZE, searchKeyword],
    queryFn: async () => {
      const res = searchKeyword
        ? await contentApi.search(searchKeyword, currentPage - 1, PAGE_SIZE)
        : await contentApi.getAll(currentPage - 1, PAGE_SIZE);
      return res.data.data;
    },
  });

  const closeForm = () => setFormOpen(false);

  // ── Mutations ──
  const createMutation = useMutation({
    mutationFn: (data: ContentCreateRequest) => contentApi.create(data),
    onSuccess: (res) => {
      message.success(res.data.message || '컨텐츠가 등록되었습니다');
      closeForm();
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
    onError: () => message.error('컨텐츠 등록에 실패했습니다'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ContentUpdateRequest }) => contentApi.update(id, data),
    onSuccess: (res) => {
      message.success(res.data.message || '컨텐츠가 수정되었습니다');
      closeForm();
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

  // ── 핸들러 ──
  const openCreate = () => {
    setFormMode('create');
    setFormOpen(true);
  };

  const openEdit = (content: ContentResponse) => {
    setDetailOpen(false);
    setSelectedContent(content);
    setFormMode('edit');
    setFormOpen(true);
  };

  const openDetail = (content: ContentResponse) => {
    setSelectedContent(content);
    setDetailOpen(true);
  };

  const handleSubmit = (values: ContentFormSubmit) => {
    if (formMode === 'edit') {
      if (!selectedContent) return;
      updateMutation.mutate({ id: selectedContent.id, data: values });
    } else {
      createMutation.mutate(values as ContentCreateRequest);
    }
  };

  const total = data?.totalElements || 0;
  const columns = buildContentColumns({
    total,
    currentPage,
    pageSize: PAGE_SIZE,
    onDetail: openDetail,
    onEdit: openEdit,
    onDelete: (id) => deleteMutation.mutate(id),
    onToggleActive: (id, active) => toggleActiveMutation.mutate({ id, active }),
  });

  return (
    <div>
      <PageHeader
        title="컨텐츠 관리"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              컨텐츠 등록
            </Button>
          </Space>
        }
      />

      <SearchBar
        placeholder="제목, 키 검색"
        value={searchKeyword}
        onSearch={(k) => {
          setSearchKeyword(k);
          setCurrentPage(1);
        }}
      />

      <ListSummary total={total} page={currentPage - 1} pageSize={PAGE_SIZE} />
      <Table
        scroll={{ x: 'max-content' }}
        bordered
        columns={columns}
        dataSource={data?.content}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: currentPage,
          pageSize: PAGE_SIZE,
          total,
          showSizeChanger: false,
          onChange: (page) => setCurrentPage(page),
        }}
        size="middle"
      />

      <ContentFormModal
        open={formOpen}
        mode={formMode}
        editing={formMode === 'edit' ? selectedContent : null}
        loading={formMode === 'edit' ? updateMutation.isPending : createMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={closeForm}
      />
      <ContentDetailModal
        open={detailOpen}
        content={selectedContent}
        onClose={() => setDetailOpen(false)}
        onEdit={openEdit}
      />
    </div>
  );
};

export default ContentManagement;
