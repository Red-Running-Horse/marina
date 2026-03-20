/**
 * Tests for centralized logging infrastructure
 */

import { logger, LogLevel } from '../src/infrastructure/logger';
import * as Sentry from '@sentry/browser';

// Mock Sentry
jest.mock('@sentry/browser', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

describe('Logger', () => {
  let consoleDebugSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Spy on console methods
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Clear Sentry mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore console methods
    consoleDebugSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    
    // Restore NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('debug', () => {
    it('should log debug messages in development mode', () => {
      process.env.NODE_ENV = 'development';
      
      logger.debug('Test debug message', { key: 'value' });
      
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[Marina Debug] Test debug message',
        { key: 'value' }
      );
    });

    it('should not log debug messages in production mode', () => {
      process.env.NODE_ENV = 'production';
      
      logger.debug('Test debug message');
      
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });

    it('should handle debug without context', () => {
      process.env.NODE_ENV = 'development';
      
      logger.debug('Test message');
      
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[Marina Debug] Test message',
        ''
      );
    });
  });

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('Test info message', { data: 123 });
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[Marina] Test info message',
        { data: 123 }
      );
    });

    it('should log info messages in both dev and production', () => {
      process.env.NODE_ENV = 'production';
      
      logger.info('Production info');
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[Marina] Production info',
        ''
      );
    });
  });

  describe('warn', () => {
    it('should log warning messages to console', () => {
      logger.warn('Test warning', { issue: 'slow-network' });
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[Marina Warning] Test warning',
        { issue: 'slow-network' }
      );
    });

    it('should send warnings to Sentry in production', () => {
      process.env.NODE_ENV = 'production';
      
      logger.warn('Production warning', { context: 'test' });
      
      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        'Production warning',
        {
          level: 'warning',
          tags: { type: 'warning' },
          extra: { context: 'test' },
        }
      );
    });

    it('should not send warnings to Sentry in development', () => {
      process.env.NODE_ENV = 'development';
      
      logger.warn('Dev warning');
      
      expect(Sentry.captureMessage).not.toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should log error messages to console', () => {
      const error = new Error('Test error');
      
      logger.error('Something went wrong', error, { txid: 'abc123' });
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Marina Error] Something went wrong',
        error,
        { txid: 'abc123' }
      );
    });

    it('should send errors to Sentry in production', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Production error');
      
      logger.error('Critical failure', error, { component: 'signer' });
      
      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        {
          tags: { context: 'Critical failure' },
          extra: { component: 'signer' },
        }
      );
    });

    it('should not send errors to Sentry in development', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Dev error');
      
      logger.error('Dev failure', error);
      
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('should handle errors without Error object', () => {
      logger.error('Error without exception');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Marina Error] Error without exception',
        '',
        ''
      );
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });
  });

  describe('performance', () => {
    it('should log performance metrics in development', () => {
      process.env.NODE_ENV = 'development';
      
      logger.performance('signTransaction', 250, { inputs: 2 });
      
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[Marina Performance] signTransaction: 250ms',
        { inputs: 2 }
      );
    });

    it('should not log fast operations in production', () => {
      process.env.NODE_ENV = 'production';
      
      logger.performance('fastOperation', 50);
      
      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(Sentry.captureMessage).not.toHaveBeenCalled();
    });

    it('should report slow operations to Sentry in production', () => {
      process.env.NODE_ENV = 'production';
      
      logger.performance('slowOperation', 2500, { reason: 'network' });
      
      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        'Slow operation: slowOperation',
        {
          level: 'warning',
          tags: { type: 'performance' },
          extra: { reason: 'network', durationMs: 2500 },
        }
      );
    });
  });

  describe('measure', () => {
    it('should measure and return result of async operation', async () => {
      process.env.NODE_ENV = 'development';
      const asyncFn = jest.fn(async () => 'result');
      
      const result = await logger.measure('testOperation', asyncFn, { test: true });
      
      expect(result).toBe('result');
      expect(asyncFn).toHaveBeenCalled();
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Marina Performance] testOperation:'),
        { test: true }
      );
    });

    it('should log errors when operation fails', async () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Operation failed');
      const asyncFn = jest.fn(async () => {
        throw error;
      });
      
      await expect(
        logger.measure('failingOperation', asyncFn)
      ).rejects.toThrow('Operation failed');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Marina Error] failingOperation failed after'),
        error,
        ''
      );
    });

    it('should measure actual execution time', async () => {
      process.env.NODE_ENV = 'development';
      const delay = 100;
      const asyncFn = async () => {
        await new Promise(resolve => setTimeout(resolve, delay));
        return 'done';
      };
      
      await logger.measure('delayedOperation', asyncFn);
      
      // Check that performance was logged with approximately correct duration
      const performanceCall = consoleDebugSpy.mock.calls.find(call =>
        call[0].includes('delayedOperation')
      );
      expect(performanceCall).toBeDefined();
      
      // Extract duration from log message (e.g., "...delayedOperation: 102ms")
      const logMessage = performanceCall![0] as string;
      const durationMatch = logMessage.match(/(\d+)ms/);
      expect(durationMatch).toBeTruthy();
      
      const loggedDuration = parseInt(durationMatch![1], 10);
      expect(loggedDuration).toBeGreaterThanOrEqual(delay);
      expect(loggedDuration).toBeLessThan(delay + 50); // Allow 50ms tolerance
    });
  });
});
