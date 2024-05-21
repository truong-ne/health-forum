import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class AddMessageDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'ID doctor' })
    room_id: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'ID user' })
    text: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'ID user' })
    type: string
}