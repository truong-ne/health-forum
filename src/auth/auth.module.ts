import { Module } from '@nestjs/common';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AdminStrategy } from './strategies/admin.strategy';

@Module({
    providers: [
        JwtStrategy,
        AdminStrategy
    ]
})
export class AuthModule { }