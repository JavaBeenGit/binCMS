import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Spin, Empty, Pagination, Tag, Collapse } from 'antd';
import { publicPostApi } from '@/shared/api/endpoints/public';
import 'ckeditor5/ckeditor5.css';
import './PostListPage.css';

import { usePageMeta } from '@/shared/utils/usePageMeta';

interface PostListPageProps {
  boardCode: string;
  title: string;
  subtitle?: string;
  /** 'list': 제목 목록 → 상세 페이지(detailPath/{id}). 'accordion': 질문을 누르면 답이 펼쳐짐(FAQ) */
  variant?: 'list' | 'accordion';
  /** variant='list' 일 때 상세 페이지 경로 (예: /user/notice) */
  detailPath?: string;
}

const PAGE_SIZE = 10;

/**
 * 게시판 목록 — 공지사항(목록 → 상세 페이지), 자주묻는질문(아코디언). 보던 페이지는 ?page= 에 남긴다.
 */
const PostListPage: React.FC<PostListPageProps> = ({ boardCode, title, subtitle, variant = 'list', detailPath }) => {
  usePageMeta(title, subtitle);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = Number(searchParams.get('page') ?? '1');
  const currentPage = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const { data, isLoading } = useQuery({
    queryKey: ['public-posts', boardCode, currentPage],
    queryFn: async () => (await publicPostApi.getByBoardCode(boardCode, currentPage - 1, PAGE_SIZE)).data,
  });

  const posts = data?.content || [];
  const totalElements = data?.totalElements || 0;

  const openDetail = (id: number) => {
    if (!detailPath) return;
    navigate(`${detailPath}/${id}`, { state: { from: `${location.pathname}${location.search}` } });
  };

  const pagination = (
    <div className="post-pagination">
      <Pagination
        current={currentPage}
        total={totalElements}
        pageSize={PAGE_SIZE}
        onChange={(p) => setSearchParams(p === 1 ? {} : { page: String(p) })}
        showSizeChanger={false}
      />
    </div>
  );

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
        ) : posts.length === 0 ? (
          <Empty description="등록된 게시글이 없습니다." />
        ) : variant === 'accordion' ? (
          <>
            <Collapse
              accordion
              className="faq-accordion"
              expandIconPosition="end"
              items={posts.map((post) => ({
                key: String(post.id),
                label: <span className="faq-question">Q. {post.title}</span>,
                children: <div className="faq-answer ck-content" dangerouslySetInnerHTML={{ __html: post.content || '' }} />,
              }))}
            />
            {pagination}
          </>
        ) : (
          <>
            <div className="post-list">
              <div className="post-list-header">
                <span className="col-no">번호</span>
                <span className="col-title">제목</span>
                <span className="col-date">등록일</span>
                <span className="col-views">조회</span>
              </div>
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  className={`post-list-item ${post.noticeYn === 'Y' ? 'notice' : ''}`}
                  onClick={() => openDetail(post.id)}
                >
                  <span className="col-no">
                    {post.noticeYn === 'Y'
                      ? <Tag color="red" style={{ margin: 0 }}>공지</Tag>
                      : totalElements - ((currentPage - 1) * PAGE_SIZE + index)}
                  </span>
                  <span className="col-title">{post.title}</span>
                  <span className="col-date">
                    {new Date(post.regDt).toLocaleDateString('ko-KR')}
                  </span>
                  <span className="col-views">{post.viewCount}</span>
                </div>
              ))}
            </div>
            {pagination}
          </>
        )}
      </div>
    </div>
  );
};

export default PostListPage;
