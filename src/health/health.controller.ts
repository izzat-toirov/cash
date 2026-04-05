import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health — Salomatlik tekshiruvi')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'API salomatligini tekshirish',
    description:
      "Ilova ishlayotganini tekshirish uchun oddiy endpoint. Agar bu ishlasa, API sog'liqida.",
  })
  @ApiResponse({
    status: 200,
    description: "API sog'liqida ishlamoqda",
    schema: {
      example: {
        status: 'ok',
        timestamp: '2026-04-02T12:00:00.000Z',
        uptime: 3600,
        message: 'Personal Finance Tracking API is running',
      },
    },
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      message: 'Personal Finance Tracking API is running',
    };
  }
}
