import { Badge, Button, Space, Tag, Tooltip } from 'antd';
import { EditOutlined, EyeOutlined, PhoneOutlined, SyncOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { InquiryResponse } from '@/shared/api/endpoints/inquiry';
import { BUDGET_MAP, STATUS_MAP, TYPE_MAP } from './inquiryLabels';

interface InquiryColumnHandlers {
  total: number;
  /** 1부터 시작하는 현재 페이지 */
  currentPage: number;
  pageSize: number;
  onDetail: (inquiry: InquiryResponse) => void;
  onChangeStatus: (inquiry: InquiryResponse) => void;
  onEditMemo: (inquiry: InquiryResponse) => void;
}

export function buildInquiryColumns(h: InquiryColumnHandlers): ColumnsType<InquiryResponse> {
  return [
    {
      title: '번호',
      key: 'no',
      width: 70,
      align: 'center',
      render: (_: unknown, __: InquiryResponse, index: number) =>
        h.total - ((h.currentPage - 1) * h.pageSize) - index,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: string) => {
        const s = STATUS_MAP[status] || { label: status, color: 'default', icon: null };
        return <Tag icon={s.icon} color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: (name: string) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <strong>{name}</strong>
        </Space>
      ),
    },
    {
      title: '연락처',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (phone: string) => (
        <Space>
          <PhoneOutlined style={{ color: '#52c41a' }} />
          {phone}
        </Space>
      ),
    },
    {
      title: '시공유형',
      dataIndex: 'inquiryType',
      key: 'inquiryType',
      width: 100,
      align: 'center',
      render: (type: string) => (
        <Tag color="blue">{TYPE_MAP[type] || type}</Tag>
      ),
    },
    {
      title: '예산',
      dataIndex: 'budget',
      key: 'budget',
      width: 140,
      render: (budget: string) => budget ? (BUDGET_MAP[budget] || budget) : '-',
    },
    {
      title: '문의일시',
      dataIndex: 'regDt',
      key: 'regDt',
      width: 160,
      render: (dt: string) => dt ? dayjs(dt).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '메모',
      dataIndex: 'adminMemo',
      key: 'adminMemo',
      width: 80,
      align: 'center',
      render: (memo: string) => memo ? (
        <Tooltip title={memo}>
          <Badge dot color="blue">
            <EditOutlined style={{ fontSize: 16 }} />
          </Badge>
        </Tooltip>
      ) : (
        <span style={{ color: '#ccc' }}>-</span>
      ),
    },
    {
      title: '관리',
      fixed: 'right', // 휴대폰에서 가로 스크롤해도 버튼이 보이게
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="상세보기">
            <Button size="small" icon={<EyeOutlined />} onClick={() => h.onDetail(record)} />
          </Tooltip>
          <Tooltip title="상태변경">
            <Button size="small" icon={<SyncOutlined />} onClick={() => h.onChangeStatus(record)} />
          </Tooltip>
          <Tooltip title="메모">
            <Button size="small" icon={<EditOutlined />} onClick={() => h.onEditMemo(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];
}
