import { useEffect, useState } from 'react';

/**
 * CSS 미디어 쿼리 일치 여부. 창 크기가 바뀌면 다시 평가한다.
 * 예: const isMobile = useMediaQuery('(max-width: 991px)');
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => typeof window !== 'undefined' && window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
