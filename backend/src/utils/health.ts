/**
 * Health check utility - returns API health status
 */

import { version } from '../../package.json';

interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
}

export function getHealthStatus(): HealthStatus {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: version
  };
}
