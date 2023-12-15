import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OtpSchema } from './otp.schema';
import { OtpService } from './otp.service';
import { OtpConsumer } from './otp.consumer';

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
        exchanges: [
            {
                name: 'healthline.user.information',
                type: 'direct'
            }
        ],
        uri: process.env.RABBITMQ_URL,
        connectionInitOptions: { wait: true, reject: true, timeout: 10000 },
    }),
    MongooseModule.forFeature([{ name: 'Otp', schema: OtpSchema }]),
  ],
  controllers: [],
  providers: [OtpService, OtpConsumer],
  exports: [MongooseModule, OtpService],
})
export default class OtpModule {}