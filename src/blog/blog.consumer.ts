import { Body, Controller, Delete, Get, Inject, Injectable, Param, Post, Req, UseGuards } from "@nestjs/common"
import { RabbitRPC } from "@golevelup/nestjs-rabbitmq"
import { BlogDto } from "./blog.dto"
import { BlogsService } from "./blog.service"

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