import { Body, Controller, Delete, Get, Inject, Injectable, Param, Post, Req, UseGuards } from "@nestjs/common"
import { RabbitRPC } from "@golevelup/nestjs-rabbitmq"
import { PostsService } from "../services/post.service"
import { PostDto } from "../dtos/post.dto"


@Injectable()
export class PostConsumer {
    constructor(
        private readonly postService: PostsService,
    ) { }

    @RabbitRPC({
        exchange: 'healthline.upload.folder',
        routingKey: 'upload_post', 
        queue: 'upload_post',
    })
    async addOrUpdateBlog(dto: PostDto): Promise<any> {
        return await this.postService.addOrUpdatePost(dto)
    }
}