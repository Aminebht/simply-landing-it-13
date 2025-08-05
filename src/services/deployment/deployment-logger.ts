export interface LogContext {
  [key: string]: any;
}

export class DeploymentLogger {
  private logLevel: 'debug' | 'info' | 'warn' | 'error';

  constructor(logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info') {
    this.logLevel = logLevel;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      this.log('🔧', 'DEBUG', message, context);
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      this.log('ℹ️', 'INFO', message, context);
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      this.log('⚠️', 'WARN', message, context);
    }
  }

  error(message: string, context?: LogContext): void {
    if (this.shouldLog('error')) {
      this.log('❌', 'ERROR', message, context);
    }
  }

  // Specialized deployment logging methods
  deploymentStarted(pageId: string): void {
    this.info('🚀 Starting React-based deployment', { pageId });
  }

  deploymentCompleted(pageId: string, result: { url: string; siteId: string }): void {
    this.info('🎉 Deployment completed successfully', { pageId, ...result });
  }

  deploymentFailed(pageId: string, error: any): void {
    this.error('💥 Deployment failed', { 
      pageId, 
      error: error.message || error,
      stack: error.stack 
    });
  }

  siteCreated(siteId: string, siteName?: string): void {
    this.info('🆕 Created new Netlify site', { siteId, siteName });
  }

  siteUpdated(siteId: string): void {
    this.info('🔄 Updated existing Netlify site', { siteId });
  }

  htmlGenerated(componentCount: number, byteSize?: number): void {
    this.debug('📄 HTML generated', { componentCount, byteSize });
  }

  assetsGenerated(cssSize?: number, jsSize?: number): void {
    this.debug('📦 Assets generated', { cssSize, jsSize });
  }

  databaseUpdated(pageId: string, updateData: any): void {
    this.debug('💾 Database updated', { pageId, updateData });
  }

  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  private log(icon: string, level: string, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const logMessage = `${icon} [${timestamp}] ${level}: ${message}`;
    
    if (context && Object.keys(context).length > 0) {
      console.log(logMessage, context);
    } else {
      console.log(logMessage);
    }
  }

  // Performance measurement
  startTimer(label: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      this.debug(`⏱️ ${label} completed`, { duration: `${duration}ms` });
    };
  }

  // Batch operation logging
  logBatch(operations: Array<{ operation: string; context?: LogContext }>): void {
    this.debug('📊 Batch operations', { 
      operations: operations.map(op => op.operation),
      count: operations.length 
    });
    
    operations.forEach(({ operation, context }) => {
      this.debug(`  ↳ ${operation}`, context);
    });
  }
}
