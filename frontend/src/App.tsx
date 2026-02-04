import { useEffect, useState } from 'react';
import { healthApi, HealthResponse } from './api/endpoints/health';

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await healthApi.check();
        setHealth(response);
      } catch (err) {
        setError('Failed to connect to API');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>🎉 binCMS - React + Spring Boot</h1>
      <div style={{ marginTop: '20px', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
        <h2>Health Check</h2>
        {health && (
          <div>
            <p><strong>Status:</strong> {health.data.status}</p>
            <p><strong>Message:</strong> {health.data.message}</p>
            <p><strong>Timestamp:</strong> {health.data.timestamp}</p>
          </div>
        )}
      </div>
      <div style={{ marginTop: '20px' }}>
        <h3>✅ 프로젝트 설정 완료</h3>
        <ul>
          <li>Backend: Spring Boot 3.3.0 + Java 21</li>
          <li>Frontend: React 18 + TypeScript + Vite</li>
          <li>API 통신: 정상 작동 중</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
