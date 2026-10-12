import { Button, Popconfirm, Space, Tag, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { PostResponse } from '@/shared/api/endpoints/post';

interface PostColumnHandlers {
  /** 게시판이 URL로 고정되지 않은 화면에서만 게시판 열을 보인다 */
  showBoard: boolean;
  total: number;
  page: number;
  pageSize: number;
  onDetail: (post: PostResponse) => void;
  onEdit: (post: PostResponse) => void;
  onDelete: (id: number) => void;
}

const centerHeader = () => ({ style: { textAlign: 'center' as const } });

export function buildPostColumns(h: PostColumnHandlers): ColumnsType<PostResponse> {
  return [
    {
      title: '번호',
      key: 'no',
      width: 80,
      align: 'center',
      render: (_: unknown, __: PostResponse, index: number) => h.total - h.page * h.pageSize - index,
    },
    ...(h.showBoard
      ? [{ title: '게시판', dataIndex: 'boardName', key: 'boardName', width: 120, onHeaderCell: centerHeader }]
      : []),
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      onHeaderCell: centerHeader,
      render: (text: string, record) => (
        <Space>
          {record.noticeYn === 'Y' && <Tag color="red">공지</Tag>}
          {text}
        </Space>
      ),
    },
    { title: '조회수', dataIndex: 'viewCount', key: 'viewCount', width: 100, align: 'center' },
    {
      title: '작성일',
      dataIndex: 'regDt',
      key: 'regDt',
      width: 180,
      onHeaderCell: centerHeader,
      render: (text: string) => new Date(text).toLocaleString('ko-KR'),
    },
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
          <Tooltip title="상세보기">
            <Button size="small" icon={<EyeOutlined />} onClick={() => h.onDetail(record)} />
          </Tooltip>
          <Tooltip title="수정">
            <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => h.onEdit(record)} />
          </Tooltip>
          <Popconfirm title="게시글을 삭제하시겠습니까?" onConfirm={() => h.onDelete(record.id)} okText="예" cancelText="아니오">
            <Tooltip title="삭제">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];
}
