import type { NotificationItem } from '@/types/notification'

export const mockNotifications: NotificationItem[] = Array.from({ length: 50 }, (_, index) => ({
  id: index + 1,
  title: `Notificación ${index + 1}`,
  description: `Este es el contenido de la notificación ${index + 1}.`,
  status: index % 3 === 0 ? 'no leida' : index % 3 === 1 ? 'leida' : 'archivada'
}))
