import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Gender, Relationship } from "../../config/enum.constants";

export class CommentUpdateDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'ID comment' })
    commentId: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'noi dung' })
    text: string
}