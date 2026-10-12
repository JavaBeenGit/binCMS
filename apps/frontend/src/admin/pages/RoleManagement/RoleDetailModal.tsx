import React, { useMemo } from 'react';
import { Button, Descriptions, Modal, Tag } from 'antd';
import type { PermissionResponse, RoleResponse } from '@/shared/api/endpoints/adminMember';

interface RoleDetailModalProps {
  open: boolean;
  /** 상세 조회 결과 (permissions 포함) */
  role: RoleResponse | null;
  /** 권한 코드를 권한명으로 바꿔 보여 주기 위한 전체 권한 목록 */
  permissions?: PermissionResponse[];
  onClose: () => void;
}

const RoleDetailModal: React.FC<RoleDetailModalProps> = ({ open, role, permissions, onClose }) => {
  // 권한 코드 → 이름 맵
  const permNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    permissions?.forEach((p) => {
      map[p.permCode] = p.permName;
    });
    return map;
  }, [permissions]);

  return (
    <Modal
      title={`역할 상세 - ${role?.roleName || ''}`}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          닫기
        </Button>,
      ]}
      width={600}
    >
      {role && (
        <>
          <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="역할 코드">{role.roleCode}</Descriptions.Item>
            <Descriptions.Item label="역할명">{role.roleName}</Descriptions.Item>
            <Descriptions.Item label="정렬 순서">{role.sortOrder}</Descriptions.Item>
            <Descriptions.Item label="상태">
              <Tag color={role.useYn === 'Y' ? 'green' : 'red'}>{role.useYn === 'Y' ? '사용' : '미사용'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="설명" span={2}>
              {role.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="등록일" span={2}>
              {role.regDt ? new Date(role.regDt).toLocaleString('ko-KR') : '-'}
            </Descriptions.Item>
          </Descriptions>

          <h4 style={{ marginBottom: 8 }}>할당된 권한 ({role.permissions?.length || 0}개)</h4>
          {role.permissions && role.permissions.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {role.permissions.map((code) => (
                <Tag key={code} color="blue" style={{ marginBottom: 4 }}>
                  {permNameMap[code] || code}
                </Tag>
              ))}
            </div>
          ) : (
            <span style={{ color: '#999' }}>할당된 권한이 없습니다.</span>
          )}
        </>
      )}
    </Modal>
  );
};

export default RoleDetailModal;
