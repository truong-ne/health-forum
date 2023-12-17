import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsString, Length, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class BlogDto {
    @IsString()
    id: string

    @IsString()
    @ApiProperty({ example: 'Tiêu đề blog' })
    title: string

    @IsArray()
    @ApiProperty({ example: '[]' })
    tag: string[]

    @IsString()
    @ApiProperty({ example: 'Nội dung blog' })
    content: string

    photo: string
}

export class BlogIds {
    @IsArray()
    @IsNotEmpty()
    @ApiProperty({ example: '[]' })
    ids: string[]
}