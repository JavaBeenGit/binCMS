import { Badge, Button, Popconfirm, Space, Tag, Tooltip } from 'antd';
import { CheckCircleOutlined, DeleteOutlined, EditOutlined, EyeOutlined, StopOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { RoleResponse } from '@/shared/api/endpoints/adminMember';

interface RoleColumnHandlers {
  /** 번호 열은 전체 건수에서 역순으로 매긴다 (페이지네이션 없음) */
  total: number;
  onDetail: (role: RoleResponse) => void;
  onEdit: (role: RoleResponse) => void;
  onActivate: (id: number) => void;
  onDeactivate: (id: number) => void;
  onDelete: (id: number) => void;
}

const centerHeader = () => ({ style: { textAlign: 'center' as const } });

const ROLE_COLORS: Record<string, string> = {
  SYSTEM_ADMIN: 'red',
  OPERATION_ADMIN: 'blue',
  GENERAL_ADMIN: 'cyan',
  USER: 'default',
};

// 기본 역할(USER·SYSTEM_ADMIN)은 비활성화·삭제 버튼을 보이지 않는다
const isDefaultRole = (roleCode: string) => ['USER', 'SYSTEM_ADMIN'].includes(roleCode);

export function buildRoleColumns(h: RoleColumnHandlers): ColumnsType<RoleResponse> {
  return [
    {
      title: '번호',
      key: 'no',
      width: 70,
      align: 'center',
      render: (_: unknown, __: RoleResponse, index: number) => h.total - index,
    },
    {
      title: '역할 코드',
      dataIndex: 'roleCode',
      key: 'roleCode',
      width: 180,
      onHeaderCell: centerHeader,
      render: (code: string) => <Tag color={ROLE_COLORS[code] || 'purple'}>{code}</Tag>,
    },
    { title: '역할명', dataIndex: 'roleName', key: 'roleName', width: 150, onHeaderCell: centerHeader },
    { title: '설명', dataIndex: 'description', key: 'description', ellipsis: true, onHeaderCell: centerHeader },
    { title: '정렬', dataIndex: 'sortOrder', key: 'sortOrder', width: 70, align: 'center' },
    {
      title: '상태',
      dataIndex: 'useYn',
      key: 'useYn',
      width: 80,
      align: 'center',
      render: (useYn: string) => <Tag color={useYn === 'Y' ? 'green' : 'red'}>{useYn === 'Y' ? '사용' : '미사용'}</Tag>,
    },
    {
      title: '권한 수',
      key: 'permissionCount',
      width: 90,
      align: 'center',
      render: (_, record) => (
        <Badge count={record.permissions?.length || 0} showZero color={record.permissions?.length ? 'blue' : 'default'} />
      ),
    },
    {
      title: '관리',
      fixed: 'right', // 휴대폰에서 가로 스크롤해도 버튼이 보이게
      key: 'action',
      width: 160,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="상세보기">
            <Button size="small" icon={<EyeOutlined />} onClick={() => h.onDetail(record)} />
          </Tooltip>
          <Tooltip title="수정">
            <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => h.onEdit(record)} />
          </Tooltip>
          {record.useYn === 'Y' ? (
            !isDefaultRole(record.roleCode) && (
              <Popconfirm
                title="비활성화하시겠습니까?"
                description="이 역할을 가진 사용자는 영향을 받을 수 있습니다."
                onConfirm={() => h.onDeactivate(record.id)}
                okText="예"
                cancelText="아니오"
              >
                <Tooltip title="비활성화">
                  <Button size="small" danger icon={<StopOutlined />} />
                </Tooltip>
              </Popconfirm>
            )
          ) : (
            <Tooltip title="활성화">
              <Button size="small" type="primary" ghost icon={<CheckCircleOutlined />} onClick={() => h.onActivate(record.id)} />
            </Tooltip>
          )}
          {!isDefaultRole(record.roleCode) && (
            <Popconfirm
              title="정말 삭제하시겠습니까?"
              description="이 작업은 되돌릴 수 없습니다."
              onConfirm={() => h.onDelete(record.id)}
              okText="삭제"
              cancelText="취소"
            >
              <Tooltip title="삭제">
                <Button size="small" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];
}
