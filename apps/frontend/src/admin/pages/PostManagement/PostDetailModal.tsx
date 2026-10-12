import React from 'react';
import { Button, Descriptions, Modal, Tag } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import type { PostResponse } from '@/shared/api/endpoints/post';

interface PostDetailModalProps {
  open: boolean;
  post: PostResponse | null;
  showBoard: boolean;
  onClose: () => void;
  onEdit: (post: PostResponse) => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ open, post, showBoard, onClose, onEdit }) => (
  <Modal
    title="게시글 상세보기"
    open={open}
    onCancel={onClose}
    width={900}
    footer={[
      <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => post && onEdit(post)}>
        수정
      </Button>,
      <Button key="close" onClick={onClose}>
        닫기
      </Button>,
    ]}
  >
    {post && (
      <>
        <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
          {showBoard && <Descriptions.Item label="게시판">{post.boardName}</Descriptions.Item>}
          <Descriptions.Item label="제목" span={showBoard ? 1 : 2}>{post.title}</Descriptions.Item>
          <Descriptions.Item label="공지여부">
            <Tag color={post.noticeYn === 'Y' ? 'red' : 'default'}>{post.noticeYn === 'Y' ? '공지' : '일반'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="상태">
            <Tag color={post.useYn === 'Y' ? 'green' : 'red'}>{post.useYn === 'Y' ? '사용' : '미사용'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="조회수">{post.viewCount}</Descriptions.Item>
          <Descriptions.Item label="작성일">{new Date(post.regDt).toLocaleString('ko-KR')}</Descriptions.Item>
          {post.modDt && (
            <Descriptions.Item label="수정일">{new Date(post.modDt).toLocaleString('ko-KR')}</Descriptions.Item>
          )}
        </Descriptions>
        <div
          className="ck-content"
          style={{ border: '1px solid #f0f0f0', borderRadius: 4, padding: 16, minHeight: 200 }}
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
        />
      </>
    )}
  </Modal>
);

export default PostDetailModal;
