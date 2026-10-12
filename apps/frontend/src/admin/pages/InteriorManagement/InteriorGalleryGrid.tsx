import React from 'react';
import { Card, Col, Popconfirm, Row, Space, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, PictureOutlined } from '@ant-design/icons';
import type { InteriorResponse } from '@/shared/api/endpoints/interior';
import { getThumbnail } from './interiorHelpers';

interface InteriorGalleryGridProps {
  items: InteriorResponse[];
  /** 카테고리가 URL로 고정되지 않은 화면에서만 카드에 카테고리 태그를 보인다 */
  showCategory: boolean;
  isLoading: boolean;
  onDetail: (item: InteriorResponse) => void;
  onEdit: (item: InteriorResponse) => void;
  onDelete: (id: number) => void;
}

/**
 * 갤러리 뷰 — 썸네일 카드 격자. 페이지네이션은 부모(index)가 그린다.
 */
const InteriorGalleryGrid: React.FC<InteriorGalleryGridProps> = ({ items, showCategory, isLoading, onDetail, onEdit, onDelete }) => (
  <Row gutter={[16, 16]}>
    {items.map((item) => {
      const thumb = getThumbnail(item);
      return (
        <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            cover={
              thumb ? (
                <div style={{ height: 200, overflow: 'hidden' }}>
                  <img alt={item.title} src={thumb} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div
                  style={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f5f5f5',
                    color: '#bbb',
                    fontSize: 48,
                  }}
                >
                  <PictureOutlined />
                </div>
              )
            }
            actions={[
              <EyeOutlined key="view" onClick={() => onDetail(item)} />,
              <EditOutlined key="edit" onClick={() => onEdit(item)} />,
              <Popconfirm
                key="delete"
                title="삭제하시겠습니까?"
                onConfirm={() => onDelete(item.id)}
                okText="예"
                cancelText="아니오"
              >
                <DeleteOutlined />
              </Popconfirm>,
            ]}
          >
            <Card.Meta
              title={item.title}
              description={
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  {showCategory && <Tag color="blue">{item.categoryName}</Tag>}
                  <span style={{ color: '#999', fontSize: 12 }}>
                    조회 {item.viewCount} · {new Date(item.regDt).toLocaleDateString('ko-KR')}
                  </span>
                </Space>
              }
            />
          </Card>
        </Col>
      );
    })}
    {items.length === 0 && !isLoading && (
      <Col span={24}>
        <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>등록된 시공사례가 없습니다.</div>
      </Col>
    )}
  </Row>
);

export default InteriorGalleryGrid;
