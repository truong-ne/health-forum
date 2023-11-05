import { Body, Controller, Get, Injectable, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NotificationType } from '../schemas/notification.schema';
import { Model } from 'mongoose';
import { getAdvanceResults } from '../../config/base.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import NotificationService from '../services/notification.service';

@Controller('api/notifications')
@Injectable()
export default class NotificationsController {
  constructor(
    private notificationsService: NotificationService,
  ) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xem các thông báo của người dùng', description: 'Xem các thông báo của người dùng' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thông báo' })
  @Get()
  async getUserNotifications(
    @Req() req: any,
    @Query('limit') limitQ: number,
    @Query('page') page: number,
  ) {
    return await this.getUserNotifications(limitQ, page, req.user.id)
  }

  @Patch(':id/markseen')
  async markSeen(@Param('id') id: string) {
    return await this.notificationsService.markSeen(id, { seen: true });
  }
}