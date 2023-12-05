import { Body, Controller, Delete, Get, Inject, Injectable, Param, Post, Req, UseGuards } from "@nestjs/common"
import { RabbitRPC } from "@golevelup/nestjs-rabbitmq"
import { BlogsService } from "../services/blog.service"
import { BlogDto } from "../dtos/blog.dto"


@Injectable()
export class BlogConsumer {
    constructor(
        private readonly blogService: BlogsService,
    ) { }

    @RabbitRPC({
        exchange: 'healthline.upload.folder',
        routingKey: 'upload_blog', 
        queue: 'upload_blog',
    })
    async addOrUpdateBlog(dto: BlogDto): Promise<any> {
        return await this.blogService.addOrUpdateBlog(dto)
    }
}