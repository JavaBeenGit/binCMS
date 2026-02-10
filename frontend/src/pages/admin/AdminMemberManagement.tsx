import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Tag, Popconfirm, Tooltip } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  StopOutlined,
  CheckCircleOutlined,
  KeyOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminMemberApi,
  roleApi,
  AdminMemberCreateRequest,
  AdminMemberUpdateRequest,
  AdminMemberResponse,
} from '../../api/endpoints/adminMember';
import type { ColumnsType } from 'antd/es/table';

const AdminMemberManagement: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<AdminMemberResponse | null>(null);
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const queryClient = useQueryClient();

  // 관리자 회원 목록 조회
  const { data: membersData, isLoading } = useQuery({
    queryKey: ['adminMembers', currentPage, pageSize, searchKeyword],
    queryFn: async () => {
      const response = await adminMemberApi.getAdminMembers(currentPage, pageSize, searchKeyword || undefined);
      return response.data;
    },
  });

  // 관리자 역할 목록 조회 (셀렉트박스용)
  const { data: rolesData } = useQuery({
    queryKey: ['adminRoles'],
    queryFn: async () => {
      const response = await roleApi.getAdminRoles();
      return response.data;
    },
  });

  // 관리자 회원 생성
  const createMutation = useMutation({
    mutationFn: (data: AdminMemberCreateRequest) => adminMemberApi.createAdminMember(data),
    onSuccess: () => {
      message.success('관리자 회원이 생성되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['adminMembers'] });
      setIsCreateModalOpen(false);
      createForm.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || '관리자 회원 생성에 실패했습니다.');
    },
  });

  // 관리자 회원 수정
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminMemberUpdateRequest }) =>
      adminMemberApi.updateAdminMember(id, data),
    onSuccess: () => {
      message.success('관리자 회원 정보가 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['adminMembers'] });
      setIsEditModalOpen(false);
      setEditingMember(null);
      editForm.resetFields();
    },
    onError: () => {
      message.error('관리자 회원 수정에 실패했습니다.');
    },
  });

  // 비밀번호 초기화
  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }: { id: number; newPassword: string }) =>
      adminMemberApi.resetPassword(id, { newPassword }),
    onSuccess: () => {
      message.success('비밀번호가 초기화되었습니다.');
      setIsPasswordModalOpen(false);
      setEditingMember(null);
      passwordForm.resetFields();
    },
    onError: () => {
      message.error('비밀번호 초기화에 실패했습니다.');
    },
  });

  // 비활성화
  const deactivateMutation = useMutation({
    mutationFn: (id: number) => adminMemberApi.deactivateAdminMember(id),
    onSuccess: () => {
      message.success('관리자 회원이 비활성화되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['adminMembers'] });
    },
    onError: () => {
      message.error('비활성화에 실패했습니다.');
    },
  });

  // 활성화
  const activateMutation = useMutation({
    mutationFn: (id: number) => adminMemberApi.activateAdminMember(id),
    onSuccess: () => {
      message.success('관리자 회원이 활성화되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['adminMembers'] });
    },
    onError: () => {
      message.error('활성화에 실패했습니다.');
    },
  });

  const handleSearch = () => {
    setSearchKeyword(keyword);
    setCurrentPage(0);
  };

  const handleCreate = () => {
    createForm.resetFields();
    createForm.setFieldsValue({ roleCode: 'GENERAL_ADMIN' });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (member: AdminMemberResponse) => {
    setEditingMember(member);
    editForm.setFieldsValue({
      name: member.name,
      email: member.email,
      phoneNumber: member.phoneNumber,
      roleCode: member.roleCode,
    });
    setIsEditModalOpen(true);
  };

  const handlePasswordReset = (member: AdminMemberResponse) => {
    setEditingMember(member);
    passwordForm.resetFields();
    setIsPasswordModalOpen(true);
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      createMutation.mutate(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleEditSubmit = async () => {
    if (!editingMember) return;
    try {
      const values = await editForm.validateFields();
      updateMutation.mutate({ id: editingMember.id, data: values });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!editingMember) return;
    try {
      const values = await passwordForm.validateFields();
      resetPasswordMutation.mutate({ id: editingMember.id, newPassword: values.newPassword });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns: ColumnsType<AdminMemberResponse> = [
    {
      title: '번호',
      key: 'no',
      width: 70,
      align: 'center',
      render: (_: unknown, __: AdminMemberResponse, index: number) =>
        (membersData?.totalElements || 0) - (currentPage * pageSize) - index,
    },
    {
      title: '로그인 ID',
      dataIndex: 'loginId',
      key: 'loginId',
      width: 150,
      onHeaderCell: () => ({ style: { textAlign: 'center' } }),
    },
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      onHeaderCell: () => ({ style: { textAlign: 'center' } }),
    },
    {
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: true,
      onHeaderCell: () => ({ style: { textAlign: 'center' } }),
    },
    {
      title: '전화번호',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 140,
      onHeaderCell: () => ({ style: { textAlign: 'center' } }),
    },
    {
      title: '권한',
      dataIndex: 'roleCode',
      key: 'roleCode',
      width: 100,
      align: 'center',
      render: (_: string, record: AdminMemberResponse) => {
        const colorMap: Record<string, string> = {
          'SYSTEM_ADMIN': 'red',
          'OPERATION_ADMIN': 'blue',
          'GENERAL_ADMIN': 'cyan',
          'USER': 'default',
        };
        const color = colorMap[record.roleCode] || 'default';
        return <Tag color={color}>{record.roleName || record.roleCode}</Tag>;
      },
    },
    {
      title: '상태',
      dataIndex: 'active',
      key: 'active',
      width: 80,
      align: 'center',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? '활성' : '비활성'}
        </Tag>
      ),
    },
    {
      title: '등록일',
      dataIndex: 'regDt',
      key: 'regDt',
      width: 160,
      onHeaderCell: () => ({ style: { textAlign: 'center' } }),
      render: (regDt: string) => regDt ? new Date(regDt).toLocaleString('ko-KR') : '-',
    },
    {
      title: '관리',
      key: 'action',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="수정">
            <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="비밀번호 초기화">
            <Button size="small" icon={<KeyOutlined />} onClick={() => handlePasswordReset(record)} />
          </Tooltip>
          {record.active ? (
            <Popconfirm
              title="비활성화하시겠습니까?"
              description="해당 관리자는 로그인할 수 없게 됩니다."
              onConfirm={() => deactivateMutation.mutate(record.id)}
              okText="예"
              cancelText="아니오"
            >
              <Tooltip title="비활성화">
                <Button size="small" danger icon={<StopOutlined />} />
              </Tooltip>
            </Popconfirm>
          ) : (
            <Tooltip title="활성화">
              <Button size="small" type="primary" ghost icon={<CheckCircleOutlined />}
                onClick={() => activateMutation.mutate(record.id)} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>관리자 회원 관리</h2>
        <Space>
          <Input
            placeholder="이름, 로그인ID, 이메일 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 250 }}
            suffix={<SearchOutlined onClick={handleSearch} style={{ cursor: 'pointer' }} />}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            관리자 추가
          </Button>
        </Space>
      </div>

      <div style={{ marginBottom: 8, color: '#666', fontSize: 14 }}>
        총 {membersData?.totalElements || 0}건 ({currentPage + 1}/{Math.max(1, Math.ceil((membersData?.totalElements || 0) / pageSize))} 페이지)
      </div>
      <Table
        bordered
        columns={columns}
        dataSource={membersData?.content || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: currentPage + 1,
          pageSize: pageSize,
          total: membersData?.totalElements || 0,
          showSizeChanger: false,
          onChange: (page) => setCurrentPage(page - 1),
        }}
      />

      {/* 관리자 생성 모달 */}
      <Modal
        title="관리자 회원 추가"
        open={isCreateModalOpen}
        onOk={handleCreateSubmit}
        onCancel={() => { setIsCreateModalOpen(false); createForm.resetFields(); }}
        okText="추가"
        cancelText="취소"
        width={600}
        confirmLoading={createMutation.isPending}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="loginId"
            label="로그인 ID"
            rules={[
              { required: true, message: '로그인 ID를 입력해주세요.' },
              { min: 4, max: 20, message: '4자 이상 20자 이하로 입력해주세요.' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: '영문, 숫자, 언더스코어만 사용 가능합니다.' },
            ]}
          >
            <Input placeholder="로그인 ID를 입력하세요" />
          </Form.Item>
          <Form.Item
            name="password"
            label="비밀번호"
            rules={[
              { required: true, message: '비밀번호를 입력해주세요.' },
              { min: 8, max: 20, message: '8자 이상 20자 이하로 입력해주세요.' },
            ]}
          >
            <Input.Password placeholder="비밀번호를 입력하세요" />
          </Form.Item>
          <Form.Item
            name="name"
            label="이름"
            rules={[
              { required: true, message: '이름을 입력해주세요.' },
              { min: 2, max: 50, message: '2자 이상 50자 이하로 입력해주세요.' },
            ]}
          >
            <Input placeholder="이름을 입력하세요" />
          </Form.Item>
          <Form.Item
            name="email"
            label="이메일"
            rules={[{ type: 'email', message: '올바른 이메일 형식이 아닙니다.' }]}
          >
            <Input placeholder="이메일을 입력하세요" />
          </Form.Item>
          <Form.Item name="phoneNumber" label="전화번호">
            <Input placeholder="010-1234-5678" />
          </Form.Item>
          <Form.Item
            name="roleCode"
            label="권한"
            rules={[{ required: true, message: '권한을 선택해주세요.' }]}
          >
            <Select>
              {rolesData?.map(role => (
                <Select.Option key={role.roleCode} value={role.roleCode}>{role.roleName}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 관리자 수정 모달 */}
      <Modal
        title="관리자 회원 수정"
        open={isEditModalOpen}
        onOk={handleEditSubmit}
        onCancel={() => { setIsEditModalOpen(false); setEditingMember(null); editForm.resetFields(); }}
        okText="수정"
        cancelText="취소"
        width={600}
        confirmLoading={updateMutation.isPending}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item label="로그인 ID">
            <Input value={editingMember?.loginId} disabled />
          </Form.Item>
          <Form.Item
            name="name"
            label="이름"
            rules={[
              { required: true, message: '이름을 입력해주세요.' },
              { min: 2, max: 50, message: '2자 이상 50자 이하로 입력해주세요.' },
            ]}
          >
            <Input placeholder="이름을 입력하세요" />
          </Form.Item>
          <Form.Item
            name="email"
            label="이메일"
            rules={[{ type: 'email', message: '올바른 이메일 형식이 아닙니다.' }]}
          >
            <Input placeholder="이메일을 입력하세요" />
          </Form.Item>
          <Form.Item name="phoneNumber" label="전화번호">
            <Input placeholder="010-1234-5678" />
          </Form.Item>
          <Form.Item
            name="roleCode"
            label="권한"
            rules={[{ required: true, message: '권한을 선택해주세요.' }]}
          >
            <Select>
              {rolesData?.map(role => (
                <Select.Option key={role.roleCode} value={role.roleCode}>{role.roleName}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 비밀번호 초기화 모달 */}
      <Modal
        title={`비밀번호 초기화 - ${editingMember?.name} (${editingMember?.loginId})`}
        open={isPasswordModalOpen}
        onOk={handlePasswordSubmit}
        onCancel={() => { setIsPasswordModalOpen(false); setEditingMember(null); passwordForm.resetFields(); }}
        okText="초기화"
        cancelText="취소"
        width={500}
        confirmLoading={resetPasswordMutation.isPending}
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            name="newPassword"
            label="새 비밀번호"
            rules={[
              { required: true, message: '새 비밀번호를 입력해주세요.' },
              { min: 8, max: 20, message: '8자 이상 20자 이하로 입력해주세요.' },
            ]}
          >
            <Input.Password placeholder="새 비밀번호를 입력하세요" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="비밀번호 확인"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '비밀번호 확인을 입력해주세요.' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('비밀번호가 일치하지 않습니다.'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="비밀번호를 다시 입력하세요" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminMemberManagement;
