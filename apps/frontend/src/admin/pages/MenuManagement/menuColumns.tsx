import { Button, Popconfirm, Space, Tag, Tooltip } from 'antd';
import { CheckCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuResponse } from '@/shared/api/endpoints/menu';

interface MenuColumnHandlers {
  onEdit: (menu: MenuResponse) => void;
  onActivate: (id: number) => void;
  onDelete: (id: number) => void;
}

const centerHeader = () => ({ style: { textAlign: 'center' as const } });

export function buildMenuColumns(h: MenuColumnHandlers): ColumnsType<MenuResponse> {
  return [
    {
      title: '번호',
      key: 'no',
      width: 80,
      align: 'center',
      render: (_: unknown, __: MenuResponse, index: number) => index + 1,
    },
    {
      title: '메뉴명',
      dataIndex: 'menuName',
      key: 'menuName',
      onHeaderCell: centerHeader,
      render: (text: string, record) => (
        <span style={{ marginLeft: `${(record.depth - 1) * 20}px` }}>
          {record.depth > 1 && '└ '}
          {text}
        </span>
      ),
    },
    { title: 'URL', dataIndex: 'menuUrl', key: 'menuUrl', ellipsis: true, onHeaderCell: centerHeader },
    { title: '정렬순서', dataIndex: 'sortOrder', key: 'sortOrder', width: 100, align: 'center' },
    { title: '깊이', dataIndex: 'depth', key: 'depth', width: 80, align: 'center' },
    {
      title: '상태',
      dataIndex: 'useYn',
      key: 'useYn',
      width: 80,
      align: 'center',
      render: (useYn: string) => <Tag color={useYn === 'Y' ? 'green' : 'red'}>{useYn === 'Y' ? '사용' : '미사용'}</Tag>,
    },
    {
      title: '관리',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="수정">
            <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => h.onEdit(record)} />
          </Tooltip>
          {record.useYn === 'N' && (
            <Tooltip title="활성화">
              <Button size="small" type="primary" ghost icon={<CheckCircleOutlined />} onClick={() => h.onActivate(record.id)} />
            </Tooltip>
          )}
          <Popconfirm
            title="메뉴를 삭제하시겠습니까?"
            description="하위 메뉴가 있으면 삭제할 수 없습니다."
            onConfirm={() => h.onDelete(record.id)}
            okText="예"
            cancelText="아니오"
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
