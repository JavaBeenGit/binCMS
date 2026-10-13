import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { message } from 'antd';
import { publicInteriorApi } from '@/shared/api/endpoints/public';
import type { InteriorCategory } from '@/shared/api/endpoints/interior';
import { interiorListPath } from '@/shared/constants/interior';
import { usePageMeta } from '@/shared/utils/usePageMeta';
import ArticleView from '@/user/components/ArticleView';
import './InteriorGalleryPage.css';

interface InteriorDetailPageProps {
  category: InteriorCategory;
  title: string;
  subtitle?: string;
}

/**
 * 시공사례 상세 — /user/interior/{slug}/{id} 페이지 (2026-10-13 모달에서 전환).
 * 목록에서 들어오면 location.state.from 에 보던 목록 주소(?page=)가 있어 "목록으로"가 그 페이지로 돌아간다.
 */
const InteriorDetailPage: React.FC<InteriorDetailPageProps> = ({ category, title, subtitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: idParam } = useParams<{ id: string }>();
  const id = idParam && /^\d+$/.test(idParam) ? Number(idParam) : null;
  const listPath = interiorListPath(category);
  const from = (location.state as { from?: string } | null)?.from;

  const { data: detail, isError } = useQuery({
    queryKey: ['public-interior-detail', id],
    queryFn: async () => (await publicInteriorApi.getById(id!)).data,
    enabled: id !== null,
    retry: false,
  });

  useEffect(() => {
    if (id === null || isError) {
      message.warning('찾을 수 없는 글입니다.');
      navigate(listPath, { replace: true });
    }
  }, [id, isError, navigate, listPath]);

  usePageMeta(detail?.title ? `${detail.title} - ${title}` : title, subtitle);

  return (
    <div>
      <div className="page-banner">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <ArticleView
        listPath={from ?? listPath}
        listLabel={`${title} 목록으로`}
        title={detail?.title}
        regDt={detail?.regDt}
        viewCount={detail?.viewCount}
        contentHtml={detail?.content}
        loading={!detail}
      />
    </div>
  );
};

export default InteriorDetailPage;
