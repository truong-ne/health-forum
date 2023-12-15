import { Injectable } from '@nestjs/common';
import { BaseService } from '../config/base.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp, OtpType } from './otp.schema';
import * as crypto from 'crypto'

@Injectable()
export class OtpService extends BaseService {
    constructor(@InjectModel('Otp') private otpModel: Model<OtpType>,
    ) {
        super()
    }

    async create(otp: Otp) {
        return await this.otpModel.create(otp);
    }

    async forgetPassword(userId: string): Promise<any> {
        const code = (Math.floor(Math.random() * 900000) + 100000).toString()

        const data = { userId: userId, code: code, timestamp: Date.now()};
        const otp = await this.create(data)

        return otp.code
    }

    async checkOtp(userId: string, code: string): Promise<any> {
        const otp = await this.otpModel.findOne({ code: code, userId: userId })
        if(!otp) return false

        const OTP_EXPIRY_TIME = 10 * 60 * 1000;
        const currentTime = Date.now();
        if(currentTime - otp.timestamp <= OTP_EXPIRY_TIME) {
            const otps = this.otpModel.find({ userId: userId })
            await this.otpModel.deleteMany(otps)

            return true
        } else return false
    }
}
