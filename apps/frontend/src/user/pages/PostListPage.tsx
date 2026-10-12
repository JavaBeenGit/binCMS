import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Spin, Empty, Pagination, Tag } from 'antd';
import { EyeOutlined, CalendarOutlined } from '@ant-design/icons';
import { publicPostApi } from '../../api/endpoints/public';
import { PostResponse } from '../../api/endpoints/post';
import 'ckeditor5/ckeditor5.css';
import './PostListPage.css';

interface PostListPageProps {
  boardCode: string;
  title: string;
  subtitle?: string;
}

const PostListPage: React.FC<PostListPageProps> = ({ boardCode, title, subtitle }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<PostResponse | null>(null);
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['public-posts', boardCode, currentPage],
    queryFn: async () => {
      const res = await publicPostApi.getByBoardCode(boardCode, currentPage - 1, pageSize);
      return res.data;
    },
  });

  // 상세 조회
  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['public-post-detail', selectedPost?.id],
    queryFn: async () => {
      const res = await publicPostApi.getById(selectedPost!.id);
      return res.data;
    },
    enabled: !!selectedPost,
  });

  const posts = data?.content || [];
  const totalElements = data?.totalElements || 0;

  // 상세 보기
  if (selectedPost) {
    const post = detailData || selectedPost;
    return (
      <div>
        <div className="page-banner">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="page-container">
          <div className="post-detail">
            <button className="back-btn" onClick={() => setSelectedPost(null)}>
              ← 목록으로
            </button>
            <div className="post-detail-header">
              <h2 className="post-detail-title">
                {post.noticeYn === 'Y' && <Tag color="red">공지</Tag>}
                {post.title}
              </h2>
              <div className="post-detail-meta">
                <span><CalendarOutlined /> {new Date(post.regDt).toLocaleDateString('ko-KR')}</span>
                <span><EyeOutlined /> {post.viewCount}</span>
              </div>
            </div>
            <div className="post-detail-divider" />
            {detailLoading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin size="large" />
              </div>
            ) : (
              <div
                className="post-detail-content ck-content"
                dangerouslySetInnerHTML={{ __html: post.content || '' }}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // 목록 보기
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
                  onClick={() => setSelectedPost(post)}
                >
                  <span className="col-no">
                    {post.noticeYn === 'Y'
                      ? <Tag color="red" style={{ margin: 0 }}>공지</Tag>
                      : totalElements - ((currentPage - 1) * pageSize + index)}
                  </span>
                  <span className="col-title">{post.title}</span>
                  <span className="col-date">
                    {new Date(post.regDt).toLocaleDateString('ko-KR')}
                  </span>
                  <span className="col-views">{post.viewCount}</span>
                </div>
              ))}
            </div>
            <div className="post-pagination">
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
    </div>
  );
};

export default PostListPage;
