import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Spin, Empty, Pagination, Tag, Button, Input, message, Popconfirm } from 'antd';
import { EyeOutlined, CalendarOutlined, CommentOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor, Essentials, Bold, Italic, Underline, Strikethrough,
  Heading, Paragraph, Link, List, BlockQuote, Table as CKTable,
  TableToolbar, Indent, IndentBlock, MediaEmbed, Alignment,
  Font, HorizontalLine, Image, ImageToolbar, ImageCaption,
  ImageStyle, ImageResize, ImageUpload, PasteFromOffice,
  GeneralHtmlSupport,
} from 'ckeditor5';
import { CKEditorUploadAdapterPlugin } from '../../shared/utils/ckEditorUploadAdapter';
import { publicPostApi } from '../../api/endpoints/public';
import { userPostApi, PostResponse } from '../../api/endpoints/post';
import { publicCommentApi } from '../../api/endpoints/comment';
import { useAuthStore } from '../../stores/authStore';
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
  const [mode, setMode] = useState<'list' | 'detail' | 'write' | 'edit'>('list');
  const [formTitle, setFormTitle] = useState('');
  const [editorData, setEditorData] = useState('');
  const queryClient = useQueryClient();
  const pageSize = 15;

  const { user, isAuthenticated } = useAuthStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated(),
  }));

  // CKEditor 설정
  const editorConfig = useMemo(() => ({
    licenseKey: 'GPL',
    plugins: [
      Essentials, Bold, Italic, Underline, Strikethrough,
      Heading, Paragraph, Link, List, BlockQuote, CKTable,
      TableToolbar, Indent, IndentBlock, MediaEmbed, Alignment,
      Font, HorizontalLine, Image, ImageToolbar, ImageCaption,
      ImageStyle, ImageResize, ImageUpload, PasteFromOffice,
      GeneralHtmlSupport,
    ],
    extraPlugins: [CKEditorUploadAdapterPlugin],
    htmlSupport: {
      allow: [{ name: /.*/, attributes: true, classes: true, styles: true }],
    },
    toolbar: {
      items: [
        'heading', '|',
        'bold', 'italic', 'underline', '|',
        'fontSize', 'fontColor', '|',
        'alignment', '|',
        'bulletedList', 'numberedList', '|',
        'link', 'insertImage', 'blockQuote', 'insertTable', '|',
        'horizontalLine', '|',
        'undo', 'redo',
      ],
      shouldNotGroupWhenFull: true,
    },
    image: {
      toolbar: ['imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'toggleImageCaption', 'imageTextAlternative', '|', 'resizeImage'],
    },
    table: { contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'] },
    language: 'ko',
  } as any), []);

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
    enabled: !!selectedPost && mode === 'detail',
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

  // 게시글 작성
  const createMutation = useMutation({
    mutationFn: (reqData: { title: string; content: string }) =>
      userPostApi.createPost(boardCode, reqData),
    onSuccess: () => {
      message.success('게시글이 등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['public-posts'] });
      setMode('list');
      setFormTitle('');
      setEditorData('');
    },
    onError: () => {
      message.error('게시글 등록에 실패했습니다.');
    },
  });

  // 게시글 수정
  const updateMutation = useMutation({
    mutationFn: ({ id, reqData }: { id: number; reqData: { title: string; content: string } }) =>
      userPostApi.updatePost(id, reqData),
    onSuccess: () => {
      message.success('게시글이 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['public-posts'] });
      queryClient.invalidateQueries({ queryKey: ['public-post-detail'] });
      setMode('list');
      setSelectedPost(null);
      setFormTitle('');
      setEditorData('');
    },
    onError: () => {
      message.error('게시글 수정에 실패했습니다.');
    },
  });

  // 게시글 삭제
  const deleteMutation = useMutation({
    mutationFn: (id: number) => userPostApi.deletePost(id),
    onSuccess: () => {
      message.success('게시글이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['public-posts'] });
      setMode('list');
      setSelectedPost(null);
    },
    onError: () => {
      message.error('게시글 삭제에 실패했습니다.');
    },
  });

  // 본인 글인지 확인 (REG_NO = 회원PK)
  const isMyPost = (post: PostResponse) => {
    if (!user || !post.regNo) return false;
    return String(user.id) === post.regNo;
  };

  // 글쓰기 버튼
  const handleWriteClick = () => {
    if (!isAuthenticated) {
      message.warning('로그인 후 글을 작성할 수 있습니다.');
      return;
    }
    setFormTitle('');
    setEditorData('');
    setMode('write');
  };

  // 수정 버튼 클릭
  const handleEditClick = () => {
    const post = detailData || selectedPost;
    if (post) {
      setFormTitle(post.title);
      setEditorData(post.content || '');
      setMode('edit');
    }
  };

  // 폼 제출
  const handleSubmit = () => {
    if (!formTitle.trim()) {
      message.warning('제목을 입력해주세요.');
      return;
    }
    if (!editorData.trim()) {
      message.warning('내용을 입력해주세요.');
      return;
    }
    if (mode === 'write') {
      createMutation.mutate({ title: formTitle, content: editorData });
    } else if (mode === 'edit' && selectedPost) {
      updateMutation.mutate({ id: selectedPost.id, reqData: { title: formTitle, content: editorData } });
    }
  };

  // ── 글쓰기/수정 폼 ──
  if (mode === 'write' || mode === 'edit') {
    return (
      <div>
        <div className="page-banner">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="page-container">
          <div className="post-form">
            <div className="post-form-header">
              <h2>{mode === 'write' ? '글쓰기' : '글수정'}</h2>
            </div>
            <div className="post-form-field">
              <label>제목</label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                maxLength={200}
                size="large"
              />
            </div>
            <div className="post-form-field">
              <label>내용</label>
              <div className="post-editor-wrapper">
                <CKEditor
                  editor={ClassicEditor}
                  config={editorConfig}
                  data={editorData}
                  onChange={(_event: any, editor: any) => {
                    setEditorData(editor.getData());
                  }}
                />
              </div>
            </div>
            <div className="post-form-actions">
              <Button
                onClick={() => {
                  setMode(mode === 'edit' ? 'detail' : 'list');
                  setFormTitle('');
                  setEditorData('');
                }}
              >
                취소
              </Button>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {mode === 'write' ? '등록' : '수정'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 상세 보기 ──
  if (mode === 'detail' && selectedPost) {
    const post = detailData || selectedPost;
    return (
      <div>
        <div className="page-banner">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="page-container">
          <div className="post-detail">
            <button className="back-btn" onClick={() => { setMode('list'); setSelectedPost(null); }}>
              ← 목록으로
            </button>
            <div className="post-detail-header">
              <h2 className="post-detail-title">
                {post.noticeYn === 'Y' && <Tag color="red">공지</Tag>}
                {post.title}
              </h2>
              <div className="post-detail-meta">
                <span><UserIcon /> {post.displayAuthorName || post.authorName || '익명'}</span>
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

            {/* 본인 글이면 수정/삭제 버튼 */}
            {isMyPost(post) && (
              <div className="post-detail-actions">
                <Button icon={<EditOutlined />} onClick={handleEditClick}>
                  수정
                </Button>
                <Popconfirm
                  title="게시글 삭제"
                  description="정말로 이 게시글을 삭제하시겠습니까?"
                  onConfirm={() => deleteMutation.mutate(post.id)}
                  okText="삭제"
                  cancelText="취소"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger icon={<DeleteOutlined />} loading={deleteMutation.isPending}>
                    삭제
                  </Button>
                </Popconfirm>
              </div>
            )}

            {/* 댓글 섹션 */}
            <CommentSection postId={post.id} />
          </div>
        </div>
      </div>
    );
  }

  // ── 목록 보기 ──
  return (
    <div>
      <div className="page-banner">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="page-container">
        {/* 글쓰기 버튼 */}
        <div className="free-board-toolbar">
          {isAuthenticated && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleWriteClick}>
              글쓰기
            </Button>
          )}
        </div>

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
                  onClick={() => { setSelectedPost(post); setMode('detail'); }}
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
                  <span className="col-author">{post.displayAuthorName || post.authorName || '익명'}</span>
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
