import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Maestro App caught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.clear();
    } catch {}
    window.location.href = window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0b0d1b',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎼</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fbbf24', marginBottom: '8px' }}>
            指揮台重整中
          </h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '420px', marginBottom: '24px', lineHeight: '1.6' }}>
            應用程式遇到暫時性問題。您可以點擊下方按鈕重新載入或重置遊戲狀態。
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={this.handleReload}
              style={{
                backgroundColor: '#fbbf24',
                color: '#0f172a',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 20px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              重新整理
            </button>
            <button
              onClick={this.handleReset}
              style={{
                backgroundColor: '#1e293b',
                color: '#e2e8f0',
                border: '1px solid #475569',
                borderRadius: '10px',
                padding: '10px 20px',
                cursor: 'pointer'
              }}
            >
              重設並返回首頁
            </button>
          </div>
          {this.state.error && (
            <pre style={{
              marginTop: '24px',
              padding: '12px',
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: '8px',
              color: '#f87171',
              fontSize: '11px',
              maxWidth: '90vw',
              overflowX: 'auto',
              textAlign: 'left'
            }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
