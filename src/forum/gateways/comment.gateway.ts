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
import { Notification } from '../schemas/notification.schema';
import { NotificationTypeEnum } from '../schemas/notificationTypes';
import CommentsService from '../services/comment.service';
import { CommentAddDto } from '../dtos/commentAdd.dto';
import { JwtWsGuard } from '../../auth/guards/jwt.ws.guard';
import { CommentUpdateDto } from '../dtos/commentUpdate.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: "comments"
})
@Injectable()
export class CommentsGateway {
    constructor(
        private commentsService: CommentsService,
    ) {}

    @WebSocketServer()
    server: Server;

    @SubscribeMessage('findAll')
    async findAllComment(@MessageBody() postId: string) {
        const data = await this.commentsService.getPostComments(postId)
        this.server.emit('findAll', data)
        return data
    }

    @UseGuards(JwtWsGuard)
    @SubscribeMessage('create')
    async createComment(
        @MessageBody() data: any,
        @Req() req
    ) {
        const dto: CommentAddDto = JSON.parse(data)
        const comment = await this.commentsService.addComment(dto, req.user.id) 
        this.server.emit('comment' , comment)
        return comment
    }
}