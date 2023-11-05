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
import CommentsService from '../services/comment.service';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { CommentAddDto } from '../dtos/commentAdd.dto';
import { CommentUpdateDto } from '../dtos/commentUpdate.dto';

@Controller('comments')
export default class CommentsController {
    constructor(
        private commentsService: CommentsService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}

    @ApiOperation({ summary: 'Xem các bình luận của bài đăng', description: 'Xem tất cả bình luận của bài đăng' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy bài đăng' })
    @Get('post/:postId')
    async getPostComments(@Param('postId') postId: string) {
        return await this.commentsService.getPostComments(postId) 
    }

    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Bình luận cho bài đăng', description: 'Viết bình luận cho bài đăng' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy bài đăng' })
    @Post()
    async addComment(@Body() dto: CommentAddDto, @Req() req) {
        return await this.commentsService.addComment(dto, req.user.id)
    }

    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Sửa bình luận cho bài đăng', description: 'Sửa bình luận cho bài đăng' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy bình luận' })
    @Patch()
    async editComment(@Req() req, @Body() body: CommentUpdateDto) {
        return await this.commentsService.findByIdAndUpdate(body, req.user.id);
    }

    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Thích bình luận của người dùng', description: 'Thích bình luận của người dùng' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy bình luận' })
    @Patch(':commentId/like')
    async likeComment(@Param('commentId') id: string, @Req() req) {
      return await this.commentsService.likeComment(id, req.user.id)
    }

    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Bỏ thích bình luận của người dùng', description: 'Bỏ thích bình luận của người dùng' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy bình luận' })
    @Patch(':commentId/unlike')
    async unlikeComment(@Param('commentId') id: string, @Req() req) {
      return await this.commentsService.unlikeComment(id, req.user.id)
    }

    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xóa bình luận của người dùng', description: 'Xóa bình luận của người dùng' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 400, description: 'Xóa bình luận thất bại' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy bình luận' })
    @Delete(':commentId')
    async deleteComment(@Param('commentId') commentId: string, @Req() req) {
        return await this.commentsService.findByIdAndDelete(commentId, req.user.id)
    }
}