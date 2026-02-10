import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Spin, Empty, Pagination, Tag } from 'antd';
import { EyeOutlined, CalendarOutlined, CommentOutlined } from '@ant-design/icons';
import { publicPostApi } from '../../api/endpoints/public';
import { PostResponse } from '../../api/endpoints/post';
import { publicCommentApi } from '../../api/endpoints/comment';
import CommentSection from '../components/CommentSection';
import 'ckeditor5/ckeditor5.css';
import './FreeBoardPage.css';

interface FreeBoardPageProps {
  boardCode: string;
  title: string;
  subtitle?: string;
}

const FreeBoardPage: React.FC<FreeBoardPageProps> = ({ boardCode, title, subtitle }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<PostResponse | null>(null);
  const pageSize = 15;

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

  // 댓글 수 조회 (목록에서 사용)
  const postIds = (data?.content || []).map((p) => p.id);
  const { data: commentCounts } = useQuery({
    queryKey: ['comment-counts', boardCode, postIds],
    queryFn: async () => {
      const counts: Record<number, number> = {};
      await Promise.all(
        postIds.map(async (id) => {
          try {
            const res = await publicCommentApi.getCount(id);
            counts[id] = res.data;
          } catch {
            counts[id] = 0;
          }
        })
      );
      return counts;
    },
    enabled: postIds.length > 0,
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
                <span><UserIcon /> {post.regNo || '익명'}</span>
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

            {/* 댓글 섹션 */}
            <CommentSection postId={post.id} />
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
            <div className="free-board-list">
              <div className="free-board-header">
                <span className="col-no">번호</span>
                <span className="col-title">제목</span>
                <span className="col-author">작성자</span>
                <span className="col-date">등록일</span>
                <span className="col-views">조회</span>
              </div>
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  className={`free-board-item ${post.noticeYn === 'Y' ? 'notice' : ''}`}
                  onClick={() => setSelectedPost(post)}
                >
                  <span className="col-no">
                    {post.noticeYn === 'Y'
                      ? <Tag color="red" style={{ margin: 0 }}>공지</Tag>
                      : totalElements - ((currentPage - 1) * pageSize + index)}
                  </span>
                  <span className="col-title">
                    {post.title}
                    {commentCounts && commentCounts[post.id] > 0 && (
                      <span className="comment-badge">
                        <CommentOutlined /> {commentCounts[post.id]}
                      </span>
                    )}
                  </span>
                  <span className="col-author">{post.regNo || '익명'}</span>
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

// 간단한 사용자 아이콘 컴포넌트
const UserIcon: React.FC = () => (
  <span className="anticon">
    <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor">
      <path d="M858.5 763.6a374 374 0 00-80.6-119.5 375.63 375.63 0 00-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 18.9-85 46-119.5 80.6a375.63 375.63 0 00-80.6 119.5A371.7 371.7 0 00136 901.8a8 8 0 008 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C## 752.7 775 754.3 8 831.1 4.4 0 8-3.5 8-7.8 0-27.8-4.4-55.2-12.5-81.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362c0-45.9 17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362c0 45.9-17.9 89.1-50.4 121.6S557.9 534 512 534z"/>
    </svg>
  </span>
);

export default FreeBoardPage;
