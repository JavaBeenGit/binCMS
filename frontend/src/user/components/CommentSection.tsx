import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Input, message, Modal, Spin } from 'antd';
import { DeleteOutlined, EditOutlined, CommentOutlined, UserOutlined } from '@ant-design/icons';
import { publicCommentApi, CommentResponse } from '../../api/endpoints/comment';
import './CommentSection.css';

const { TextArea } = Input;

interface CommentSectionProps {
  postId: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const queryClient = useQueryClient();
  const [authorName, setAuthorName] = useState('');
  const [password, setPassword] = useState('');
  const [content, setContent] = useState('');

  // 대댓글
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyAuthorName, setReplyAuthorName] = useState('');
  const [replyPassword, setReplyPassword] = useState('');
  const [replyContent, setReplyContent] = useState('');

  // 수정
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editPassword, setEditPassword] = useState('');

  // 삭제
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deletePassword, setDeletePassword] = useState('');

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const res = await publicCommentApi.getByPostId(postId);
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: publicCommentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      setAuthorName('');
      setPassword('');
      setContent('');
      message.success('댓글이 등록되었습니다.');
    },
    onError: () => message.error('댓글 등록에 실패했습니다.'),
  });

  const replyMutation = useMutation({
    mutationFn: publicCommentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      setReplyTo(null);
      setReplyAuthorName('');
      setReplyPassword('');
      setReplyContent('');
      message.success('답글이 등록되었습니다.');
    },
    onError: () => message.error('답글 등록에 실패했습니다.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { password: string; content: string } }) =>
      publicCommentApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      setEditingId(null);
      setEditContent('');
      setEditPassword('');
      message.success('댓글이 수정되었습니다.');
    },
    onError: () => message.error('비밀번호가 일치하지 않습니다.'),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      publicCommentApi.delete(id, { password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      setDeleteId(null);
      setDeletePassword('');
      message.success('댓글이 삭제되었습니다.');
    },
    onError: () => message.error('비밀번호가 일치하지 않습니다.'),
  });

  const handleSubmit = () => {
    if (!authorName.trim() || !password.trim() || !content.trim()) {
      message.warning('이름, 비밀번호, 내용을 모두 입력해주세요.');
      return;
    }
    createMutation.mutate({ postId, authorName, password, content });
  };

  const handleReplySubmit = (parentId: number) => {
    if (!replyAuthorName.trim() || !replyPassword.trim() || !replyContent.trim()) {
      message.warning('이름, 비밀번호, 내용을 모두 입력해주세요.');
      return;
    }
    replyMutation.mutate({
      postId,
      parentId,
      authorName: replyAuthorName,
      password: replyPassword,
      content: replyContent,
    });
  };

  const handleUpdate = () => {
    if (!editContent.trim() || !editPassword.trim()) {
      message.warning('비밀번호와 내용을 모두 입력해주세요.');
      return;
    }
    updateMutation.mutate({
      id: editingId!,
      data: { password: editPassword, content: editContent },
    });
  };

  const handleDelete = () => {
    if (!deletePassword.trim()) {
      message.warning('비밀번호를 입력해주세요.');
      return;
    }
    deleteMutation.mutate({ id: deleteId!, password: deletePassword });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}.${MM}.${dd} ${hh}:${mm}`;
  };

  const renderComment = (comment: CommentResponse, isReply = false) => (
    <div key={comment.id} className={`comment-item ${isReply ? 'reply' : ''}`}>
      <div className="comment-header">
        <span className="comment-author">
          <UserOutlined /> {comment.authorName}
        </span>
        <span className="comment-date">{formatDate(comment.regDt)}</span>
      </div>

      {editingId === comment.id ? (
        <div className="comment-edit-form">
          <TextArea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            placeholder="수정할 내용을 입력하세요"
          />
          <div className="comment-edit-actions">
            <Input.Password
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              placeholder="비밀번호"
              style={{ width: 150 }}
            />
            <Button type="primary" size="small" onClick={handleUpdate} loading={updateMutation.isPending}>
              수정
            </Button>
            <Button size="small" onClick={() => { setEditingId(null); setEditPassword(''); }}>
              취소
            </Button>
          </div>
        </div>
      ) : (
        <div className="comment-content">{comment.content}</div>
      )}

      {editingId !== comment.id && (
        <div className="comment-actions">
          {!isReply && (
            <button
              className="comment-action-btn"
              onClick={() => {
                setReplyTo(replyTo === comment.id ? null : comment.id);
                setReplyAuthorName('');
                setReplyPassword('');
                setReplyContent('');
              }}
            >
              <CommentOutlined /> 답글
            </button>
          )}
          <button
            className="comment-action-btn"
            onClick={() => {
              setEditingId(comment.id);
              setEditContent(comment.content);
              setEditPassword('');
            }}
          >
            <EditOutlined /> 수정
          </button>
          <button
            className="comment-action-btn"
            onClick={() => { setDeleteId(comment.id); setDeletePassword(''); }}
          >
            <DeleteOutlined /> 삭제
          </button>
        </div>
      )}

      {/* 답글 입력 폼 */}
      {replyTo === comment.id && (
        <div className="reply-form">
          <div className="reply-form-row">
            <Input
              value={replyAuthorName}
              onChange={(e) => setReplyAuthorName(e.target.value)}
              placeholder="이름"
              style={{ width: 120 }}
            />
            <Input.Password
              value={replyPassword}
              onChange={(e) => setReplyPassword(e.target.value)}
              placeholder="비밀번호"
              style={{ width: 150 }}
            />
          </div>
          <TextArea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={2}
            placeholder="답글을 입력하세요"
          />
          <div className="reply-form-actions">
            <Button
              type="primary"
              size="small"
              onClick={() => handleReplySubmit(comment.id)}
              loading={replyMutation.isPending}
            >
              답글 등록
            </Button>
            <Button size="small" onClick={() => setReplyTo(null)}>
              취소
            </Button>
          </div>
        </div>
      )}

      {/* 대댓글 렌더링 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies-list">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  const totalCount = (comments || []).reduce(
    (acc, c) => acc + 1 + (c.replies ? c.replies.length : 0),
    0
  );

  return (
    <div className="comment-section">
      <h3 className="comment-section-title">
        <CommentOutlined /> 댓글 <span className="comment-count">{totalCount}</span>
      </h3>

      {/* 댓글 목록 */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spin />
        </div>
      ) : (comments || []).length === 0 ? (
        <div className="no-comments">첫 번째 댓글을 남겨보세요!</div>
      ) : (
        <div className="comments-list">
          {(comments || []).map((c) => renderComment(c))}
        </div>
      )}

      {/* 새 댓글 입력 */}
      <div className="comment-form">
        <div className="comment-form-header">
          <Input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="이름"
            maxLength={50}
            style={{ width: 150 }}
          />
          <Input.Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            maxLength={20}
            style={{ width: 180 }}
          />
        </div>
        <TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="댓글을 입력하세요"
          maxLength={2000}
          showCount
        />
        <div className="comment-form-actions">
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={createMutation.isPending}
          >
            댓글 등록
          </Button>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      <Modal
        title="댓글 삭제"
        open={deleteId !== null}
        onOk={handleDelete}
        onCancel={() => { setDeleteId(null); setDeletePassword(''); }}
        okText="삭제"
        cancelText="취소"
        confirmLoading={deleteMutation.isPending}
      >
        <p>댓글을 삭제하시겠습니까? 비밀번호를 입력하세요.</p>
        <Input.Password
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
          placeholder="비밀번호"
          onPressEnter={handleDelete}
        />
      </Modal>
    </div>
  );
};

export default CommentSection;
