import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PostDto {
    @IsString()
    @ApiProperty({ example: 'mô tả bài đăng' })
    id: string

    @IsString()
    @ApiProperty({ example: 'mô tả bài đăng' })
    description: string

    @IsArray()
    @ApiProperty({ example: 'default' })
    photo: string[]

    @IsString()
    @ApiProperty({ example: 'user id' })
    userId: string
}

export class PostIds {
    @IsArray()
    @IsNotEmpty()
    @ApiProperty({ example: '[]' })
    ids: string[]
}