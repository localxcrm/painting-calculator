'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Something went wrong!</h4>
              <p>We&apos;re sorry, but something unexpected happened.</p>
              <hr />
              <p className="mb-0">
                <button 
                  className="btn btn-outline-danger"
                  onClick={() => this.setState({ hasError: false, error: undefined })}
                >
                  Try again
                </button>
                {' '}
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Go to Dashboard
                </button>
              </p>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-3">
                <summary className="btn btn-outline-secondary btn-sm">
                  Show error details
                </summary>
                <pre className="text-start mt-2 p-3 bg-light border rounded">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
