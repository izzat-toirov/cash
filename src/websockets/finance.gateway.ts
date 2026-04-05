import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class FinanceGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('FinanceGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribeToFinance')
  async handleSubscribe(client: Socket, payload: { month?: number; year?: number }) {
    const now = new Date();
    const month = payload.month ?? now.getMonth() + 1;
    const year = payload.year ?? now.getFullYear();

    // Dastlabki ma'lumotlarni yuborish (endpoint orqali olish)
    try {
      const financeResponse = await fetch(`http://localhost:3001/api/finance/month?year=${year}&month=${month}`, {
        headers: { 'x-api-key': 'kalit' }
      });
      const budgetResponse = await fetch(`http://localhost:3001/api/budget/summary?year=${year}&month=${month}`, {
        headers: { 'x-api-key': 'kalit' }
      });

      const records = await financeResponse.json();
      const summary = await budgetResponse.json();

      client.emit('financeData', {
        type: 'initial',
        data: {
          records,
          summary: summary.data,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      this.logger.error('Error fetching initial data:', error);
      client.emit('error', { message: 'Failed to load initial data' });
    }

    // Real-time yangilanishlar uchun client'ni qo'shish
    client.join(`finance_${year}_${month}`);
    this.logger.log(`Client ${client.id} subscribed to finance_${year}_${month}`);
  }

  @SubscribeMessage('unsubscribeFromFinance')
  handleUnsubscribe(client: Socket) {
    const rooms = Array.from(client.rooms);
    rooms.forEach(room => {
      if (room !== client.id) {
        client.leave(room);
      }
    });
    this.logger.log(`Client ${client.id} unsubscribed from all rooms`);
  }

  async broadcastFinanceUpdate(
    month: number,
    year: number,
    type: 'record' | 'summary' | 'newRecord' | 'updatedRecord' | 'deletedRecord',
    data: any,
  ) {
    this.server.to(`finance_${year}_${month}`).emit('financeData', {
      type,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  async broadcastNewRecord(record: any, month: number, year: number) {
    await this.broadcastFinanceUpdate(month, year, 'newRecord', record);
  }

  async broadcastUpdatedRecord(record: any, month: number, year: number) {
    await this.broadcastFinanceUpdate(month, year, 'updatedRecord', record);
  }

  async broadcastDeletedRecord(recordId: string, month: number, year: number) {
    await this.broadcastFinanceUpdate(month, year, 'deletedRecord', { id: recordId });
  }

  async broadcastBudgetUpdate(month: number, year: number, summary: any) {
    await this.broadcastFinanceUpdate(month, year, 'summary', summary);
  }
}
