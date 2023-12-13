import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Injectable,
    Param,
    Patch,
    Post,
    Put,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PostsService } from '../services/post.service'; 
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PostAddDto } from '../dtos/postAdd.dto';
import { PostUpdateDto } from '../dtos/postUpdate.dto';
  @Controller('posts')
  @Injectable()
  export default class PostsController {
    constructor(
      private postsService: PostsService,
    ) {}
  
    @ApiOperation({ summary: 'Xem bài viết của người dùng', description: 'Xem bài viết của người dùng' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @Get()
    async getAll(@Query('user') userId: string) {
      return this.postsService.getAllPostsOfSingleUser(userId);
    }
  
    @ApiOperation({ summary: 'Xem bài viết của người dùng', description: 'Xem bài viết của người dùng' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy bài đăng' })
    @Get(':id')
    async getSingle(@Param('id') id: string) {
      return await this.postsService.findById(id);
    }
  
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xóa bài viết của người dùng', description: 'Xóa bài viết của người dùng' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 400, description: 'Xóa bài đăng thất bại' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy bài đăng' })
    @Delete(':id')
    async delete(@Param('id') id: string, @Req() req) {
      return await this.postsService.deletePost(id, req.user.id)
    }
  
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Thích bài viết của người dùng', description: 'Thích bài viết của người dùng' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy bài đăng' })
    @Patch(':id/like')
    async likePost(@Param('id') id: string, @Req() req) {
      return await this.postsService.likePost(id, req.user.id)
    }
  
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Bỏ thích bài viết của người dùng', description: 'Bỏ thích bài viết của người dùng' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy bài đăng' })
    @Patch(':id/unlike')
    async unlikePost(@Param('id') id: string, @Req() req) {
      return await this.postsService.unlikePost(id, req.user.id)
    }
  }