import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons';
import { useAdminAuthStore } from '../../stores/adminAuthStore';

/**
 * 대시보드 페이지
 */
const Dashboard: React.FC = () => {
  const user = useAdminAuthStore((state) => state.user);

  return (
    <div>
      <h1>대시보드</h1>
      <p>안녕하세요, {user?.name}님! binCMS 관리자 페이지에 오신 것을 환영합니다.</p>
      
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="전체 회원"
              value={0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="게시판"
              value={0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="오늘 방문자"
              value={0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }} title="시스템 정보">
        <p><strong>역할:</strong> {user?.role === 'ADMIN' ? '관리자' : '일반 사용자'}</p>
        <p><strong>이메일:</strong> {user?.email}</p>
        <p><strong>가입일:</strong> {user?.regDt ? new Date(user.regDt).toLocaleDateString('ko-KR') : '-'}</p>
      </Card>
    </div>
  );
};

export default Dashboard;
