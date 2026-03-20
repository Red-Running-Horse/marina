/**
 * Centralized logging infrastructure for Marina wallet
 *
 * Provides structured logging with appropriate log levels and
 * integration with error tracking services like Sentry.
 */

import * as Sentry from '@sentry/browser';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogContext {
  [key: string]: any;
}

class Logger {
  /**
   * Check if running in development mode
   */
  private get isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  /**
   * Debug level logging - only shown in development
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(`[Marina Debug] ${message}`, context || '');
    }
  }

  /**
   * Info level logging - general information
   */
  info(message: string, context?: LogContext): void {
    console.info(`[Marina] ${message}`, context || '');
  }

  /**
   * Warning level logging - potential issues
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`[Marina Warning] ${message}`, context || '');

    // Log warnings to Sentry with low severity
    if (!this.isDevelopment) {
      Sentry.captureMessage(message, {
        level: 'warning',
        tags: { type: 'warning' },
        extra: context,
      });
    }
  }

  /**
   * Error level logging - critical issues
   */
  error(message: string, error?: Error, context?: LogContext): void {
    console.error(`[Marina Error] ${message}`, error || '', context || '');

    // Always report errors to Sentry in production
    if (!this.isDevelopment && error) {
      Sentry.captureException(error, {
        tags: { context: message },
        extra: context,
      });
    }
  }

  /**
   * Log performance metrics
   */
  performance(operation: string, durationMs: number, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(`[Marina Performance] ${operation}: ${durationMs}ms`, context || '');
    }

    // Report slow operations to Sentry
    if (durationMs > 1000 && !this.isDevelopment) {
      Sentry.captureMessage(`Slow operation: ${operation}`, {
        level: 'warning',
        tags: { type: 'performance' },
        extra: { ...context, durationMs },
      });
    }
  }

  /**
   * Measure and log execution time of an async operation
   */
  async measure<T>(operation: string, fn: () => Promise<T>, context?: LogContext): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.performance(operation, duration, context);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`${operation} failed after ${duration}ms`, error as Error, context);
      throw error;
    }
  }
}

// Export singleton instance
export const logger = new Logger();
