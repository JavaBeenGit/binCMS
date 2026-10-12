import { Button, Popconfirm, Space, Switch, Tag, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { PopupResponse } from '@/shared/api/endpoints/popup';
import { getExposureStatus } from './popupStatus';

interface PopupColumnHandlers {
  total: number;
  /** 1부터 시작하는 현재 페이지 */
  currentPage: number;
  pageSize: number;
  onDetail: (popup: PopupResponse) => void;
  onEdit: (popup: PopupResponse) => void;
  onDelete: (id: number) => void;
  /** 사용 스위치 토글 (true → 활성화, false → 비활성화) */
  onToggleActive: (id: number, active: boolean) => void;
}

export function buildPopupColumns(h: PopupColumnHandlers): ColumnsType<PopupResponse> {
  return [
    {
      title: '번호',
      key: 'no',
      width: 70,
      align: 'center',
      render: (_: unknown, __: PopupResponse, index: number) =>
        h.total - ((h.currentPage - 1) * h.pageSize + index),
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      onHeaderCell: () => ({ style: { textAlign: 'center' as const } }),
    },
    {
      title: '크기 (W×H)',
      key: 'size',
      width: 120,
      align: 'center',
      render: (_: unknown, record: PopupResponse) =>
        `${record.popupWidth || '-'} × ${record.popupHeight || '-'}`,
    },
    {
      title: '노출기간',
      key: 'period',
      width: 200,
      align: 'center',
      render: (_: unknown, record: PopupResponse) => {
        if (!record.startDt && !record.endDt) return '상시';
        const start = record.startDt ? dayjs(record.startDt).format('YY.MM.DD HH:mm') : '-';
        const end = record.endDt ? dayjs(record.endDt).format('YY.MM.DD HH:mm') : '-';
        return `${start} ~ ${end}`;
      },
    },
    {
      title: '노출상태',
      key: 'exposure',
      width: 90,
      align: 'center',
      render: (_: unknown, record: PopupResponse) => {
        const status = getExposureStatus(record);
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '사용',
      dataIndex: 'useYn',
      key: 'useYn',
      width: 90,
      align: 'center',
      render: (useYn: string, record: PopupResponse) => (
        <Switch
          checked={useYn === 'Y'}
          checkedChildren="사용"
          unCheckedChildren="미사용"
          onChange={(checked) => h.onToggleActive(record.id, checked)}
        />
      ),
    },
    {
      title: '등록일',
      dataIndex: 'regDt',
      key: 'regDt',
      width: 110,
      align: 'center',
      render: (dt: string) => dt?.substring(0, 10),
    },
    {
      title: '관리',
      key: 'action',
      width: 150,
      align: 'center',
      render: (_: unknown, record: PopupResponse) => (
        <Space size="small">
          <Tooltip title="상세보기">
            <Button size="small" icon={<EyeOutlined />} onClick={() => h.onDetail(record)} />
          </Tooltip>
          <Tooltip title="수정">
            <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => h.onEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="정말 삭제하시겠습니까?"
            onConfirm={() => h.onDelete(record.id)}
            okText="삭제"
            cancelText="취소"
          >
            <Tooltip title="삭제">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];
}
