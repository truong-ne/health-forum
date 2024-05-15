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
import { JwtGuard } from '../auth/guards/jwt.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PostAddDto } from '../forum/dtos/postAdd.dto';
import { PostUpdateDto } from '../forum/dtos/postUpdate.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { BlogsService } from './blog.service';
import { BlogIds } from './blog.dto';

@Controller('blog')
@Injectable()
export default class BlogsController {
    constructor(
        private blogsService: BlogsService,
    ) {}
    @ApiOperation({ summary: 'Xem blog', description: 'Xem blog' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @Get('/:page/:limit')
    async getAllBlogs(@Param('page') page: number, @Param('limit') limit: number) {
        return this.blogsService.getAllBlogs(page, limit);
    }

    @ApiOperation({ summary: 'Xem blog', description: 'Xem blog' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @Get()
    async getAllBlogsByIds(@Body() ids: BlogIds) {
        return this.blogsService.getAllBlogsByIds(ids);
    }


    @ApiOperation({ summary: 'Xem chi tiết blog', description: 'Xem chi tiết blog' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy blog' })
    @Get(':id')
    async getSingle(@Param('id') id: string) {
        return await this.blogsService.findById(id);
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xóa blog'  })
    @Delete(':id')
    async deleteBlog(@Param('id') id: string): Promise<any> {
        const result = await this.blogsService.deleteBlog(id)
        return result
    }
}