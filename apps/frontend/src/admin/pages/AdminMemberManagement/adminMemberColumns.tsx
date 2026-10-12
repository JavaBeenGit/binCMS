import { Button, Popconfirm, Space, Tag, Tooltip } from 'antd';
import { CheckCircleOutlined, EditOutlined, KeyOutlined, StopOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { AdminMemberResponse } from '@/shared/api/endpoints/adminMember';

interface AdminMemberColumnHandlers {
  total: number;
  page: number;
  pageSize: number;
  onEdit: (member: AdminMemberResponse) => void;
  onPasswordReset: (member: AdminMemberResponse) => void;
  onActivate: (id: number) => void;
  onDeactivate: (id: number) => void;
}

const centerHeader = () => ({ style: { textAlign: 'center' as const } });

const ROLE_COLORS: Record<string, string> = {
  SYSTEM_ADMIN: 'red',
  OPERATION_ADMIN: 'blue',
  GENERAL_ADMIN: 'cyan',
  USER: 'default',
};

export function buildAdminMemberColumns(h: AdminMemberColumnHandlers): ColumnsType<AdminMemberResponse> {
  return [
    {
      title: '번호',
      key: 'no',
      width: 70,
      align: 'center',
      render: (_: unknown, __: AdminMemberResponse, index: number) => h.total - h.page * h.pageSize - index,
    },
    { title: '로그인 ID', dataIndex: 'loginId', key: 'loginId', width: 150, onHeaderCell: centerHeader },
    { title: '이름', dataIndex: 'name', key: 'name', width: 120, onHeaderCell: centerHeader },
    { title: '이메일', dataIndex: 'email', key: 'email', width: 200, ellipsis: true, onHeaderCell: centerHeader },
    { title: '전화번호', dataIndex: 'phoneNumber', key: 'phoneNumber', width: 140, onHeaderCell: centerHeader },
    {
      title: '권한',
      dataIndex: 'roleCode',
      key: 'roleCode',
      width: 100,
      align: 'center',
      render: (_: string, record: AdminMemberResponse) => (
        <Tag color={ROLE_COLORS[record.roleCode] || 'default'}>{record.roleName || record.roleCode}</Tag>
      ),
    },
    {
      title: '상태',
      dataIndex: 'active',
      key: 'active',
      width: 80,
      align: 'center',
      render: (active: boolean) => <Tag color={active ? 'green' : 'red'}>{active ? '활성' : '비활성'}</Tag>,
    },
    {
      title: '등록일',
      dataIndex: 'regDt',
      key: 'regDt',
      width: 160,
      onHeaderCell: centerHeader,
      render: (regDt: string) => (regDt ? new Date(regDt).toLocaleString('ko-KR') : '-'),
    },
    {
      title: '관리',
      key: 'action',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="수정">
            <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => h.onEdit(record)} />
          </Tooltip>
          <Tooltip title="비밀번호 초기화">
            <Button size="small" icon={<KeyOutlined />} onClick={() => h.onPasswordReset(record)} />
          </Tooltip>
          {record.active ? (
            <Popconfirm
              title="비활성화하시겠습니까?"
              description="해당 관리자는 로그인할 수 없게 됩니다."
              onConfirm={() => h.onDeactivate(record.id)}
              okText="예"
              cancelText="아니오"
            >
              <Tooltip title="비활성화">
                <Button size="small" danger icon={<StopOutlined />} />
              </Tooltip>
            </Popconfirm>
          ) : (
            <Tooltip title="활성화">
              <Button size="small" type="primary" ghost icon={<CheckCircleOutlined />} onClick={() => h.onActivate(record.id)} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];
}
