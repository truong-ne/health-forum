import { Injectable } from '@nestjs/common';
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
import { Notification } from '../schemas/notification.schema';
import { NotificationTypeEnum } from '../schemas/notificationTypes';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    constructor() {}

    @WebSocketServer()
    server: Server;

    afterInit(server: Server) {
        console.log('Init');
    }

    async handleConnection(@ConnectedSocket() client: Socket) {
        console.log('Connected', client.handshake.auth.fullName, client.id);

        const userId = client.handshake.auth._id;
        client.join(userId);
        // Make user active
    }

    async handleDisconnect(client: Socket) {
        console.log('Disconnect', client.handshake.auth.fullName, client.id);

        const userId = client.handshake.auth._id;
        // Make user inactive
    }

    @SubscribeMessage('test')
    test(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
        client.emit('hello', client.id);
    }

    @SubscribeMessage('privateMessage')
    privateMessage(
        @MessageBody() data: { content: any; to: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { content, to } = data;
        client.to(to).emit('privateMessage', content);
    }

    @SubscribeMessage('isTyping')
    isTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { from: string; to: string }) {
        client.to(data.to).emit('isTyping', data.from);
    }
    // Notifications
    @SubscribeMessage('likePost')
    likePost(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { to: string; from: string; postId: string },
    ) {
        const notification: Notification & {
        _id: string;
        createdAt: string;
        updatedAt: string;
        fromSocket: boolean;
        } = {
        _id: Math.random().toString(),
        from: data.from,
        to: data.to,
        type: NotificationTypeEnum.postLike,
        content: {
            postId: data.postId,
        },
        seen: false,
        createdAt: new Date(Date.now()).toISOString(),
        updatedAt: new Date(Date.now()).toISOString(),
        fromSocket: true,
        };
        client.to(data.to).emit('likePost', notification);
    }
}