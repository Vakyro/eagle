import { queueService, serviceService, notificationService, analyticsService } from './database'
import { sendQueuePositionUpdate, sendQueueStatusUpdate } from './realtime'
import { getAIPrediction, combineAIWithTraditional } from './ai-prediction'
import type { QueueEntry, Service } from './supabase'

export interface JoinQueueParams {
  serviceId: string
  userId: string
  estimatedWaitTime?: number
  notes?: string
}

export interface QueuePosition {
  position: number
  estimatedWaitTime: number
  totalInQueue: number
  isNext: boolean
}

export interface QueueStats {
  totalWaiting: number
  totalCalled: number
  totalServed: number
  averageWaitTime: number
  nextQueueNumber?: number
}

// Join a queue
export async function joinQueue(params: JoinQueueParams): Promise<QueueEntry> {
  try {
    // Check if service exists and is open
    const service = await serviceService.getById(params.serviceId)
    if (!service.is_open) {
      throw new Error('Service is currently closed')
    }

    // Check if queue is at capacity
    const currentQueue = await queueService.getByService(params.serviceId, 'waiting')
    if (currentQueue.length >= service.max_capacity) {
      throw new Error('Queue is at maximum capacity')
    }

    // Check if user is already in this queue
    const existingEntry = await queueService.getByService(params.serviceId)
    const userInQueue = existingEntry.find(entry =>
      entry.user_id === params.userId &&
      ['waiting', 'called'].includes(entry.status)
    )

    if (userInQueue) {
      throw new Error('You are already in this queue')
    }

    // Create queue entry
    const queueEntry = await queueService.create({
      service_id: params.serviceId,
      user_id: params.userId,
      status: 'waiting',
      estimated_wait_time: params.estimatedWaitTime,
      notes: params.notes
    })

    // Send notification
    await notificationService.create({
      user_id: params.userId,
      title: 'Joined Queue',
      message: `You have joined the queue at ${service.establishment.business_name}. Your queue number is #${queueEntry.queue_number}.`,
      type: 'queue_update'
    })

    // Update analytics
    await updateDailyAnalytics(params.serviceId, { total_customers: 1 })

    return queueEntry
  } catch (error) {
    console.error('Error joining queue:', error)
    throw error
  }
}

// Get queue position for a user
export async function getQueuePosition(serviceId: string, queueNumber: number): Promise<QueuePosition> {
  try {
    const queueEntries = await queueService.getByService(serviceId)
    const activeEntries = queueEntries.filter(entry =>
      ['waiting', 'called'].includes(entry.status)
    ).sort((a, b) => a.queue_number - b.queue_number)

    const userPosition = activeEntries.findIndex(entry => entry.queue_number === queueNumber)
    const position = userPosition + 1
    const estimatedWaitTime = await queueService.getEstimatedWaitTime(serviceId, position)

    return {
      position,
      estimatedWaitTime,
      totalInQueue: activeEntries.length,
      isNext: position === 1
    }
  } catch (error) {
    console.error('Error getting queue position:', error)
    throw error
  }
}

// Call next customer in queue
export async function callNextCustomer(serviceId: string): Promise<QueueEntry | null> {
  try {
    const queueEntries = await queueService.getByService(serviceId, 'waiting')
    if (queueEntries.length === 0) {
      return null
    }

    // Get the next customer (lowest queue number)
    const nextCustomer = queueEntries.sort((a, b) => a.queue_number - b.queue_number)[0]

    // Update status to called
    const updatedEntry = await queueService.update(nextCustomer.id, {
      status: 'called',
      called_at: new Date().toISOString()
    })

    // Send notification to customer
    await notificationService.create({
      user_id: nextCustomer.user_id,
      queue_entry_id: nextCustomer.id,
      title: 'Your Turn!',
      message: `You are being called for service. Please proceed to the service area.`,
      type: 'called'
    })

    // Send status update
    await sendQueueStatusUpdate(
      nextCustomer.id,
      'called',
      'Your turn has arrived! Please proceed to the service area.'
    )

    return updatedEntry
  } catch (error) {
    console.error('Error calling next customer:', error)
    throw error
  }
}

// Mark customer as served
export async function markCustomerServed(queueEntryId: string, notes?: string): Promise<QueueEntry> {
  try {
    const updatedEntry = await queueService.update(queueEntryId, {
      status: 'served',
      served_at: new Date().toISOString(),
      notes
    })

    // Send notification
    await notificationService.create({
      user_id: updatedEntry.user_id,
      queue_entry_id: queueEntryId,
      title: 'Service Complete',
      message: `Your service has been completed. Thank you for visiting!`,
      type: 'queue_update'
    })

    // Update analytics
    await updateDailyAnalytics(updatedEntry.service_id, { served_customers: 1 })

    // Calculate service time
    if (updatedEntry.called_at && updatedEntry.served_at) {
      const serviceTime = Math.round(
        (new Date(updatedEntry.served_at).getTime() - new Date(updatedEntry.called_at).getTime()) / 60000
      )
      console.log(`Service completed in ${serviceTime} minutes`)
    }

    return updatedEntry
  } catch (error) {
    console.error('Error marking customer as served:', error)
    throw error
  }
}

// Remove customer from queue
export async function removeCustomerFromQueue(queueEntryId: string, reason: 'cancelled' | 'no_show', notes?: string): Promise<QueueEntry> {
  try {
    const updatedEntry = await queueService.update(queueEntryId, {
      status: reason,
      notes
    })

    // Send notification
    const message = reason === 'cancelled'
      ? 'Your queue entry has been cancelled.'
      : 'You were marked as no-show and removed from the queue.'

    await notificationService.create({
      user_id: updatedEntry.user_id,
      queue_entry_id: queueEntryId,
      title: 'Queue Update',
      message,
      type: 'cancelled'
    })

    // Update analytics
    const analyticsField = reason === 'cancelled' ? 'cancelled_customers' : 'no_show_customers'
    await updateDailyAnalytics(updatedEntry.service_id, { [analyticsField]: 1 })

    return updatedEntry
  } catch (error) {
    console.error('Error removing customer from queue:', error)
    throw error
  }
}

// Get queue statistics for a service
export async function getQueueStats(serviceId: string): Promise<QueueStats> {
  try {
    const queueEntries = await queueService.getByService(serviceId)

    const waiting = queueEntries.filter(entry => entry.status === 'waiting')
    const called = queueEntries.filter(entry => entry.status === 'called')
    const served = queueEntries.filter(entry => entry.status === 'served')

    // Calculate average wait time for served customers
    const servedWithTimes = served.filter(entry => entry.joined_at && entry.served_at)
    let averageWaitTime = 0

    if (servedWithTimes.length > 0) {
      const totalWaitTime = servedWithTimes.reduce((total, entry) => {
        const waitTime = Math.round(
          (new Date(entry.served_at!).getTime() - new Date(entry.joined_at).getTime()) / 60000
        )
        return total + waitTime
      }, 0)
      averageWaitTime = Math.round(totalWaitTime / servedWithTimes.length)
    }

    // Get next queue number
    const service = await serviceService.getById(serviceId)
    const nextQueueNumber = service.queue_number_counter + 1

    return {
      totalWaiting: waiting.length,
      totalCalled: called.length,
      totalServed: served.length,
      averageWaitTime,
      nextQueueNumber
    }
  } catch (error) {
    console.error('Error getting queue stats:', error)
    throw error
  }
}

// Update daily analytics
async function updateDailyAnalytics(serviceId: string, updates: Partial<{
  total_customers: number
  served_customers: number
  cancelled_customers: number
  no_show_customers: number
}>) {
  try {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format

    // Get existing analytics for today
    const existingAnalytics = await analyticsService.getByService(serviceId, today, today)

    if (existingAnalytics.length > 0) {
      const current = existingAnalytics[0]
      const updatedData = {
        total_customers: (current.total_customers || 0) + (updates.total_customers || 0),
        served_customers: (current.served_customers || 0) + (updates.served_customers || 0),
        cancelled_customers: (current.cancelled_customers || 0) + (updates.cancelled_customers || 0),
        no_show_customers: (current.no_show_customers || 0) + (updates.no_show_customers || 0)
      }

      await analyticsService.update(serviceId, today, updatedData)
    } else {
      // Create new analytics entry
      await analyticsService.create({
        service_id: serviceId,
        date: today,
        total_customers: updates.total_customers || 0,
        served_customers: updates.served_customers || 0,
        cancelled_customers: updates.cancelled_customers || 0,
        no_show_customers: updates.no_show_customers || 0
      })
    }
  } catch (error) {
    console.error('Error updating analytics:', error)
  }
}

// Send queue reminders (for customers approaching their turn)
export async function sendQueueReminders(serviceId: string) {
  try {
    const queueEntries = await queueService.getByService(serviceId, 'waiting')
    const sortedEntries = queueEntries.sort((a, b) => a.queue_number - b.queue_number)

    // Send reminder to customers who are next few in line
    for (let i = 0; i < Math.min(3, sortedEntries.length); i++) {
      const entry = sortedEntries[i]
      const position = i + 1

      if (position <= 2) { // Remind top 2 customers
        const estimatedTime = position * 15 // Assume 15 minutes per customer

        await notificationService.create({
          user_id: entry.user_id,
          queue_entry_id: entry.id,
          title: 'Queue Reminder',
          message: `You are #${position} in line. Estimated wait time: ${estimatedTime} minutes.`,
          type: 'reminder'
        })

        await sendQueuePositionUpdate(entry.id, position, estimatedTime)
      }
    }
  } catch (error) {
    console.error('Error sending queue reminders:', error)
  }
}

// Get user's current queue entries
export async function getUserQueueEntries(userId: string): Promise<QueueEntry[]> {
  try {
    const activeEntries = await queueService.getByUser(userId)
    return activeEntries.filter(entry => ['waiting', 'called'].includes(entry.status))
  } catch (error) {
    console.error('Error getting user queue entries:', error)
    throw error
  }
}

// Cancel user's queue entry
export async function cancelUserQueueEntry(queueEntryId: string, userId: string): Promise<void> {
  try {
    const queueEntry = await queueService.getById(queueEntryId)

    if (queueEntry.user_id !== userId) {
      throw new Error('Not authorized to cancel this queue entry')
    }

    if (!['waiting', 'called'].includes(queueEntry.status)) {
      throw new Error('Cannot cancel queue entry with current status')
    }

    await removeCustomerFromQueue(queueEntryId, 'cancelled', 'Cancelled by user')
  } catch (error) {
    console.error('Error cancelling queue entry:', error)
    throw error
  }
}

// Estimate wait time for joining a queue
export async function estimateWaitTime(serviceId: string): Promise<number> {
  try {
    const stats = await getQueueStats(serviceId)
    const totalQueueCount = stats.totalWaiting + stats.totalCalled

    // Obtener predicción de IA
    const aiPrediction = await getAIPrediction()

    // Combinar predicción de IA con datos tradicionales de cola
    const estimatedTime = combineAIWithTraditional(aiPrediction, totalQueueCount)

    return estimatedTime
  } catch (error) {
    console.error('Error estimating wait time:', error)
    return 15 // Default fallback
  }
}