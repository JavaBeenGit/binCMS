import React from 'react';
import { Link } from 'react-router-dom';
import { Spin, message } from 'antd';
import { CalendarOutlined, EyeOutlined, LinkOutlined, UnorderedListOutlined } from '@ant-design/icons';
import 'ckeditor5/ckeditor5.css';
import './ArticleView.css';

interface ArticleViewProps {
  /** 목록으로 돌아갈 경로 (목록에서 들어왔으면 보던 페이지 포함) */
  listPath: string;
  listLabel: string;
  title?: string;
  /** 제목 앞 배지(공지 태그 등) */
  badge?: React.ReactNode;
  regDt?: string;
  viewCount?: number;
  contentHtml?: string;
  loading?: boolean;
}

/**
 * 글 한 편을 페이지로 보여 주는 공통 틀 — 시공사례 상세·공지사항 상세가 같이 쓴다.
 * 배너는 각 페이지가 그리고, 이 컴포넌트는 본문과 하단 버튼(목록으로·주소 복사)만 맡는다.
 */
const ArticleView: React.FC<ArticleViewProps> = ({ listPath, listLabel, title, badge, regDt, viewCount, contentHtml, loading }) => {
  const copyUrl = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      message.success('주소를 복사했습니다. 카카오톡·문자에 붙여 넣어 보내세요.');
    } catch {
      window.prompt('아래 주소를 복사하세요', url);
    }
  };

  return (
    <article className="article-page">
      <div className="article-crumb">
        <Link to={listPath}>{listLabel}</Link>
      </div>
      {loading ? (
        <div className="article-loading"><Spin size="large" /></div>
      ) : (
        <>
          <h1 className="article-title">
            {badge}
            <span>{title}</span>
          </h1>
          <div className="article-meta">
            {regDt && <span><CalendarOutlined /> {new Date(regDt).toLocaleDateString('ko-KR')}</span>}
            {typeof viewCount === 'number' && <span><EyeOutlined /> {viewCount}</span>}
          </div>
          <div className="article-content ck-content" dangerouslySetInnerHTML={{ __html: contentHtml || '' }} />
          <div className="article-actions">
            <Link to={listPath} className="article-btn"><UnorderedListOutlined /> {listLabel}</Link>
            <button type="button" className="article-btn" onClick={copyUrl}><LinkOutlined /> 주소 복사</button>
          </div>
        </>
      )}
    </article>
  );
};

export default ArticleView;
