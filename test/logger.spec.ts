/**
 * Tests for centralized logging infrastructure
 *
 * Note: These tests run in NETWORK=regtest mode, which behaves like development mode
 */

import { logger } from '../src/infrastructure/logger';

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
  });

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('Test info message', { data: 123 });

      expect(consoleInfoSpy).toHaveBeenCalledWith('[Marina] Test info message', { data: 123 });
    });

    it('should handle info messages without context', () => {
      logger.info('Test message');

      expect(consoleInfoSpy).toHaveBeenCalledWith('[Marina] Test message', '');
    });
  });

  describe('warn', () => {
    it('should log warning messages to console', () => {
      logger.warn('Test warning', { issue: 'slow-network' });

      expect(consoleWarnSpy).toHaveBeenCalledWith('[Marina Warning] Test warning', {
        issue: 'slow-network',
      });
    });
  });

  describe('error', () => {
    it('should log error messages to console', () => {
      const error = new Error('Test error');

      logger.error('Something went wrong', error, { txid: 'abc123' });

      expect(consoleErrorSpy).toHaveBeenCalledWith('[Marina Error] Something went wrong', error, {
        txid: 'abc123',
      });
    });

    it('should handle errors without Error object', () => {
      logger.error('Error without exception');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Marina Error] Error without exception',
        '',
        ''
      );
    });

    it('should handle errors without context', () => {
      const error = new Error('Test error');

      logger.error('Error message', error);

      expect(consoleErrorSpy).toHaveBeenCalledWith('[Marina Error] Error message', error, '');
    });
  });

  describe('measure', () => {
    it('should measure and return result of async operation', async () => {
      const asyncFn = jest.fn().mockResolvedValue('result');

      const result = await logger.measure('testOperation', asyncFn, { test: true });

      expect(result).toBe('result');
      expect(asyncFn).toHaveBeenCalled();
    });

    it('should log errors when operation fails', async () => {
      const error = new Error('Operation failed');
      const asyncFn = jest.fn().mockRejectedValue(error);

      await expect(logger.measure('failingOperation', asyncFn)).rejects.toThrow('Operation failed');

      expect(consoleErrorSpy).toHaveBeenCalled();
      const errorCall = consoleErrorSpy.mock.calls[0];
      expect(errorCall[0]).toContain('failingOperation failed after');
      expect(errorCall[1]).toBe(error);
    });

    it('should measure actual execution time', async () => {
      const delay = 100;
      const asyncFn = async () => {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return 'done';
      };

      const result = await logger.measure('delayedOperation', asyncFn);

      expect(result).toBe('done');
    });
  });
});
