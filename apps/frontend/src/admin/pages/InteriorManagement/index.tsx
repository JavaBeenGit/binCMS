import React, { useState } from 'react';
import { Button, Pagination, Segmented, Space, Table, message } from 'antd';
import { AppstoreOutlined, PlusOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  interiorApi,
  InteriorCategory,
  InteriorCreateRequest,
  InteriorResponse,
  InteriorUpdateRequest,
} from '@/shared/api/endpoints/interior';
import PageHeader from '@/admin/components/PageHeader';
import SearchBar from '@/admin/components/SearchBar';
import ListSummary from '@/admin/components/ListSummary';
import { CATEGORY_MAP } from './interiorHelpers';
import { buildInteriorColumns } from './interiorColumns';
import InteriorGalleryGrid from './InteriorGalleryGrid';
import InteriorFormModal, { InteriorFormSubmit } from './InteriorFormModal';
import InteriorDetailModal from './InteriorDetailModal';

type ViewMode = 'gallery' | 'list';

interface InteriorManagementProps {
  /** ONSITE · SELF_TIP · STORY. 없으면 전체 카테고리 */
  category?: InteriorCategory;
}

/**
 * 인테리어 관리 — 현장시공 / 셀프시공 팁 / 인테리어스토리 (카테고리는 URL로 고정)
 */
const InteriorManagement: React.FC<InteriorManagementProps> = ({ category }) => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<InteriorResponse | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<InteriorResponse | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  // 갤러리 12개, 리스트 10개
  const pageSize = viewMode === 'gallery' ? 12 : 10;

  // 데이터 조회
  const { data: pageData, isLoading } = useQuery({
    queryKey: ['interiors', category, searchKeyword, currentPage, pageSize],
    queryFn: async () => {
      if (searchKeyword) return (await interiorApi.search(searchKeyword, category, currentPage, pageSize)).data;
      if (category) return (await interiorApi.getByCategory(category, currentPage, pageSize)).data;
      return (await interiorApi.getAll(currentPage, pageSize)).data;
    },
  });

  const items = pageData?.content || [];
  const total = pageData?.totalElements || 0;

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  // 생성
  const createMutation = useMutation({
    mutationFn: (data: InteriorCreateRequest) => interiorApi.create(data),
    onSuccess: () => {
      message.success('시공사례가 등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['interiors'] });
      closeForm();
    },
    onError: () => message.error('등록에 실패했습니다.'),
  });

  // 수정
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: InteriorUpdateRequest }) => interiorApi.update(id, data),
    onSuccess: () => {
      message.success('시공사례가 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['interiors'] });
      closeForm();
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

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (item: InteriorResponse) => {
    setDetailOpen(false);
    setEditing(item);
    setFormOpen(true);
  };

  const openDetail = (item: InteriorResponse) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  const handleSubmit = (values: InteriorFormSubmit) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: values });
    } else {
      createMutation.mutate({ category: category!, ...values });
    }
  };

  // 페이지 제목
  const pageTitle = category ? CATEGORY_MAP[category] : '인테리어 관리';

  const columns = buildInteriorColumns({
    showCategory: !category,
    total,
    page: currentPage,
    pageSize,
    onDetail: openDetail,
    onEdit: openEdit,
    onDelete: (id) => deleteMutation.mutate(id),
  });

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title={pageTitle}
        extra={
          <Space>
            <Segmented
              options={[
                { label: '갤러리', value: 'gallery', icon: <AppstoreOutlined /> },
                { label: '리스트', value: 'list', icon: <UnorderedListOutlined /> },
              ]}
              value={viewMode}
              onChange={(v) => {
                setViewMode(v as ViewMode);
                setCurrentPage(0);
              }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              등록
            </Button>
          </Space>
        }
      />

      <SearchBar placeholder="제목 또는 내용 검색" value={searchKeyword} onSearch={(k) => {
          setSearchKeyword(k);
          setCurrentPage(0); // 3페이지에서 검색하면 빈 결과가 보이던 것 방지
        }} />

      <ListSummary total={total} page={currentPage} pageSize={pageSize} />
      {viewMode === 'gallery' ? (
        <>
          <InteriorGalleryGrid
            items={items}
            showCategory={!category}
            isLoading={isLoading}
            onDetail={openDetail}
            onEdit={openEdit}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Pagination
              current={currentPage + 1}
              pageSize={pageSize}
              total={total}
              showSizeChanger={false}
              onChange={(page) => setCurrentPage(page - 1)}
            />
          </div>
        </>
      ) : (
        <Table
          bordered
          columns={columns}
          dataSource={items}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: currentPage + 1,
            pageSize,
            total,
            showSizeChanger: false,
            onChange: (page) => setCurrentPage(page - 1),
          }}
        />
      )}

      <InteriorFormModal
        open={formOpen}
        editing={editing}
        category={category}
        loading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={closeForm}
      />
      <InteriorDetailModal open={detailOpen} item={detailItem} onClose={() => setDetailOpen(false)} onEdit={openEdit} />
    </div>
  );
};

export default InteriorManagement;
