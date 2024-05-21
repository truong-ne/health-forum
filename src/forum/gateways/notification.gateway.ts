import { Injectable, Req, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtWsGuard } from '../../auth/guards/jwt.ws.guard';
import NotificationService from '../services/notification.service';
import { NotificationConsultationDto, NotificationPostDto } from '../dtos/notification.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: "notifications"
})
@Injectable()
export class NotificationsGateway {
    constructor(
        private notificationsService: NotificationService,
    ) {}

    @WebSocketServer()
    server: Server;

    @UseGuards(JwtWsGuard)
    @SubscribeMessage('findAll')
    async findAllNotification(@Req() req) {
        const data = await this.notificationsService.getUserNotifications(req.user.id)
        this.server.emit(`findAll.${req.user.id}`, data)
    }

    @UseGuards(JwtWsGuard)
    @SubscribeMessage('createPostNotification')
    async createPostNotification(
        @MessageBody() data: any,
        @Req() req
    ) {
        const dto: NotificationPostDto = JSON.parse(data)
        const notification = await this.notificationsService.sendPostNotificationToUser(req.user.id, dto.to, dto.postId, dto.type) 
        this.server.emit(`notification.${req.user.id}` , notification)
        return notification
    }

    @UseGuards(JwtWsGuard)
    @SubscribeMessage('createConsulationNotification')
    async createConsulationNotification(
        @MessageBody() data: any,
        @Req() req
    ) {
        const dto: NotificationConsultationDto = JSON.parse(data)
        const notification = await this.notificationsService.sendConsultationNotificationToUser(req.user.id, dto.to, dto.consultationId, dto.type) 
        this.server.emit(`notification.${req.user.id}` , notification)
        return notification
    }
}