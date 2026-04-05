import { Injectable, CanActivate, ExecutionContext, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

@Injectable()
export class ApiKeyGuard implements CanActivate, OnApplicationShutdown {
  private rateLimitStore: RateLimitStore = {};
  private readonly MAX_REQUESTS_PER_MINUTE = 100;
  private readonly MINUTE_IN_MS = 60000;
  private cleanupInterval: NodeJS.Timeout;

  constructor(private configService: ConfigService) {
    // Add periodic cleanup for rate limit store
    this.cleanupInterval = setInterval(() => this.cleanupExpiredEntries(), this.MINUTE_IN_MS);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const headerApiKey = request.headers['x-api-key'];
    const apiKey = Array.isArray(headerApiKey) ? headerApiKey[0] : headerApiKey;
    const ip = request.ip || request.socket?.remoteAddress || 'unknown';

    if (typeof apiKey !== 'string') {
      return false;
    }

    // Rate limiting check
    if (!this.checkRateLimit(ip)) {
      return false;
    }

    if (!apiKey) {
      return false;
    }

    const validApiKey = this.configService.get('API_KEY');

    return apiKey === validApiKey;
  }

  private checkRateLimit(clientIp: string): boolean {
    const now = Date.now();
    const clientData = this.rateLimitStore[clientIp];

    if (!clientData || now > clientData.resetTime) {
      // Reset or initialize counter
      this.rateLimitStore[clientIp] = {
        count: 1,
        resetTime: now + this.MINUTE_IN_MS,
      };
      return true;
    }

    if (clientData.count >= this.MAX_REQUESTS_PER_MINUTE) {
      return false;
    }

    clientData.count++;
    return true;
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, data] of Object.entries(this.rateLimitStore)) {
      if (now > data.resetTime) {
        delete this.rateLimitStore[key];
      }
    }
  }

  onApplicationShutdown(signal?: string): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}
