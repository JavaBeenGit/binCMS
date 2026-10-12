import { Button, Popconfirm, Space, Switch, Tag, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ContentResponse } from '@/shared/api/endpoints/content';

interface ContentColumnHandlers {
  total: number;
  /** 1부터 시작하는 현재 페이지 */
  currentPage: number;
  pageSize: number;
  onDetail: (content: ContentResponse) => void;
  onEdit: (content: ContentResponse) => void;
  onDelete: (id: number) => void;
  /** 상태 스위치 토글 (true → 활성화, false → 비활성화) */
  onToggleActive: (id: number, active: boolean) => void;
}

const centerHeader = () => ({ style: { textAlign: 'center' as const } });

export function buildContentColumns(h: ContentColumnHandlers): ColumnsType<ContentResponse> {
  return [
    {
      title: '번호',
      key: 'no',
      width: 70,
      align: 'center',
      render: (_: unknown, __: ContentResponse, index: number) =>
        h.total - ((h.currentPage - 1) * h.pageSize) - index,
    },
    {
      title: '컨텐츠 키',
      dataIndex: 'contentKey',
      key: 'contentKey',
      width: 180,
      onHeaderCell: centerHeader,
      render: (text: string) => (
        <Tooltip title={text}>
          <Tag color="blue">{text}</Tag>
        </Tooltip>
      ),
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      onHeaderCell: centerHeader,
    },
    {
      title: '조회수',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 80,
      align: 'center',
    },
    {
      title: '상태',
      dataIndex: 'useYn',
      key: 'useYn',
      width: 80,
      align: 'center',
      render: (useYn: string, record: ContentResponse) => (
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
      fixed: 'right', // 휴대폰에서 가로 스크롤해도 버튼이 보이게
      key: 'action',
      width: 150,
      align: 'center',
      render: (_: unknown, record: ContentResponse) => (
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
