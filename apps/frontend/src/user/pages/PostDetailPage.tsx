import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Tag, message } from 'antd';
import { publicPostApi } from '@/shared/api/endpoints/public';
import { usePageMeta } from '@/shared/utils/usePageMeta';
import ArticleView from '@/user/components/ArticleView';
import './PostListPage.css';

interface PostDetailPageProps {
  title: string;
  subtitle?: string;
  /** 목록 경로 (예: /user/notice) */
  listPath: string;
}

/**
 * 게시글 상세 — /user/notice/{id} 페이지 (2026-10-13, 목록 안에 끼워 보여 주던 방식에서 전환).
 */
const PostDetailPage: React.FC<PostDetailPageProps> = ({ title, subtitle, listPath }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: idParam } = useParams<{ id: string }>();
  const id = idParam && /^\d+$/.test(idParam) ? Number(idParam) : null;
  const from = (location.state as { from?: string } | null)?.from;

  const { data: post, isError } = useQuery({
    queryKey: ['public-post-detail', id],
    queryFn: async () => (await publicPostApi.getById(id!)).data,
    enabled: id !== null,
    retry: false,
  });

  useEffect(() => {
    if (id === null || isError) {
      message.warning('찾을 수 없는 글입니다.');
      navigate(listPath, { replace: true });
    }
  }, [id, isError, navigate, listPath]);

  usePageMeta(post?.title ? `${post.title} - ${title}` : title, subtitle);

  return (
    <div>
      <div className="page-banner">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <ArticleView
        listPath={from ?? listPath}
        listLabel={`${title} 목록으로`}
        title={post?.title}
        badge={post?.noticeYn === 'Y' ? <Tag color="red">공지</Tag> : undefined}
        regDt={post?.regDt}
        viewCount={post?.viewCount}
        contentHtml={post?.content}
        loading={!post}
      />
    </div>
  );
};

export default PostDetailPage;
