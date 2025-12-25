import {NotificationTypeEnum} from "./notification-type.enum"

export interface Notification {
  id: number,
  userId: number,
  type: NotificationTypeEnum,
  refId: number | null,
  message: string,
  createdAt: Date
}
