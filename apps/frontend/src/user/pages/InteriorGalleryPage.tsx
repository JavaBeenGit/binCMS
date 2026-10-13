import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Spin, Empty, Pagination } from 'antd';
import { EyeOutlined, CalendarOutlined } from '@ant-design/icons';
import { publicInteriorApi } from '@/shared/api/endpoints/public';
import { InteriorResponse, InteriorCategory } from '@/shared/api/endpoints/interior';
import { interiorListPath } from '@/shared/constants/interior';
import { usePageMeta } from '@/shared/utils/usePageMeta';
import './InteriorGalleryPage.css';

interface InteriorGalleryPageProps {
  category: InteriorCategory;
  title: string;
  subtitle?: string;
}

const PAGE_SIZE = 12;

/**
 * 갤러리 목록. 카드를 누르면 상세 페이지(/user/interior/{slug}/{id})로 간다.
 * 보던 페이지는 ?page= 에 남겨 상세에서 돌아와도 유지된다.
 */
const InteriorGalleryPage: React.FC<InteriorGalleryPageProps> = ({ category, title, subtitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const listPath = interiorListPath(category);
  const pageParam = Number(searchParams.get('page') ?? '1');
  const currentPage = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  usePageMeta(title, subtitle);

  const { data, isLoading } = useQuery({
    queryKey: ['public-interiors', category, currentPage],
    queryFn: async () => (await publicInteriorApi.getByCategory(category, currentPage - 1, PAGE_SIZE)).data,
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

  const openDetail = (id: number) =>
    navigate(`${listPath}/${id}`, { state: { from: `${location.pathname}${location.search}` } });

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
                  <div key={item.id} className="gallery-card" onClick={() => openDetail(item.id)}>
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
                pageSize={PAGE_SIZE}
                onChange={(p) => setSearchParams(p === 1 ? {} : { page: String(p) })}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InteriorGalleryPage;
