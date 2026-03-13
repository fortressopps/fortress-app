import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('[ErrorBoundary]', error, info);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
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
                    gap: '24px',
                    background: '#0a0a0a',
                    color: '#fff',
                    padding: '24px',
                    textAlign: 'center',
                    fontFamily: "'Inter', system-ui, sans-serif",
                }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 12,
                        background: 'rgba(239,68,68,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem',
                    }}>⚠️</div>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Something went wrong</h1>
                        <p style={{ color: '#6b7280', fontSize: 14, maxWidth: 400 }}>
                            {this.state.error?.message || 'An unexpected error occurred.'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            onClick={this.handleRetry}
                            style={{
                                padding: '10px 20px',
                                background: '#22c55e',
                                border: 'none',
                                borderRadius: 8,
                                color: '#fff',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                            }}
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => { window.location.href = '/'; }}
                            style={{
                                padding: '10px 20px',
                                background: 'transparent',
                                border: '1px solid #1a1a1a',
                                borderRadius: 8,
                                color: '#fff',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                            }}
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
