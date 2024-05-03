import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { NotificationTypeEnum } from "../schemas/notificationTypes";
export class NotificationPostDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'ID receiver' })
    to: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'ID post' })
    postId: string

    @IsNotEmpty()
    @IsEnum(NotificationTypeEnum)
    @ApiProperty({ example: 'Loại thông báo' })
    type: NotificationTypeEnum
}

export class NotificationConsultationDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'ID receiver' })
    to: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'ID post' })
    consultationId: string

    @IsNotEmpty()
    @IsEnum(NotificationTypeEnum)
    @ApiProperty({ example: 'Loại thông báo' })
    type: NotificationTypeEnum
}