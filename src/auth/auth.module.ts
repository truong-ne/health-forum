import { Module } from '@nestjs/common';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AdminStrategy } from './strategies/admin.strategy';
import { JwtWsStrategy } from './strategies/jwt.ws.strategy';
import { DoctorStrategy } from './strategies/doctor.strategy';
import { DoctorWsStrategy } from './strategies/doctor.ws.strategy';

@Module({
    providers: [
        JwtStrategy,
        JwtWsStrategy,
        DoctorWsStrategy,
        DoctorStrategy,
        AdminStrategy,
    ]
})
export class AuthModule { }