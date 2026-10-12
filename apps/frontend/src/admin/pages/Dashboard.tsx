import React from 'react';
import { Card, Row, Col, Statistic, Badge } from 'antd';
import { UserOutlined, FileTextOutlined, PictureOutlined, MessageOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '@/shared/stores/adminAuthStore';
import { adminDashboardApi } from '@/shared/api/endpoints/dashboard';

/**
 * 대시보드 — 운영자가 로그인하자마자 "처리할 문의가 있는지"를 보는 화면.
 */
const Dashboard: React.FC = () => {
  const user = useAdminAuthStore((state) => state.user);
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ['adminDashboardSummary'],
    queryFn: async () => (await adminDashboardApi.summary()).data,
    refetchInterval: 60_000,
  });

  const pending = data?.pendingInquiries ?? 0;

  return (
    <div>
      <h1>대시보드</h1>
      <p>안녕하세요, {user?.name}님! 수디자인 관리자 페이지에 오신 것을 환영합니다.</p>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/admin/posts/qna')} style={{ cursor: 'pointer' }}>
            <Badge count={pending} offset={[8, 0]}>
              <Statistic
                title="대기 중인 견적문의"
                value={pending}
                prefix={<MessageOutlined />}
                valueStyle={{ color: pending > 0 ? '#cf1322' : '#3f8600' }}
              />
            </Badge>
            <div style={{ marginTop: 8, color: '#888' }}>클릭하면 문의 관리로 이동</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/admin/interiors/onsite')} style={{ cursor: 'pointer' }}>
            <Statistic title="시공사례(사용 중)" value={data?.interiors ?? 0} prefix={<PictureOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/admin/posts/notice')} style={{ cursor: 'pointer' }}>
            <Statistic title="게시글" value={data?.posts ?? 0} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/admin/users')} style={{ cursor: 'pointer' }}>
            <Statistic title="회원(관리자 포함)" value={data?.members ?? 0} prefix={<UserOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }} title="내 계정">
        <p><strong>역할:</strong> {user?.roleName ?? (user?.roleCode?.endsWith('ADMIN') ? '관리자' : '일반 사용자')}</p>
        <p><strong>이메일:</strong> {user?.email || '-'}</p>
        <p><strong>가입일:</strong> {user?.regDt ? new Date(user.regDt).toLocaleDateString('ko-KR') : '-'}</p>
      </Card>
    </div>
  );
};

export default Dashboard;
