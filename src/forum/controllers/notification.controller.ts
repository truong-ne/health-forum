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

  @Patch(':id/markseen')
  async markSeen(@Param('id') id: string) {
    return await this.notificationsService.markSeen(id, { seen: true });
  }
}