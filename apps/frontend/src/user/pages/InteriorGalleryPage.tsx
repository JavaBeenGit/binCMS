import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Spin, Empty, Pagination, Modal } from 'antd';
import { EyeOutlined, CalendarOutlined } from '@ant-design/icons';
import { publicInteriorApi } from '../../api/endpoints/public';
import { InteriorResponse, InteriorCategory } from '../../api/endpoints/interior';
import 'ckeditor5/ckeditor5.css';
import './InteriorGalleryPage.css';

interface InteriorGalleryPageProps {
  category: InteriorCategory;
  title: string;
  subtitle?: string;
}

const InteriorGalleryPage: React.FC<InteriorGalleryPageProps> = ({ category, title, subtitle }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<InteriorResponse | null>(null);
  const pageSize = 12;

  const { data, isLoading } = useQuery({
    queryKey: ['public-interiors', category, currentPage],
    queryFn: async () => {
      const res = await publicInteriorApi.getByCategory(category, currentPage - 1, pageSize);
      return res.data;
    },
  });

  // 상세 조회 (조회수 증가)
  const { data: detailData } = useQuery({
    queryKey: ['public-interior-detail', selectedItem?.id],
    queryFn: async () => {
      const res = await publicInteriorApi.getById(selectedItem!.id);
      return res.data;
    },
    enabled: !!selectedItem,
  });

  const items = data?.content || [];
  const totalElements = data?.totalElements || 0;

  /** 썸네일 추출: thumbnailUrl 우선 → content에서 첫 img → 기본 */
  const getThumbnail = (item: InteriorResponse) => {
    if (item.thumbnailUrl) return item.thumbnailUrl;
    const match = item.content?.match(/<img[^>]+src="([^"]+)"/);
    if (match) return match[1];
    return null;
  };

  const detail = detailData || selectedItem;

  return (
    <div>
      <div className="page-banner">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="page-container">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : items.length === 0 ? (
          <Empty description="등록된 콘텐츠가 없습니다." />
        ) : (
          <>
            <div className="gallery-grid">
              {items.map((item) => {
                const thumb = getThumbnail(item);
                return (
                  <div
                    key={item.id}
                    className="gallery-card"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="gallery-card-img">
                      {thumb ? (
                        <img src={thumb} alt={item.title} />
                      ) : (
                        <div className="gallery-card-placeholder">
                          <span>🏠</span>
                        </div>
                      )}
                      <div className="gallery-card-overlay">
                        <EyeOutlined style={{ fontSize: 24 }} />
                      </div>
                    </div>
                    <div className="gallery-card-body">
                      <h3>{item.title}</h3>
                      <div className="gallery-card-meta">
                        <span><CalendarOutlined /> {new Date(item.regDt).toLocaleDateString('ko-KR')}</span>
                        <span><EyeOutlined /> {item.viewCount}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="gallery-pagination">
              <Pagination
                current={currentPage}
                total={totalElements}
                pageSize={pageSize}
                onChange={(p) => setCurrentPage(p)}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </div>

      {/* 상세 모달 */}
      <Modal
        open={!!selectedItem}
        onCancel={() => setSelectedItem(null)}
        footer={null}
        width={900}
        title={detail?.title}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
      >
        {detail && (
          <div className="interior-detail">
            <div className="interior-detail-meta">
              <span><CalendarOutlined /> {new Date(detail.regDt).toLocaleDateString('ko-KR')}</span>
              <span><EyeOutlined /> {detail.viewCount}</span>
            </div>
            <div
              className="interior-detail-content ck-content"
              dangerouslySetInnerHTML={{ __html: detail.content || '' }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InteriorGalleryPage;
