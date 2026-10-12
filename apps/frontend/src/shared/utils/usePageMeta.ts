import { useEffect } from 'react';
import { BUSINESS } from '@/shared/constants/business';

/**
 * 공개 페이지의 <title>·meta description·og:title/description 을 갱신한다.
 * 라이브러리 없이 document 를 직접 만진다. 프리렌더가 없는 SPA 라 검색엔진은 JS 실행 후의 값을 본다.
 */
export function usePageMeta(title?: string, description?: string) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${BUSINESS.name}` : `${BUSINESS.slogan}`;
    const desc = description ?? BUSINESS.description;
    document.title = fullTitle;
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
  }, [title, description]);
}

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}
