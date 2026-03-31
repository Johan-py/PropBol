export type NotificationStatus = 'leida' | 'no leida'

export type NotificationFilter = 'todas' | 'leida' | 'no leida' | 'archivada'

export type NotificationItem = {
  id: number
  title: string
  description: string
  status: NotificationStatus
  archived: boolean
}

export type NotificationsResponse = {
  items: NotificationItem[]
  total: number
  limit: number
  offset: number
  message?: string
}

export type UnreadCountResponse = {
  unreadCount: number
}
