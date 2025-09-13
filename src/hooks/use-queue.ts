"use client"

import { useState, useEffect, useCallback } from 'react'
import { subscribeToQueueUpdates, subscribeToUserQueueUpdates } from '@/lib/realtime'
import { queueService } from '@/lib/database'
import { joinQueue, getQueuePosition, cancelUserQueueEntry, estimateWaitTime } from '@/lib/queue-management'
import type { QueueEntry, Service } from '@/lib/supabase'

export interface UseQueueOptions {
  serviceId?: string
  userId?: string
  autoRefresh?: boolean
}

export interface QueueState {
  entries: QueueEntry[]
  isLoading: boolean
  error: string | null
}

export interface QueueActions {
  joinQueue: (serviceId: string, userId: string, notes?: string) => Promise<QueueEntry>
  cancelEntry: (entryId: string) => Promise<void>
  refreshQueue: () => Promise<void>
  getPosition: (queueNumber: number) => Promise<{ position: number; estimatedWaitTime: number }>
  getWaitTime: () => Promise<number>
}

export function useQueue(options: UseQueueOptions = {}): QueueState & QueueActions {
  const [entries, setEntries] = useState<QueueEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { serviceId, userId, autoRefresh = true } = options

  // Fetch queue entries
  const refreshQueue = useCallback(async () => {
    if (!serviceId && !userId) return

    setIsLoading(true)
    setError(null)

    try {
      let data: QueueEntry[] = []

      if (serviceId) {
        data = await queueService.getByService(serviceId)
      } else if (userId) {
        data = await queueService.getByUser(userId)
      }

      setEntries(data)
    } catch (err) {
      console.error('Error fetching queue:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch queue')
    } finally {
      setIsLoading(false)
    }
  }, [serviceId, userId])

  // Join queue
  const handleJoinQueue = useCallback(async (targetServiceId: string, targetUserId: string, notes?: string): Promise<QueueEntry> => {
    try {
      const estimatedTime = await estimateWaitTime(targetServiceId)
      const entry = await joinQueue({
        serviceId: targetServiceId,
        userId: targetUserId,
        notes,
        estimatedWaitTime: estimatedTime
      })

      // Refresh queue after joining
      await refreshQueue()
      return entry
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join queue'
      setError(message)
      throw new Error(message)
    }
  }, [refreshQueue])

  // Cancel queue entry
  const cancelEntry = useCallback(async (entryId: string) => {
    if (!userId) {
      throw new Error('User ID is required to cancel entry')
    }

    try {
      await cancelUserQueueEntry(entryId, userId)
      // Refresh queue after cancelling
      await refreshQueue()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel queue entry'
      setError(message)
      throw new Error(message)
    }
  }, [userId, refreshQueue])

  // Get queue position
  const getPosition = useCallback(async (queueNumber: number) => {
    if (!serviceId) {
      throw new Error('Service ID is required to get position')
    }

    try {
      return await getQueuePosition(serviceId, queueNumber)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get queue position'
      setError(message)
      throw new Error(message)
    }
  }, [serviceId])

  // Get estimated wait time for joining
  const getWaitTime = useCallback(async () => {
    if (!serviceId) {
      throw new Error('Service ID is required to get wait time')
    }

    try {
      return await estimateWaitTime(serviceId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get wait time'
      setError(message)
      throw new Error(message)
    }
  }, [serviceId])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!autoRefresh) return

    let unsubscribe: (() => void) | null = null

    if (serviceId) {
      unsubscribe = subscribeToQueueUpdates(serviceId, (updatedEntry) => {
        setEntries(prev => {
          const existingIndex = prev.findIndex(entry => entry.id === updatedEntry.id)
          if (existingIndex >= 0) {
            // Update existing entry
            const newEntries = [...prev]
            newEntries[existingIndex] = updatedEntry
            return newEntries
          } else {
            // Add new entry
            return [...prev, updatedEntry]
          }
        })
      })
    } else if (userId) {
      unsubscribe = subscribeToUserQueueUpdates(userId, (updatedEntry) => {
        setEntries(prev => {
          const existingIndex = prev.findIndex(entry => entry.id === updatedEntry.id)
          if (existingIndex >= 0) {
            // Update existing entry
            const newEntries = [...prev]
            newEntries[existingIndex] = updatedEntry
            return newEntries
          } else {
            // Add new entry
            return [...prev, updatedEntry]
          }
        })
      })
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [serviceId, userId, autoRefresh])

  // Initial data fetch
  useEffect(() => {
    refreshQueue()
  }, [refreshQueue])

  return {
    entries,
    isLoading,
    error,
    joinQueue: handleJoinQueue,
    cancelEntry,
    refreshQueue,
    getPosition,
    getWaitTime
  }
}