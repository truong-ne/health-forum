import * as yup from 'yup';

export enum NotificationTypeEnum {
  postLike = 'postLike',
  postCreate = 'postCreate',
  postCommentAdded = 'postCommentAdded',
  postCommentLiked = 'postCommentLiked',
  consultationRequest = 'consultationRequest',
  consultationConfirmed = 'consultationConfirmed',
  consultationDenied = 'consultationDenied',
  consultationCanceled = 'consultationCanceled',
}
export const NotificationsTypeList = [
  'postLike',
  'postCreate',
  'postCommentAdded',
  'postCommentLiked',
  'consultationRequest',
  'consultationConfirmed',
  'consultationDenied',
  'consultationCanceled',
];

export const NotificationContentSchemas = {
  postContent: yup.object().shape({
    postId: yup.string().required().strict(true),
  }),
  consultationContent: yup.object().shape({
    consultationId: yup.string().required().strict(true),
  }),
};

export interface BaseNotificationType {
  from: string;
  to: string;
  type: NotificationTypeEnum;
}

export interface NotificationTypeLikePost extends BaseNotificationType {
  content: {
    postId: string;
  };
}

export interface NotificationTypeConsultation extends BaseNotificationType {
  content: {
    consultationId: string;
  };
}