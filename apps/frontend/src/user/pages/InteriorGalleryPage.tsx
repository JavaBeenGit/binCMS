import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Spin, Empty, Pagination, Modal, message } from 'antd';
import { EyeOutlined, CalendarOutlined } from '@ant-design/icons';
import { publicInteriorApi } from '@/shared/api/endpoints/public';
import { InteriorResponse, InteriorCategory } from '@/shared/api/endpoints/interior';
import { usePageMeta } from '@/shared/utils/usePageMeta';
import 'ckeditor5/ckeditor5.css';
import './InteriorGalleryPage.css';

interface InteriorGalleryPageProps {
  category: InteriorCategory;
  title: string;
  subtitle?: string;
}

/** URL 조각 ↔ 카테고리 (sitemap.xml 과 같은 규칙) */
const CATEGORY_SLUG: Record<InteriorCategory, string> = {
  ONSITE: 'onsite',
  SELF_TIP: 'self-tip',
  STORY: 'story',
};

/**
 * 갤러리 목록 + 상세 모달. 상세는 /user/interior/{slug}/{id} 딥링크로 열린다(공유·검색엔진용).
 */
const InteriorGalleryPage: React.FC<InteriorGalleryPageProps> = ({ category, title, subtitle }) => {
  const navigate = useNavigate();
  const { id: idParam } = useParams<{ id?: string }>();
  const selectedId = idParam && /^\d+$/.test(idParam) ? Number(idParam) : null;
  const listPath = `/user/interior/${CATEGORY_SLUG[category]}`;

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const { data, isLoading } = useQuery({
    queryKey: ['public-interiors', category, currentPage],
    queryFn: async () => {
      const res = await publicInteriorApi.getByCategory(category, currentPage - 1, pageSize);
      return res.data;
    },
  });

  // 상세 조회 (조회수 증가). id 가 URL 에 있을 때만.
  const { data: detail, isError: detailError } = useQuery({
    queryKey: ['public-interior-detail', selectedId],
    queryFn: async () => {
      const res = await publicInteriorApi.getById(selectedId!);
      return res.data;
    },
    enabled: selectedId !== null,
    retry: false,
  });

  useEffect(() => {
    if (detailError) {
      message.warning('찾을 수 없는 글입니다.');
      navigate(listPath, { replace: true });
    }
  }, [detailError, navigate, listPath]);

  usePageMeta(detail?.title ? `${detail.title} - ${title}` : title, subtitle);

  const items = data?.content || [];
  const totalElements = data?.totalElements || 0;

  /** 썸네일 추출: thumbnailUrl 우선 → content에서 첫 img → 기본 */
  const getThumbnail = (item: InteriorResponse) => {
    if (item.thumbnailUrl) return item.thumbnailUrl;
    const match = item.content?.match(/<img[^>]+src="([^"]+)"/);
    if (match) return match[1];
    return null;
  };

  return (
    <div>
      <div className="page-banner">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="page-container">
        {isLoading ? (
          <div className="loading-center"><Spin size="large" /></div>
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
                    onClick={() => navigate(`${listPath}/${item.id}`)}
                  >
                    <div className="gallery-card-img">
                      {thumb ? (
                        <img src={thumb} alt={item.title} loading="lazy" />
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

      {/* 상세 모달 — 닫으면 목록 URL 로 */}
      <Modal
        open={selectedId !== null && !detailError}
        onCancel={() => navigate(listPath)}
        footer={null}
        width={900}
        title={detail?.title}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
      >
        {detail ? (
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
        ) : (
          <div className="loading-center"><Spin /></div>
        )}
      </Modal>
    </div>
  );
};

export default InteriorGalleryPage;
