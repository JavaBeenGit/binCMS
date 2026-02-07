import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Spin, Result, Button, Typography } from 'antd';
import { ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons';
import { publicContentApi } from '../../api/endpoints/content';
import 'ckeditor5/ckeditor5.css';

const { Title } = Typography;

const ContentPage: React.FC = () => {
  const { contentKey } = useParams<{ contentKey: string }>();
  const navigate = useNavigate();

  const { data: content, isLoading, isError } = useQuery({
    queryKey: ['public-content', contentKey],
    queryFn: async () => {
      const res = await publicContentApi.getByKey(contentKey!);
      return res.data.data;
    },
    enabled: !!contentKey,
  });

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
      }}>
        <Spin size="large" tip="로딩 중..." />
      </div>
    );
  }

  if (isError || !content) {
    return (
      <Result
        status="404"
        title="페이지를 찾을 수 없습니다"
        subTitle={`요청하신 페이지(${contentKey})가 존재하지 않거나 비활성 상태입니다.`}
        extra={
          <Button type="primary" icon={<HomeOutlined />} onClick={() => navigate('/')}>
            홈으로
          </Button>
        }
      />
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
      {/* 뒤로가기 */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16, color: '#666' }}
      >
        뒤로가기
      </Button>

      {/* 제목 */}
      <Title level={2} style={{ marginBottom: 32 }}>
        {content.title}
      </Title>

      {/* 본문 - CKEditor로 작성한 HTML 렌더링 */}
      <div
        className="ck-content"
        dangerouslySetInnerHTML={{ __html: content.content || '' }}
        style={{
          lineHeight: 1.8,
          fontSize: 15,
          color: '#333',
          wordBreak: 'keep-all',
        }}
      />
    </div>
  );
};

export default ContentPage;
