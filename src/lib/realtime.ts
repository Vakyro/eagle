import { supabase } from './supabase'
import type { QueueEntry, Service } from './supabase'

export type QueueUpdateCallback = (queueEntry: QueueEntry) => void
export type ServiceUpdateCallback = (service: Service) => void

// Subscribe to queue updates for a specific service
export function subscribeToQueueUpdates(serviceId: string, callback: QueueUpdateCallback) {
  const subscription = supabase
    .channel(`queue_updates_${serviceId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'queue_entries',
        filter: `service_id=eq.${serviceId}`
      },
      (payload) => {
        console.log('Queue update:', payload)
        if (payload.new) {
          callback(payload.new as QueueEntry)
        }
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

// Subscribe to queue updates for a specific user
export function subscribeToUserQueueUpdates(userId: string, callback: QueueUpdateCallback) {
  const subscription = supabase
    .channel(`user_queue_updates_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'queue_entries',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('User queue update:', payload)
        if (payload.new) {
          callback(payload.new as QueueEntry)
        }
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

// Subscribe to service updates
export function subscribeToServiceUpdates(establishmentId: string, callback: ServiceUpdateCallback) {
  const subscription = supabase
    .channel(`service_updates_${establishmentId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'services',
        filter: `establishment_id=eq.${establishmentId}`
      },
      (payload) => {
        console.log('Service update:', payload)
        if (payload.new) {
          callback(payload.new as Service)
        }
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

// Subscribe to all queue updates (for admin dashboard)
export function subscribeToAllQueueUpdates(callback: QueueUpdateCallback) {
  const subscription = supabase
    .channel('all_queue_updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'queue_entries'
      },
      (payload) => {
        console.log('All queue updates:', payload)
        if (payload.new) {
          callback(payload.new as QueueEntry)
        }
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

// Send queue position update notification
export async function sendQueuePositionUpdate(queueEntryId: string, position: number, estimatedWaitTime: number) {
  try {
    // This could trigger a notification or push message
    console.log(`Queue position update: Entry ${queueEntryId} is now position ${position} with ${estimatedWaitTime} minutes wait time`)

    // In a real implementation, you might use a serverless function or webhook
    // to send push notifications, SMS, or email alerts

  } catch (error) {
    console.error('Error sending queue position update:', error)
  }
}

// Send queue status change notification
export async function sendQueueStatusUpdate(queueEntryId: string, status: string, message: string) {
  try {
    console.log(`Queue status update: Entry ${queueEntryId} status changed to ${status}: ${message}`)

    // In a real implementation, this would send notifications to the user

  } catch (error) {
    console.error('Error sending queue status update:', error)
  }
}