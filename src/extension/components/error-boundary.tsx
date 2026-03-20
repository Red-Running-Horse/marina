/**
 * Error Boundary component for graceful error handling in React
 *
 * Catches JavaScript errors anywhere in the component tree and displays
 * a fallback UI instead of crashing the entire application.
 */

import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { logger } from '../../infrastructure/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to our centralized logging system
    logger.error('React component error', error, {
      componentStack: errorInfo.componentStack,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="bg-primary flex items-center justify-center min-h-screen p-8">
          <div className="max-w-md p-6 bg-white rounded-lg shadow-lg">
            <h1 className="mb-4 text-2xl font-bold text-red-600">Something went wrong</h1>
            <p className="mb-4 text-gray-700">
              An unexpected error occurred in the Marina wallet. Please try again or contact support
              if the problem persists.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="p-4 mb-4 bg-gray-100 rounded">
                <summary className="font-semibold cursor-pointer">
                  Error details (development only)
                </summary>
                <pre className="mt-2 overflow-auto text-xs text-red-600">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-2">
              <button
                onClick={this.handleReset}
                className="bg-primary hover:bg-primary-dark px-4 py-2 text-white rounded"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="hover:bg-gray-100 px-4 py-2 border border-gray-300 rounded"
              >
                Reload Extension
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
