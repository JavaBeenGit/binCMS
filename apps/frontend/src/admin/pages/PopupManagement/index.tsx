import React, { useState } from 'react';
import { Button, Space, Table, message } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { popupApi, PopupCreateRequest, PopupResponse, PopupUpdateRequest } from '@/shared/api/endpoints/popup';
import PageHeader from '@/admin/components/PageHeader';
import SearchBar from '@/admin/components/SearchBar';
import ListSummary from '@/admin/components/ListSummary';
import { buildPopupColumns } from './popupColumns';
import PopupFormModal, { PopupFormSubmit } from './PopupFormModal';
import PopupDetailModal from './PopupDetailModal';

const PAGE_SIZE = 10;

/**
 * 팝업 관리 — 목록·등록·수정·상세·사용 여부 토글
 */
const PopupManagement: React.FC = () => {
  const queryClient = useQueryClient();
  /** 1부터 시작하는 현재 페이지 */
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPopup, setSelectedPopup] = useState<PopupResponse | null>(null);

  // ── 데이터 조회 ──
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['popups', currentPage, PAGE_SIZE, searchKeyword],
    queryFn: async () => {
      const res = searchKeyword
        ? await popupApi.search(searchKeyword, currentPage - 1, PAGE_SIZE)
        : await popupApi.getAll(currentPage - 1, PAGE_SIZE);
      return res.data.data;
    },
  });

  const closeForm = () => setFormOpen(false);

  // ── Mutations ──
  const createMutation = useMutation({
    mutationFn: (data: PopupCreateRequest) => popupApi.create(data),
    onSuccess: (res) => {
      message.success(res.data.message || '팝업이 등록되었습니다');
      closeForm();
      queryClient.invalidateQueries({ queryKey: ['popups'] });
    },
    onError: () => message.error('팝업 등록에 실패했습니다'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PopupUpdateRequest }) => popupApi.update(id, data),
    onSuccess: (res) => {
      message.success(res.data.message || '팝업이 수정되었습니다');
      closeForm();
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

  // ── 핸들러 ──
  const openCreate = () => {
    setFormMode('create');
    setFormOpen(true);
  };

  const openEdit = (popup: PopupResponse) => {
    setDetailOpen(false);
    setSelectedPopup(popup);
    setFormMode('edit');
    setFormOpen(true);
  };

  const openDetail = (popup: PopupResponse) => {
    setSelectedPopup(popup);
    setDetailOpen(true);
  };

  const handleSubmit = (values: PopupFormSubmit) => {
    if (formMode === 'edit') {
      if (!selectedPopup) return;
      updateMutation.mutate({ id: selectedPopup.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const total = data?.totalElements || 0;
  const columns = buildPopupColumns({
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
        title="팝업 관리"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              팝업 등록
            </Button>
          </Space>
        }
      />

      <SearchBar
        placeholder="제목 검색"
        value={searchKeyword}
        onSearch={(k) => {
          setSearchKeyword(k);
          setCurrentPage(1);
        }}
      />

      <ListSummary total={total} page={currentPage - 1} pageSize={PAGE_SIZE} />
      <Table
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

      <PopupFormModal
        open={formOpen}
        mode={formMode}
        editing={formMode === 'edit' ? selectedPopup : null}
        loading={formMode === 'edit' ? updateMutation.isPending : createMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={closeForm}
      />
      <PopupDetailModal
        open={detailOpen}
        popup={selectedPopup}
        onClose={() => setDetailOpen(false)}
        onEdit={openEdit}
      />
    </div>
  );
};

export default PopupManagement;
