import React, { useState } from 'react';
import { Select, Table, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  userMemberApi,
  type UserMemberResponse,
  type UserMemberUpdateRequest,
  type UserPasswordResetRequest,
} from '@/shared/api/endpoints/userMember';
import PageHeader from '@/admin/components/PageHeader';
import SearchBar from '@/admin/components/SearchBar';
import ListSummary from '@/admin/components/ListSummary';
import { buildUserColumns } from './userColumns';
import UserFormModal from './UserFormModal';
import UserPasswordModal from './UserPasswordModal';
import UserDetailModal from './UserDetailModal';

const { Option } = Select;

const PAGE_SIZE = 10;

/**
 * 사용자 관리 페이지 (관리자용)
 * - 등록 없음 (사용자가 직접 가입)
 * - 수정 가능 (아이디 제외)
 * - 비밀번호 초기화
 * - 활성화/비활성화(차단)
 */
const UserManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [providerFilter, setProviderFilter] = useState<string | undefined>(undefined);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

  // 모달 상태 — 세 모달이 같은 대상(selectedUser)을 본다
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserMemberResponse | null>(null);

  // ===== 데이터 조회 =====
  const { data, isLoading } = useQuery({
    queryKey: ['userMembers', page, PAGE_SIZE, keyword, providerFilter, activeFilter],
    queryFn: async () =>
      (await userMemberApi.getUserMembers(page, PAGE_SIZE, keyword || undefined, providerFilter, activeFilter)).data,
  });

  const members = data?.content || [];
  const total = data?.totalElements || 0;

  // ===== 뮤테이션 =====
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserMemberUpdateRequest }) => userMemberApi.updateUserMember(id, data),
    onSuccess: (res) => {
      message.success(res.message || '사용자 정보가 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['userMembers'] });
      setEditOpen(false);
    },
    onError: () => message.error('수정에 실패했습니다.'),
  });

  const resetPwMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserPasswordResetRequest }) => userMemberApi.resetPassword(id, data),
    onSuccess: (res) => {
      message.success(res.message || '비밀번호가 초기화되었습니다.');
      setPasswordOpen(false);
    },
    onError: () => message.error('비밀번호 초기화에 실패했습니다.'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => userMemberApi.deactivateUser(id),
    onSuccess: () => {
      message.success('사용자가 차단되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['userMembers'] });
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: number) => userMemberApi.activateUser(id),
    onSuccess: () => {
      message.success('사용자 차단이 해제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['userMembers'] });
    },
  });

  // ===== 핸들러 =====
  const openDetail = (user: UserMemberResponse) => {
    setSelectedUser(user);
    setDetailOpen(true);
  };

  const openEdit = (user: UserMemberResponse) => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  const openResetPassword = (user: UserMemberResponse) => {
    setSelectedUser(user);
    setPasswordOpen(true);
  };

  const handleEditSubmit = (values: UserMemberUpdateRequest) => {
    if (selectedUser) updateMutation.mutate({ id: selectedUser.id, data: values });
  };

  const handlePasswordSubmit = (values: UserPasswordResetRequest) => {
    if (selectedUser) resetPwMutation.mutate({ id: selectedUser.id, data: values });
  };

  const columns = buildUserColumns({
    total,
    page,
    pageSize: PAGE_SIZE,
    onDetail: openDetail,
    onEdit: openEdit,
    onResetPassword: openResetPassword,
    onActivate: (id) => activateMutation.mutate(id),
    onDeactivate: (id) => deactivateMutation.mutate(id),
  });

  return (
    <div style={{ padding: 24 }}>
      <PageHeader title="사용자 관리" />

      <SearchBar
        placeholder="이름, 아이디, 이메일 검색"
        value={keyword}
        onSearch={(k) => {
          setKeyword(k);
          setPage(0);
        }}
      >
        <Select
          placeholder="가입방식"
          allowClear
          style={{ width: 120 }}
          value={providerFilter}
          onChange={(val) => {
            setProviderFilter(val);
            setPage(0);
          }}
        >
          <Option value="LOCAL">이메일</Option>
          <Option value="KAKAO">카카오</Option>
          <Option value="NAVER">네이버</Option>
          <Option value="GOOGLE">구글</Option>
        </Select>
        <Select
          placeholder="상태"
          allowClear
          style={{ width: 100 }}
          value={activeFilter}
          onChange={(val) => {
            setActiveFilter(val);
            setPage(0);
          }}
        >
          <Option value={true}>정상</Option>
          <Option value={false}>차단</Option>
        </Select>
      </SearchBar>

      <ListSummary total={total} page={page} pageSize={PAGE_SIZE} />
      <Table
        columns={columns}
        dataSource={members}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: page + 1,
          pageSize: PAGE_SIZE,
          total,
          showSizeChanger: false,
          onChange: (p) => setPage(p - 1),
        }}
        size="middle"
        scroll={{ x: 1100 }}
      />

      <UserDetailModal
        open={detailOpen}
        user={selectedUser}
        onClose={() => setDetailOpen(false)}
        onEdit={(user) => {
          setDetailOpen(false);
          openEdit(user);
        }}
      />
      <UserFormModal
        open={editOpen}
        user={selectedUser}
        loading={updateMutation.isPending}
        onSubmit={handleEditSubmit}
        onCancel={() => setEditOpen(false)}
      />
      <UserPasswordModal
        open={passwordOpen}
        user={selectedUser}
        loading={resetPwMutation.isPending}
        onSubmit={handlePasswordSubmit}
        onCancel={() => setPasswordOpen(false)}
      />
    </div>
  );
};

export default UserManagement;
