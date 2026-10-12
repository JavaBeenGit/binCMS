import React from 'react';
import { Button, Result } from 'antd';

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * 화면 렌더링 중 예외가 나면 빈 화면 대신 안내 + 새로고침 버튼을 보여 준다.
 * (지연 로딩 청크 실패, 예상 못 한 데이터 모양 등)
 */
class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('화면 오류:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <Result
          status="error"
          title="화면을 불러오지 못했습니다"
          subTitle="새로고침하면 대부분 해결됩니다. 계속 반복되면 개발자에게 알려 주세요."
          extra={
            <Button type="primary" onClick={() => window.location.reload()}>
              새로고침
            </Button>
          }
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
