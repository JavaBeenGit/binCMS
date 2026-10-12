import React from 'react';
import { Button, Descriptions, Modal, Tag } from 'antd';
import type { UserMemberResponse } from '@/shared/api/endpoints/userMember';
import { getProviderTag } from './userColumns';

interface UserDetailModalProps {
  open: boolean;
  user: UserMemberResponse | null;
  onClose: () => void;
  /** "수정" 버튼 — 부모가 상세를 닫고 수정 모달을 연다 */
  onEdit: (user: UserMemberResponse) => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ open, user, onClose, onEdit }) => (
  <Modal
    title="사용자 상세 정보"
    open={open}
    onCancel={onClose}
    footer={[
      <Button key="edit" type="primary" onClick={() => user && onEdit(user)}>
        수정
      </Button>,
      <Button key="close" onClick={onClose}>
        닫기
      </Button>,
    ]}
    width={600}
  >
    {user && (
      <Descriptions bordered column={1} size="small" style={{ marginTop: 16 }}>
        <Descriptions.Item label="아이디">{user.loginId}</Descriptions.Item>
        <Descriptions.Item label="이름">{user.name}</Descriptions.Item>
        <Descriptions.Item label="이메일">{user.email || '-'}</Descriptions.Item>
        <Descriptions.Item label="전화번호">{user.phoneNumber || '-'}</Descriptions.Item>
        <Descriptions.Item label="가입방식">{getProviderTag(user.provider)}</Descriptions.Item>
        <Descriptions.Item label="이메일 인증">
          {user.emailVerified ? <Tag color="success">인증됨</Tag> : <Tag color="warning">미인증</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="상태">
          {user.active ? <Tag color="success">정상</Tag> : <Tag color="error">차단</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="가입일">{user.regDt ? new Date(user.regDt).toLocaleString('ko-KR') : '-'}</Descriptions.Item>
      </Descriptions>
    )}
  </Modal>
);

export default UserDetailModal;
