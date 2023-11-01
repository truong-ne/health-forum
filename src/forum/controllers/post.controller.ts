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
import { PostsService } from '../services/post.service'; 
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PostAddDto } from '../dtos/postAdd.dto';
  @Controller('posts')
  @Injectable()
  export default class PostsController {
    constructor(
      private postsService: PostsService,
    ) {}
  
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Tạo bài viết mới', description: 'Tạo bài viết mới' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 400, description: 'Sai thông tin đầu vào' })
    @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy bài đăng' })
    @Post()
    async create(@Body() dto: PostAddDto, @Req() req) {
      return await this.postsService.createPost(dto, req.user.id)
    }
  
    // @Get('newsfeed')
    // async getNewsfeedPosts(
    //   @Req() req: any,
    //   @Query('limit') limitQ: number,
    //   @Query('page') page: number,
    // ) {
    //   const limit = limitQ ?? 2;
    //   const userId = req.user.id;
    //   const friends = await this.friendsService.getUserFriends(userId);
  
    //   const query = { $or: [{ user: { $in: friends } }, { user: userId }] };
  
    //   return getAdvanceResults(
    //     this.postsService.getPostModel(),
    //     query,
    //     page,
    //     limit,
    //     postPopulateOptions,
    //     undefined,
    //     {
    //       createdAt: -1,
    //     },
    //   );
    // }
  
    // @Get()
    // async getAll(@Query('user') userId: string) {
    //   return this.postsService.getAllPostsOfSingleUser(userId);
    // }
  
    // @Get(':id')
    // async getSingle(@Param('id') id: string) {
    //   const post = await this.postsService.findById(id, { populate: postPopulateOptions });
    //   if (!post) throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    //   return post;
    // }
  
    // @Put(':id')
    // async updatePost(@Param('id') id: string, @Body() body: any) {
    //   const post = await this.postsService.findByIdAndUpdate(id, body, {
    //     populate: postPopulateOptions,
    //   });
    //   if (!post) throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    //   return post;
    // }
  
    // @Get(':id/photo')
    // @Public()
    // async getPhoto(@Param('id') id: string, @Res() res: Response) {
    //   const post = await this.postsService.findById(id, { projection: 'photo' });
    //   if (!post) throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    //   if (!post.photo) throw new HttpException('No photo found', HttpStatus.NOT_FOUND);
  
    //   const photo = await this.photosService.findById(post.photo);
  
    //   res.set('Content-Type', photo.contentType);
    //   return res.send(photo.data);
    // }
  
    // @Delete(':id')
    // async delete(@Param('id') id: string, @Req() req: any) {
    //   const loggedInUser = req.user;
    //   const post = await this.postsService.findById(id);
    //   if (post.user.toString() !== loggedInUser.id)
    //     throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    //   await post.remove();
    //   return 'Post deleted';
    // }
  
    // @Patch(':id/like')
    // async likePost(@Param('id') postId: string, @Req() req: any) {
    //   const user = req.user;
    //   const post = await this.postsService.findById(postId, { projection: 'likes user' });
    //   if (!post) throw new HttpException('No photo found', HttpStatus.NOT_FOUND);
  
    //   if (post.likes.includes(user.id))
    //     throw new HttpException('Post is liked already', HttpStatus.BAD_REQUEST);
    //   await post.updateOne(
    //     {
    //       $push: { likes: user.id },
    //     },
    //     { runValidators: true },
    //   );
  
    //   const isPostCreator = user.id === String(post.user);
    //   if (!isPostCreator) {
    //     this.notificationService.sendPostNotificationToUser(
    //       user.id,
    //       post.user,
    //       post.id,
    //       NotificationTypeEnum.postLike,
    //     );
    //   }
  
    //   return 'Post liked successfully';
    // }
  
    // @Patch(':id/unlike')
    // async unlikePost(@Param('id') id: string, @Req() req: any) {
    //   const user = req.user;
    //   const post = await this.postsService.findById(id, { projection: 'likes' });
    //   if (!post) throw new HttpException('No photo found', HttpStatus.NOT_FOUND);
  
    //   if (!post.likes.includes(user.id))
    //     throw new HttpException('Post is not liked', HttpStatus.BAD_REQUEST);
  
    //   await post.updateOne(
    //     {
    //       $pull: { likes: user.id },
    //     },
    //     { runValidators: true },
    //   );
    //   return 'Post unliked successfully';
    // }
  }