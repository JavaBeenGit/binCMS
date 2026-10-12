import React from 'react';
import { Button, Card, Descriptions, Modal, Tag } from 'antd';
import type { ContentResponse } from '@/shared/api/endpoints/content';

interface ContentDetailModalProps {
  open: boolean;
  content: ContentResponse | null;
  onClose: () => void;
  onEdit: (content: ContentResponse) => void;
}

const ContentDetailModal: React.FC<ContentDetailModalProps> = ({ open, content, onClose, onEdit }) => (
  <Modal
    title="컨텐츠 상세"
    open={open}
    onCancel={onClose}
    footer={[
      <Button key="edit" type="primary" onClick={() => content && onEdit(content)}>
        수정
      </Button>,
      <Button key="close" onClick={onClose}>
        닫기
      </Button>,
    ]}
    width={960}
  >
    {content && (
      <>
        <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
          <Descriptions.Item label="ID">{content.id}</Descriptions.Item>
          <Descriptions.Item label="컨텐츠 키">
            <Tag color="blue">{content.contentKey}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="제목" span={2}>{content.title}</Descriptions.Item>
          <Descriptions.Item label="조회수">{content.viewCount}</Descriptions.Item>
          <Descriptions.Item label="상태">
            <Tag color={content.useYn === 'Y' ? 'green' : 'red'}>
              {content.useYn === 'Y' ? '사용' : '미사용'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="정렬순서">{content.sortOrder}</Descriptions.Item>
          <Descriptions.Item label="등록일">{content.regDt?.substring(0, 19)}</Descriptions.Item>
          <Descriptions.Item label="수정일">{content.modDt?.substring(0, 19)}</Descriptions.Item>
          {content.description && (
            <Descriptions.Item label="설명" span={2}>{content.description}</Descriptions.Item>
          )}
        </Descriptions>
        <Card title="내용 미리보기" size="small">
          <div
            className="ck-content"
            dangerouslySetInnerHTML={{ __html: content.content || '<p>내용 없음</p>' }}
            style={{ minHeight: 200, padding: 16 }}
          />
        </Card>
      </>
    )}
  </Modal>
);

export default ContentDetailModal;
