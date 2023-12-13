import { Module } from '@nestjs/common';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AdminStrategy } from './strategies/admin.strategy';
import { JwtWsStrategy } from './strategies/jwt.ws.strategy';

@Module({
    providers: [
        JwtStrategy,
        JwtWsStrategy,
        AdminStrategy
    ]
})
export class AuthModule { }