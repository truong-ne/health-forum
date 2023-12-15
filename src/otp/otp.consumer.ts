import { Body, Controller, Delete, Get, Inject, Injectable, Param, Post, Req, UseGuards } from "@nestjs/common"
import { RabbitRPC } from "@golevelup/nestjs-rabbitmq"
import { OtpService } from "./otp.service"


@Injectable()
export class OtpConsumer {
    constructor(
        private readonly otpService: OtpService,
    ) { }

    @RabbitRPC({
        exchange: 'healthline.user.information',
        routingKey: 'create_otp', 
        queue: 'create_otp',
    })
    async forgetPassword(userId: string): Promise<any> {
        return await this.otpService.forgetPassword(userId)
    }
}