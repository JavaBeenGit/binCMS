import { Button, Image, Popconfirm, Space, Tag, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, PictureOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { InteriorResponse } from '@/shared/api/endpoints/interior';
import { getThumbnail } from './interiorHelpers';

interface InteriorColumnHandlers {
  /** 카테고리가 URL로 고정되지 않은 화면에서만 카테고리 열을 보인다 */
  showCategory: boolean;
  total: number;
  /** 0부터 시작하는 현재 페이지 */
  page: number;
  pageSize: number;
  onDetail: (item: InteriorResponse) => void;
  onEdit: (item: InteriorResponse) => void;
  onDelete: (id: number) => void;
}

const centerHeader = () => ({ style: { textAlign: 'center' as const } });

/** 리스트(테이블) 뷰 열 정의 */
export function buildInteriorColumns(h: InteriorColumnHandlers): ColumnsType<InteriorResponse> {
  return [
    {
      title: '번호',
      key: 'index',
      width: 70,
      align: 'center',
      onHeaderCell: centerHeader,
      render: (_: unknown, __: InteriorResponse, idx: number) => h.total - h.page * h.pageSize - idx,
    },
    {
      title: '썸네일',
      key: 'thumbnail',
      width: 80,
      align: 'center',
      onHeaderCell: centerHeader,
      render: (_, record) => {
        const thumb = getThumbnail(record);
        return thumb ? (
          <Image src={thumb} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />
        ) : (
          <PictureOutlined style={{ fontSize: 24, color: '#ccc' }} />
        );
      },
    },
    ...(h.showCategory
      ? [{ title: '카테고리', dataIndex: 'categoryName', key: 'categoryName', width: 120, onHeaderCell: centerHeader }]
      : []),
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      onHeaderCell: centerHeader,
      render: (text: string, record) => (
        <a onClick={() => h.onDetail(record)} style={{ color: '#1890ff' }}>
          {text}
        </a>
      ),
    },
    { title: '조회수', dataIndex: 'viewCount', key: 'viewCount', width: 80, align: 'center', onHeaderCell: centerHeader },
    { title: '정렬', dataIndex: 'sortOrder', key: 'sortOrder', width: 70, align: 'center', onHeaderCell: centerHeader },
    {
      title: '상태',
      dataIndex: 'useYn',
      key: 'useYn',
      width: 80,
      align: 'center',
      onHeaderCell: centerHeader,
      render: (v: string) => <Tag color={v === 'Y' ? 'green' : 'red'}>{v === 'Y' ? '사용' : '미사용'}</Tag>,
    },
    {
      title: '등록일',
      dataIndex: 'regDt',
      key: 'regDt',
      width: 120,
      onHeaderCell: centerHeader,
      render: (text: string) => new Date(text).toLocaleDateString('ko-KR'),
    },
    {
      title: '관리',
      key: 'action',
      width: 100,
      align: 'center',
      onHeaderCell: centerHeader,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="수정">
            <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => h.onEdit(record)} />
          </Tooltip>
          <Popconfirm title="삭제하시겠습니까?" onConfirm={() => h.onDelete(record.id)} okText="예" cancelText="아니오">
            <Tooltip title="삭제">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];
}
