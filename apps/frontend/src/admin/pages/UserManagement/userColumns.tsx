import { Button, Popconfirm, Space, Tag, Tooltip } from 'antd';
import { CheckCircleOutlined, EditOutlined, EyeOutlined, LockOutlined, StopOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UserMemberResponse } from '@/shared/api/endpoints/userMember';

interface UserColumnHandlers {
  total: number;
  page: number;
  pageSize: number;
  onDetail: (user: UserMemberResponse) => void;
  onEdit: (user: UserMemberResponse) => void;
  onResetPassword: (user: UserMemberResponse) => void;
  onActivate: (id: number) => void;
  onDeactivate: (id: number) => void;
}

/** 가입방식(provider) 태그 — 목록·상세에서 같이 쓴다 */
export const getProviderTag = (provider: string) => {
  switch (provider) {
    case 'LOCAL':
      return <Tag color="blue">이메일</Tag>;
    case 'KAKAO':
      return <Tag color="gold">카카오</Tag>;
    case 'NAVER':
      return <Tag color="green">네이버</Tag>;
    case 'GOOGLE':
      return <Tag color="red">구글</Tag>;
    default:
      return <Tag>{provider}</Tag>;
  }
};

export function buildUserColumns(h: UserColumnHandlers): ColumnsType<UserMemberResponse> {
  return [
    {
      title: '번호',
      width: 60,
      align: 'center',
      render: (_: unknown, __: UserMemberResponse, index: number) => h.total - h.page * h.pageSize - index,
    },
    { title: '아이디', dataIndex: 'loginId', key: 'loginId', width: 180, ellipsis: true },
    { title: '이름', dataIndex: 'name', key: 'name', width: 120 },
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
      render: (active: boolean) => (active ? <Tag color="success">정상</Tag> : <Tag color="error">차단</Tag>),
    },
    {
      title: '가입일',
      dataIndex: 'regDt',
      key: 'regDt',
      width: 110,
      render: (dt: string) => (dt ? new Date(dt).toLocaleDateString('ko-KR') : '-'),
    },
    {
      title: '관리',
      fixed: 'right', // 휴대폰에서 가로 스크롤해도 버튼이 보이게
      key: 'actions',
      width: 200,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="상세보기">
            <Button size="small" icon={<EyeOutlined />} onClick={() => h.onDetail(record)} />
          </Tooltip>
          <Tooltip title="수정">
            <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => h.onEdit(record)} />
          </Tooltip>
          <Tooltip title="비밀번호 초기화">
            {/* 소셜 가입(카카오·네이버·구글)은 비밀번호가 없어 초기화할 수 없다 */}
            <Button
              size="small"
              icon={<LockOutlined />}
              onClick={() => h.onResetPassword(record)}
              disabled={record.provider !== 'LOCAL'}
            />
          </Tooltip>
          {record.active ? (
            <Popconfirm
              title="차단"
              description={`${record.name} 사용자를 차단하시겠습니까?`}
              onConfirm={() => h.onDeactivate(record.id)}
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
              onConfirm={() => h.onActivate(record.id)}
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
}
