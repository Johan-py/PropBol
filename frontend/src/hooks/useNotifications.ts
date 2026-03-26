'use client'

import { useState } from 'react'
import { mockNotifications } from '@/data/mockNotifications'

export function useNotifications() {
  const [open, setOpen] = useState(false)

  const notifications = mockNotifications

  const openNotifications = () => {
    setOpen(true)
  }

  return {
    open,
    notifications,
    openNotifications
  }
}
