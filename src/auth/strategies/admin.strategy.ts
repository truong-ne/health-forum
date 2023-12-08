import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt"

export class AdminStrategy extends PassportStrategy(Strategy, 'admin') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.ADMIN_SECRET,
        })
    }

    async validate(payload: any) {
        return {
            id: payload.id,
            username: payload.username
        }
    }
}