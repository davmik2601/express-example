import {NotificationTypeEnum} from "../notification-type.enum"

export interface CreateNotificationDto {
  type: NotificationTypeEnum,
  refId?: number,
  message: string
}
