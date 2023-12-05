import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class BlogDto {
    @IsString()
    id: string

    @IsString()
    @ApiProperty({ example: 'Tiêu đề blog' })
    title: string

    @IsString()
    @ApiProperty({ example: 'Nội dung blog' })
    content: string

    photo: string
}