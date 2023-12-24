import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt"
import { Request } from "express";

export class JwtWsStrategy extends PassportStrategy(Strategy, 'doctor-ws') {
    constructor() {
        super({
          jwtFromRequest: ExtractJwt.fromExtractors([
            (client: any) => {
              const bearerToken = client?.handshake?.headers?.authorization;
              return bearerToken ? bearerToken.split(' ')[1] : null;
            },
          ]),
          ignoreExpiration: false,
          secretOrKey: process.env.DOCTOR_SECRET,
        });
      }

    async validate(payload: any) {
        const user = {
            id: payload.id,
            phone: payload.phone
        }
        return user
    }
}