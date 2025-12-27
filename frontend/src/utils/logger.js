// Simple logger utility for frontend
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

class Logger {
  constructor() {
    // Enable logging in development, can be controlled via env
    this.enabled = process.env.NODE_ENV === 'development' || 
                   localStorage.getItem('debug') === 'true';
    this.level = LOG_LEVELS.DEBUG;
  }

  shouldLog(level) {
    return this.enabled && level <= this.level;
  }

  formatMessage(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      ...data,
    };
  }

  log(level, message, data = {}) {
    if (!this.shouldLog(level)) return;

    const formatted = this.formatMessage(level, message, data);
    const logMessage = `[${formatted.timestamp}] [${level}] ${message}`;

    switch (level) {
      case 'ERROR':
        console.error(logMessage, data);
        break;
      case 'WARN':
        console.warn(logMessage, data);
        break;
      case 'INFO':
        console.info(logMessage, data);
        break;
      case 'DEBUG':
        console.log(logMessage, data);
        break;
      default:
        console.log(logMessage, data);
    }
  }

  error(message, data = {}) {
    this.log('ERROR', message, data);
  }

  warn(message, data = {}) {
    this.log('WARN', message, data);
  }

  info(message, data = {}) {
    this.log('INFO', message, data);
  }

  debug(message, data = {}) {
    this.log('DEBUG', message, data);
  }

  // API specific logging methods
  apiRequest(method, url, data = null, headers = {}) {
    this.debug('API Request', {
      method,
      url,
      data: data ? (typeof data === 'object' ? JSON.stringify(data) : data) : null,
      headers: this.sanitizeHeaders(headers),
      timestamp: new Date().toISOString(),
    });
  }

  apiResponse(method, url, status, data = null, duration = null) {
    const level = status >= 400 ? 'WARN' : 'INFO';
    this.log(level, 'API Response', {
      method,
      url,
      status,
      statusText: this.getStatusText(status),
      data: data ? (typeof data === 'object' ? JSON.stringify(data) : data) : null,
      duration: duration ? `${duration}ms` : null,
      timestamp: new Date().toISOString(),
    });
  }

  apiError(method, url, error, duration = null) {
    const errorData = {
      method,
      url,
      message: error.message || 'Unknown error',
      status: error.response?.status || null,
      statusText: error.response?.statusText || null,
      data: error.response?.data || null,
      config: {
        baseURL: error.config?.baseURL,
        timeout: error.config?.timeout,
        headers: this.sanitizeHeaders(error.config?.headers),
      },
      isNetworkError: !error.response,
      isTimeout: error.code === 'ECONNABORTED',
      duration: duration ? `${duration}ms` : null,
      timestamp: new Date().toISOString(),
    };

    // Log full error details
    this.error('API Error', errorData);

    // Also log to console for easier debugging
    console.group(`❌ API Error: ${method} ${url}`);
    console.error('Error Details:', errorData);
    if (error.response) {
      console.error('Response Data:', error.response.data);
      console.error('Response Headers:', error.response.headers);
    }
    if (error.request) {
      console.error('Request:', error.request);
    }
    console.error('Full Error:', error);
    console.groupEnd();
  }

  sanitizeHeaders(headers) {
    if (!headers) return {};
    const sanitized = { ...headers };
    // Remove sensitive data
    if (sanitized.Authorization) {
      sanitized.Authorization = 'Bearer ***';
    }
    return sanitized;
  }

  getStatusText(status) {
    const statusTexts = {
      200: 'OK',
      201: 'Created',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      500: 'Internal Server Error',
    };
    return statusTexts[status] || 'Unknown';
  }
}

// Export singleton instance
export const logger = new Logger();

// Enable/disable logging
export const enableLogging = () => {
  localStorage.setItem('debug', 'true');
  logger.enabled = true;
};

export const disableLogging = () => {
  localStorage.removeItem('debug');
  logger.enabled = false;
};

export default logger;

