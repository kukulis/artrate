/**
 * Simple Loki client for sending logs to Grafana Loki
 * Uses native fetch API (Node.js 18+)
 */

export interface LokiLogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp?: number;
  labels?: Record<string, string>;
}

export interface LokiClientConfig {
  url: string;
  defaultLabels?: Record<string, string>;
}

export class LokiClient {
  private url: string;
  private defaultLabels: Record<string, string>;

  constructor(config: LokiClientConfig) {
    this.url = config.url;
    this.defaultLabels = config.defaultLabels || {};
  }

  /**
   * Send a log entry to Loki
   */
  async log(entry: LokiLogEntry): Promise<void> {
    const timestamp = entry.timestamp || Date.now();
    const labels = {
      ...this.defaultLabels,
      level: entry.level,
      ...entry.labels
    };

    const payload = {
      streams: [
        {
          stream: labels,
          values: [
            [
              (timestamp * 1000000).toString(), // Loki expects nanoseconds
              entry.message
            ]
          ]
        }
      ]
    };

    try {
      const response = await fetch(`${this.url}/loki/api/v1/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send log to Loki: ${response.status} ${errorText}`);
      }
    } catch (error) {
      // Don't let logging errors crash the application
      console.error('Error sending log to Loki:', error);
    }
  }

  /**
   * Convenience methods for different log levels
   */
  async debug(message: string, labels?: Record<string, string>): Promise<void> {
    await this.log({ level: 'debug', message, labels });
  }

  async info(message: string, labels?: Record<string, string>): Promise<void> {
    await this.log({ level: 'info', message, labels });
  }

  async warn(message: string, labels?: Record<string, string>): Promise<void> {
    await this.log({ level: 'warn', message, labels });
  }

  async error(message: string, labels?: Record<string, string>): Promise<void> {
    await this.log({ level: 'error', message, labels });
  }

  /**
   * Send multiple log entries in a single request (batch)
   */
  async batch(entries: LokiLogEntry[]): Promise<void> {
    if (entries.length === 0) return;

    const streams: Record<string, any[]> = {};

    for (const entry of entries) {
      const timestamp = entry.timestamp || Date.now();
      const labels = {
        ...this.defaultLabels,
        level: entry.level,
        ...entry.labels
      };
      const labelKey = JSON.stringify(labels);

      if (!streams[labelKey]) {
        streams[labelKey] = [];
      }

      streams[labelKey].push([
        (timestamp * 1000000).toString(),
        entry.message
      ]);
    }

    const payload = {
      streams: Object.entries(streams).map(([labelStr, values]) => ({
        stream: JSON.parse(labelStr),
        values
      }))
    };

    try {
      const response = await fetch(`${this.url}/loki/api/v1/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send batch logs to Loki: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Error sending batch logs to Loki:', error);
    }
  }
}

/**
 * Create a singleton instance for the application
 */
export function createLokiClient(config?: Partial<LokiClientConfig>): LokiClient {
  const url = config?.url || process.env.LOKI_URL || 'http://loki:3100';
  const defaultLabels = {
    app: 'artcorrect-backend',
    environment: process.env.NODE_ENV || 'development',
    ...config?.defaultLabels
  };

  return new LokiClient({ url, defaultLabels });
}
