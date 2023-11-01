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

    // @Patch(':commentId')
    // async editComment(@Param('commentId') commentId: string, @Body() body: any) {
    //     return await this.commentsService.findByIdAndUpdate(commentId, body);
    // }

    // @Patch(':commentId/like')
    // async likeComment(@Param('commentId') commentId: string, @Req() req: any) {
    //     const userId = req.user.id;
    //     const comment = await this.commentsService.findById(commentId);
    //     if (comment.likes.includes(userId))
    //     throw new HttpException('Comment is already liked', HttpStatus.BAD_REQUEST);

    //     await comment.updateOne({ $push: { likes: userId } });

    //     const isCommentAuthor = userId === String(comment.user);

    //     if (!isCommentAuthor) {
    //     this.notificationsService.sendPostNotificationToUser(
    //         userId,
    //         comment.user,
    //         String(comment.postId),
    //         NotificationTypeEnum.postCommentLiked,
    //     );
    //     }

    //     return 'Comment liked successfuly';
    // }

    // @Patch(':commentId/unlike')
    // async unlikeComment(@Param('commentId') commentId: string, @Req() req: any) {
    //     const userId = req.user.id;
    //     const comment = await this.commentsService.findById(commentId);
    //     if (!comment.likes.includes(userId))
    //     throw new HttpException('Comment is not liked', HttpStatus.BAD_REQUEST);

    //     await comment.updateOne({ $pull: { likes: userId } });
    //     return 'Comment unliked successfuly';
    // }

    // @Delete(':commentId')
    // async deleteComment(@Param('commentId') commentId: string) {
    //     await this.commentsService.findByIdAndDelete(commentId);
    //     return 'Comment deleted successfully';
    // }
}