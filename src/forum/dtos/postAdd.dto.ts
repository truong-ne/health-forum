import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Gender, Relationship } from "../../config/enum.constants";

export class PostAddDto {
    @IsString()
    @ApiProperty({ example: 'mô tả bài đăng' })
    description: string

    @IsString()
    @ApiProperty({ example: 'default' })
    photo: string
}