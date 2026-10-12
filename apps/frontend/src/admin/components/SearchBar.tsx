import React, { useEffect, useState } from 'react';
import { Input, Space } from 'antd';

interface SearchBarProps {
  placeholder?: string;
  /** 적용된 검색어 (부모 상태). 바뀌면 입력창도 맞춘다. */
  value: string;
  /** Enter·돋보기·지우기(allowClear)로 확정됐을 때만 호출된다 — 키 입력마다 요청하지 않는다. */
  onSearch: (keyword: string) => void;
  width?: number;
  /** 검색창 왼쪽 필터(Select 등) */
  children?: React.ReactNode;
}

/**
 * 관리자 목록 공통 검색줄: [필터…] [검색어 ⌕]
 */
const SearchBar: React.FC<SearchBarProps> = ({ placeholder = '검색어', value, onSearch, width = 300, children }) => {
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  return (
    <Space style={{ marginBottom: 16 }} size="middle" wrap>
      {children}
      <Input.Search
        placeholder={placeholder}
        style={{ width }}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          // allowClear 의 X 버튼은 onChange 로 빈 값이 들어온다 → 즉시 적용
          if (e.target.value === '' && value !== '') onSearch('');
        }}
        onSearch={(v) => onSearch(v.trim())}
        allowClear
      />
    </Space>
  );
};

export default SearchBar;
