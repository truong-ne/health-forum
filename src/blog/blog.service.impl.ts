import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PopulateOptions, QueryOptions, UpdateQuery } from 'mongoose';
import { BaseService, getAdvanceResults } from '../config/base.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Blog, BlogType } from './blog.schema';
import { BlogDto, BlogIds } from './blog.dto';
import { BlogsService } from './blog.service';

export class BlogsServiceImpl extends BaseService implements BlogsService {
  constructor(@InjectModel('Blog') private blogModel: Model<BlogType>,
  public readonly amqpConnection: AmqpConnection
  ) {
    super()
    this.getAllBlog()
  }

  async create(blog: Blog): Promise<any> {
    return this.blogModel.create(blog);
  }

  async delete(id: string): Promise<any> {
    return this.blogModel.findByIdAndDelete(id);
  }

  async findById(id: string, options?: QueryOptions): Promise<any> {
    const blog = await this.blogModel.findById(id, undefined, options);
    if (!blog) throw new NotFoundException('blog_not_found');

    return {
      "code": 200,
      "message": "success",
      "data": blog
    }
  }

  async getAllBlogs(page: number, limit: number): Promise<any> {
    const blogs = await getAdvanceResults(
        this.blogModel,
        {},
        page,
        limit,
        undefined,
        undefined,
        { 'updatedAt': -1 },
    );
    return {
      "code": 200,
      "message": "success",
      "data": blogs.data
    }
  }

  async getAllBlogsByIds(ids: BlogIds): Promise<any> {
    const blogs = await this.blogModel.find({ "_id": { $in: ids.ids }}).sort({ 'updatedAt': -1 })
    
    return {
      "code": 200,
      "message": "success",
      "data": blogs
    }
  }

  async addOrUpdateBlog(dto: BlogDto): Promise<any> {
    if(dto.id === "" || !dto.id) {
        const blog = { title: dto.title, tag:dto.tag, content: dto.content, photo: dto.photo, createdAt: this.VNTime(), updatedAt: this.VNTime()};
    
        try {
            await this.create(blog)
        } catch (error) {
            return {
                "code": 400,
                "message": "created_post_failed"
            }
        }
    
        return {
            "code": 200,
            "message": "success"
        }
    } else {
        var update: UpdateQuery<BlogType> 
        if(dto.photo === "")
            update ={
                $set: { title: dto.title,
                        tag: dto.tag,
                        content: dto.content,
                        updatedAt: this.VNTime() 
                    },
            };
        else
            update = {
                $set: { title: dto.title,
                        tag: dto.tag,
                        content: dto.content,
                        photo: dto.photo,
                        updatedAt: this.VNTime() 
                    },
            };
            
        const blog = await this.blogModel.findOneAndUpdate({ _id: dto.id }, update);
        if (!blog) return {
            "code": 400,
            "message": "blog_not_found"
        }

        await this.getAllBlog()
        return {
            "code": 200,
            "message": "success"
        }
    }
  }

  async deleteBlog(id: string): Promise<any> {
    const blog = await this.blogModel.findById(id);
    if (!blog) throw new NotFoundException('blog_not_found');

    // const rabbit = await this.amqpConnection.request<any>({
    //     exchange: 'healthline.upload.folder',
    //     routingKey: 'delete_file',
    //     payload: [blog.photo],
    //     timeout: 20000,
    // })

    // if(rabbit.code !== 200)
    //     return rabbit

    try {
      await this.delete(id)
    } catch (error) {
      throw new BadRequestException("delete_blog_failed")
    }

    await this.deleteIndexMeilisearch('blog', id)
    return {
      "code": 200,
      "message": "success"
    }
  }

    @Cron(CronExpression.EVERY_10_MINUTES)
    async getAllBlog() {
        const blogs = await this.blogModel.find()

        await this.updateMeilisearch('blog',blogs)
    }
}