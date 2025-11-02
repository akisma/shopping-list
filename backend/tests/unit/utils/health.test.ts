/**
 * Health check utility test - TDD RED phase
 */

import { getHealthStatus } from '../../../src/utils/health';

describe('getHealthStatus', () => {
  it('should return health status object', () => {
    const health = getHealthStatus();
    
    expect(health).toHaveProperty('status', 'ok');
    expect(health).toHaveProperty('timestamp');
    expect(health).toHaveProperty('version');
    
    // Timestamp should be ISO string
    expect(() => new Date(health.timestamp)).not.toThrow();
    expect(health.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    
    // Version should be a string
    expect(typeof health.version).toBe('string');
    expect(health.version.length).toBeGreaterThan(0);
  });
});
