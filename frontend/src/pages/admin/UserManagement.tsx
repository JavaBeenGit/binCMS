import React, { useState } from 'react';
import {
  Table, Button, Input, Space, Tag, Modal, Form, message, Popconfirm,
  Descriptions, Select, Tooltip, Card
} from 'antd';
import {
  SearchOutlined, EditOutlined, LockOutlined, StopOutlined,
  CheckCircleOutlined, EyeOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import {
  userMemberApi,
  type UserMemberResponse,
  type UserMemberUpdateRequest,
  type UserPasswordResetRequest
} from '../../api/endpoints/userMember';

const { Option } = Select;

/**
 * 사용자 관리 페이지 (관리자용)
 * - 등록 없음 (사용자가 직접 가입)
 * - 수정 가능 (아이디 제외)
 * - 비밀번호 초기화
 * - 활성화/비활성화
 */
const UserManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [providerFilter, setProviderFilter] = useState<string | undefined>(undefined);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // 모달 상태
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserMemberResponse | null>(null);

  const [editForm] = Form.useForm();
  const [pwForm] = Form.useForm();

  // ===== 데이터 조회 =====
  const { data, isLoading } = useQuery({
    queryKey: ['userMembers', currentPage, pageSize, searchKeyword, providerFilter, activeFilter],
    queryFn: () => userMemberApi.getUserMembers(currentPage, pageSize, searchKeyword || undefined, providerFilter, activeFilter),
  });

  const members = data?.data?.content || [];
  const totalElements = data?.data?.totalElements || 0;

  // ===== 뮤테이션 =====
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserMemberUpdateRequest }) =>
      userMemberApi.updateUserMember(id, data),
    onSuccess: (res) => {
      message.success(res.message || '사용자 정보가 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['userMembers'] });
      setEditModalOpen(false);
    },
    onError: () => message.error('수정에 실패했습니다.'),
  });

  const resetPwMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserPasswordResetRequest }) =>
      userMemberApi.resetPassword(id, data),
    onSuccess: (res) => {
      message.success(res.message || '비밀번호가 초기화되었습니다.');
      setPwModalOpen(false);
      pwForm.resetFields();
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
  const handleSearch = () => {
    setSearchKeyword(keyword);
    setCurrentPage(0);
  };

  const handleDetail = (record: UserMemberResponse) => {
    setSelectedUser(record);
    setDetailModalOpen(true);
  };

  const handleEdit = (record: UserMemberResponse) => {
    setSelectedUser(record);
    editForm.setFieldsValue({
      name: record.name,
      email: record.email || '',
      phoneNumber: record.phoneNumber || '',
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = () => {
    editForm.validateFields().then((values) => {
      if (selectedUser) {
        updateMutation.mutate({ id: selectedUser.id, data: values });
      }
    });
  };

  const handleResetPw = (record: UserMemberResponse) => {
    setSelectedUser(record);
    pwForm.resetFields();
    setPwModalOpen(true);
  };

  const handleResetPwSubmit = () => {
    pwForm.validateFields().then((values) => {
      if (selectedUser) {
        resetPwMutation.mutate({ id: selectedUser.id, data: values });
      }
    });
  };

  const getProviderTag = (provider: string) => {
    switch (provider) {
      case 'LOCAL': return <Tag color="blue">이메일</Tag>;
      case 'KAKAO': return <Tag color="gold">카카오</Tag>;
      case 'NAVER': return <Tag color="green">네이버</Tag>;
      case 'GOOGLE': return <Tag color="red">구글</Tag>;
      default: return <Tag>{provider}</Tag>;
    }
  };

  // ===== 테이블 컬럼 =====
  const columns: ColumnsType<UserMemberResponse> = [
    {
      title: 'No',
      width: 60,
      align: 'center',
      render: (_, __, index) => totalElements - (currentPage * pageSize) - index,
    },
    {
      title: '아이디',
      dataIndex: 'loginId',
      key: 'loginId',
      width: 180,
      ellipsis: true,
    },
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: true,
      render: (email: string) => email || '-',
    },
    {
      title: '가입방식',
      dataIndex: 'provider',
      key: 'provider',
      width: 100,
      align: 'center',
      render: (provider: string) => getProviderTag(provider),
    },
    {
      title: '전화번호',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 140,
      render: (phone: string) => phone || '-',
    },
    {
      title: '상태',
      dataIndex: 'active',
      key: 'active',
      width: 80,
      align: 'center',
      render: (active: boolean) =>
        active ? <Tag color="success">정상</Tag> : <Tag color="error">차단</Tag>,
    },
    {
      title: '가입일',
      dataIndex: 'regDt',
      key: 'regDt',
      width: 110,
      render: (dt: string) => dt ? new Date(dt).toLocaleDateString('ko-KR') : '-',
    },
    {
      title: '관리',
      key: 'actions',
      width: 200,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="상세보기">
            <Button size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)} />
          </Tooltip>
          <Tooltip title="수정">
            <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="비밀번호 초기화">
            <Button
              size="small"
              icon={<LockOutlined />}
              onClick={() => handleResetPw(record)}
              disabled={record.provider !== 'LOCAL'}
            />
          </Tooltip>
          {record.active ? (
            <Popconfirm
              title="차단"
              description={`${record.name} 사용자를 차단하시겠습니까?`}
              onConfirm={() => deactivateMutation.mutate(record.id)}
              okText="확인"
              cancelText="취소"
            >
              <Tooltip title="차단">
                <Button size="small" danger icon={<StopOutlined />} />
              </Tooltip>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="차단해제"
              description={`${record.name} 사용자를 차단해제하시겠습니까?`}
              onConfirm={() => activateMutation.mutate(record.id)}
              okText="확인"
              cancelText="취소"
            >
              <Tooltip title="차단해제">
                <Button size="small" type="primary" ghost icon={<CheckCircleOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="사용자 관리"
        extra={
          <Space>
            <Select
              placeholder="가입방식"
              allowClear
              style={{ width: 120 }}
              value={providerFilter}
              onChange={(val) => { setProviderFilter(val); setCurrentPage(0); }}
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
              onChange={(val) => { setActiveFilter(val); setCurrentPage(0); }}
            >
              <Option value={true}>정상</Option>
              <Option value={false}>차단</Option>
            </Select>
            <Input
              placeholder="이름, 아이디, 이메일 검색"
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 240 }}
              allowClear
            />
            <Button type="primary" onClick={handleSearch}>검색</Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={members}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: currentPage + 1,
            pageSize,
            total: totalElements,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}명`,
            onChange: (page, size) => {
              setCurrentPage(page - 1);
              setPageSize(size);
            },
          }}
          size="middle"
          scroll={{ x: 1100 }}
        />
      </Card>

      {/* 상세 보기 모달 */}
      <Modal
        title="사용자 상세 정보"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="edit" type="primary" onClick={() => { setDetailModalOpen(false); if (selectedUser) handleEdit(selectedUser); }}>
            수정
          </Button>,
          <Button key="close" onClick={() => setDetailModalOpen(false)}>닫기</Button>,
        ]}
        width={600}
      >
        {selectedUser && (
          <Descriptions bordered column={1} size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label="아이디">{selectedUser.loginId}</Descriptions.Item>
            <Descriptions.Item label="이름">{selectedUser.name}</Descriptions.Item>
            <Descriptions.Item label="이메일">{selectedUser.email || '-'}</Descriptions.Item>
            <Descriptions.Item label="전화번호">{selectedUser.phoneNumber || '-'}</Descriptions.Item>
            <Descriptions.Item label="가입방식">{getProviderTag(selectedUser.provider)}</Descriptions.Item>
            <Descriptions.Item label="이메일 인증">
              {selectedUser.emailVerified ? <Tag color="success">인증됨</Tag> : <Tag color="warning">미인증</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="상태">
              {selectedUser.active ? <Tag color="success">정상</Tag> : <Tag color="error">차단</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="가입일">
              {selectedUser.regDt ? new Date(selectedUser.regDt).toLocaleString('ko-KR') : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 수정 모달 */}
      <Modal
        title={`사용자 수정 - ${selectedUser?.loginId}`}
        open={editModalOpen}
        onOk={handleEditSubmit}
        onCancel={() => setEditModalOpen(false)}
        confirmLoading={updateMutation.isPending}
        okText="저장"
        cancelText="취소"
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="아이디">
            <Input value={selectedUser?.loginId} disabled />
          </Form.Item>
          <Form.Item
            name="name"
            label="이름"
            rules={[
              { required: true, message: '이름을 입력해주세요' },
              { min: 2, max: 50, message: '이름은 2자 이상 50자 이하여야 합니다' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="이메일"
            rules={[{ type: 'email', message: '올바른 이메일 형식이 아닙니다' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label="전화번호"
            rules={[{ pattern: /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, message: '올바른 전화번호 형식이 아닙니다' }]}
          >
            <Input placeholder="010-0000-0000" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 비밀번호 초기화 모달 */}
      <Modal
        title={`비밀번호 초기화 - ${selectedUser?.loginId}`}
        open={pwModalOpen}
        onOk={handleResetPwSubmit}
        onCancel={() => setPwModalOpen(false)}
        confirmLoading={resetPwMutation.isPending}
        okText="초기화"
        cancelText="취소"
      >
        <Form form={pwForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="newPassword"
            label="새 비밀번호"
            rules={[
              { required: true, message: '새 비밀번호를 입력해주세요' },
              { min: 8, max: 20, message: '비밀번호는 8자 이상 20자 이하여야 합니다' },
            ]}
          >
            <Input.Password placeholder="8자 이상 입력" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="비밀번호 확인"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '비밀번호를 다시 입력해주세요' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('비밀번호가 일치하지 않습니다'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="비밀번호 확인" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
