import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class CreateRoomDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'ID doctor' })
    doctorId: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'ID user' })
    userId: string
}