import { WebSocketGateway, SubscribeMessage, WebSocketServer, MessageBody, WsException, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Req, UseGuards } from '@nestjs/common';
import RoomService from '../services/room.service';
import * as jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import { DoctorGuard } from 'src/auth/guards/doctor.guard';
import { JwtWsGuard } from 'src/auth/guards/jwt.ws.guard';
import { AddMessageDto } from '../dtos/addMessage.dto';
dotenv.config()

@WebSocketGateway({
    cors: {
      origin: '*',
    },
    namespace: "chat"
})
export class ChatGateway {
  private isFirstConnectionMap = new Map<Socket, boolean>()
  constructor(private readonly roomService: RoomService) { }

  @WebSocketServer()
  server: Server
  private logger: Logger = new Logger()

  // Decode JWT token
  private decodeToken(token: string) {
    try {
      const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.DOCTOR_SECRET);
        return decoded;
      } catch (error) {
        this.server.disconnectSockets();
      }
    }
  }

  // client connected
  handleConnection(client: Socket) {
    const token = client.handshake.headers.authorization
    const decodedToken = this.decodeToken(token) as any
    if (!decodedToken) {
      // Handle the case where token is invalid or missing
      return
    }

    const { id } = decodedToken; // Assume `sid` is the property in your payload
    // client.join(id)
    // // this.payload = decodedToken
    this.logger.verbose(`Client connected: ${id}`)
    this.isFirstConnectionMap.set(client, true)
    // this.sendDataToClient(client, id, this.today())
  }

  // client disconnected
  handleDisconnect(client: Socket) {
    this.logger.verbose(`Client disconnected: ${client.id}`)
    this.isFirstConnectionMap.delete(client)
  }

  async updateMessage(roomId: string) {
    const data = await this.roomService.getMessage(roomId)
    if (!data) return {
      code: 404,
      message: 'message_not_found'
    }

    this.server.emit(`messages.${roomId}` , data)
  }

  @UseGuards(JwtWsGuard)
  @SubscribeMessage('allMessage')
  async getMessage(@ConnectedSocket() client: Socket, @MessageBody() roomId: string, @Req() req) {
    const room = await this.roomService.checkExistingConversation(roomId, req.user.id)

    await this.updateMessage(roomId)
  }

  @UseGuards(JwtWsGuard)
  @SubscribeMessage('addMessage')
  async addMessage(@MessageBody() payload: AddMessageDto, @Req() req) {
    await this.roomService.addMessage(payload, req.user.id)
    
    await this.updateMessage(payload.room_id)
  }
}
