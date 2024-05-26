import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Inject,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import RoomService from '../services/room.service';

@Controller('chat')
export default class ChatController {
    constructor(
        private chatService: RoomService,
    ) {}

    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xem các phòng chat của bệnh nhân' })
    @Patch(':medicalId')
    async getMedicalRoom(@Req() req, @Param('medicalId') medicalId: string) {
        return await this.chatService.getMedicalRoom(req.user.id, medicalId);
    }
}
