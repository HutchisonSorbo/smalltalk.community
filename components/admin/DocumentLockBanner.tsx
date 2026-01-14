"use client"

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Lock, Eye, ArrowLeft, UserCircle } from 'lucide-react'

interface DocumentLockBannerProps {
    lockedBy: {
        id: string
        name: string
        email?: string
    }
    lockedAt: Date | string
    onTakeOver: () => void
    onViewReadOnly: () => void
    onGoBack: () => void
}

/**
 * Banner displayed when a document is locked by another user.
 * 
 * @param props.lockedBy - User details who holds the lock
 * @param props.lockedAt - Timestamp when the lock was acquired
 * @param props.onTakeOver - Callback to forcefully take over the lock
 * @param props.onViewReadOnly - Callback to view the document in read-only mode
 * @param props.onGoBack - Callback to navigate back to the list
 * @returns An alert banner with lock details and available actions
 */
export function DocumentLockBanner({
    lockedBy,
    lockedAt,
    onTakeOver,
    onViewReadOnly,
    onGoBack,
}: DocumentLockBannerProps) {
    const date = new Date(lockedAt)
    const normalizedDate = isNaN(date.getTime()) ? new Date() : date
    const deltaMs = Math.max(0, new Date().getTime() - normalizedDate.getTime())
    const minutesAgo = Math.floor(deltaMs / 60000)

    return (
        <Alert variant="destructive" className="mb-4">
            <Lock className="h-4 w-4" aria-hidden="true" />
            <AlertTitle className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" aria-hidden="true" />
                Document Locked
            </AlertTitle>
            <AlertDescription className="mt-2">
                <p className="mb-3">
                    <strong>{lockedBy.name || lockedBy.email}</strong> is currently editing this document
                    {minutesAgo > 0 && ` (started ${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago)`}.
                </p>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={onViewReadOnly}>
                        <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
                        View Read-Only
                    </Button>
                    <Button variant="destructive" size="sm" onClick={onTakeOver}>
                        <Lock className="h-4 w-4 mr-2" aria-hidden="true" />
                        Take Over Editing
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onGoBack}>
                        <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                        Go Back
                    </Button>
                </div>
            </AlertDescription>
        </Alert>
    )
}
