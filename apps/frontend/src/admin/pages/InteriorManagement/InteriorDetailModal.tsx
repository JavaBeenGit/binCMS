import React from 'react';
import { Button, Image, Modal, Space, Tag } from 'antd';
import type { InteriorResponse } from '@/shared/api/endpoints/interior';
import { interiorListPath } from '@/shared/constants/interior';

interface InteriorDetailModalProps {
  open: boolean;
  item: InteriorResponse | null;
  onClose: () => void;
  onEdit: (item: InteriorResponse) => void;
}

const InteriorDetailModal: React.FC<InteriorDetailModalProps> = ({ open, item, onClose, onEdit }) => (
  <Modal
    title={item?.title || '상세보기'}
    open={open}
    onCancel={onClose}
    footer={[
      <Button
        key="site"
        href={item ? `${interiorListPath(item.category)}/${item.id}` : undefined}
        target="_blank"
        disabled={!item || item.useYn !== 'Y'}
      >
        홈페이지에서 보기
      </Button>,
      <Button key="edit" type="primary" onClick={() => item && onEdit(item)}>
        수정
      </Button>,
      <Button key="close" onClick={onClose}>
        닫기
      </Button>,
    ]}
    width={900}
  >
    {item && (
      <div>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Tag color="blue">{item.categoryName}</Tag>
            <span style={{ color: '#999' }}>
              조회 {item.viewCount} · {new Date(item.regDt).toLocaleString('ko-KR')}
            </span>
          </Space>
        </div>
        {item.thumbnailUrl && (
          <div style={{ marginBottom: 16, textAlign: 'center' }}>
            <Image src={item.thumbnailUrl} style={{ maxHeight: 300, objectFit: 'contain' }} />
          </div>
        )}
        <div
          style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 24, minHeight: 200 }}
          dangerouslySetInnerHTML={{ __html: item.content }}
        />
      </div>
    )}
  </Modal>
);

export default InteriorDetailModal;
