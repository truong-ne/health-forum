import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtWsGuard extends AuthGuard('jwt-ws') { }