import React from 'react';

interface PageHeaderProps {
  /** 화면 제목 */
  title: React.ReactNode;
  /** 제목 아래 한 줄 설명 (운영자용 안내) */
  description?: React.ReactNode;
  /** 오른쪽 액션 (등록 버튼 등) */
  extra?: React.ReactNode;
}

/**
 * 관리자 화면 공통 제목 행. 모든 관리자 페이지의 첫 줄은 이 컴포넌트로 통일한다.
 */
const PageHeader: React.FC<PageHeaderProps> = ({ title, description, extra }) => (
  <div
    style={{
      marginBottom: 16,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
      flexWrap: 'wrap',
    }}
  >
    <div>
      <h2 style={{ margin: 0 }}>{title}</h2>
      {description && <div style={{ color: '#666', marginTop: 4, fontSize: 13 }}>{description}</div>}
    </div>
    {extra && <div>{extra}</div>}
  </div>
);

export default PageHeader;
