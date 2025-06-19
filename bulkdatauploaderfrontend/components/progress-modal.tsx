"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"

interface ProgressData {
  jobId: string
  status: string
  message?: string
  totalRecords?: number
  processedRecords?: number
  successfulRecords?: number
  failedRecords?: number
  progress?: number
  processingSpeed?: number
  batchInfo?: {
    totalBatches: number
    completedBatches: number
    currentBatch: number
    batchSize: number
  }
}

interface ProgressModalProps {
  progress: ProgressData
  onClose: () => void
  onViewHistory: () => void
}

export function ProgressModal({ progress, onClose, onViewHistory }: ProgressModalProps) {
  const getStatusIcon = () => {
    switch (progress.status) {
      case "completed":
        return <CheckCircle className="h-8 w-8 text-green-500" />
      case "failed":
        return <XCircle className="h-8 w-8 text-red-500" />
      case "processing":
        return <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-8 w-8 text-yellow-500" />
    }
  }

  const getStatusColor = () => {
    switch (progress.status) {
      case "completed":
        return "text-green-600"
      case "failed":
        return "text-red-600"
      case "processing":
        return "text-blue-600"
      default:
        return "text-yellow-600"
    }
  }

  const formatNumber = (num?: number) => {
    return num?.toLocaleString() || "0"
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getStatusIcon()}
            <span className={getStatusColor()}>
              {progress.status === "completed"
                ? "Upload Complete!"
                : progress.status === "failed"
                  ? "Upload Failed"
                  : progress.status === "processing"
                    ? "Processing..."
                    : "Upload Queued"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Job ID */}
          <div className="text-sm">
            <span className="font-medium">Job ID:</span>
            <span className="ml-2 font-mono text-gray-600">{progress.jobId}</span>
          </div>

          {/* Message */}
          {progress.message && <div className="text-sm text-gray-600">{progress.message}</div>}

          {/* Progress Bar */}
          {progress.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress.progress}%</span>
              </div>
              <Progress value={progress.progress} className="w-full" />
            </div>
          )}

          {/* Statistics */}
          {progress.totalRecords !== undefined && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Total Records:</span>
                  <span className="font-medium">{formatNumber(progress.totalRecords)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processed:</span>
                  <span className="font-medium">{formatNumber(progress.processedRecords)}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-green-600">Successful:</span>
                  <span className="font-medium text-green-600">{formatNumber(progress.successfulRecords)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Failed:</span>
                  <span className="font-medium text-red-600">{formatNumber(progress.failedRecords)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Processing Speed */}
          {progress.processingSpeed && (
            <div className="text-sm text-gray-600">
              Processing Speed: {formatNumber(progress.processingSpeed)} records/sec
            </div>
          )}

          {/* Batch Info */}
          {progress.batchInfo && (
            <div className="text-sm text-gray-600">
              Batch {progress.batchInfo.completedBatches} of {progress.batchInfo.totalBatches} completed
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            {progress.status === "completed" && (
              <Button onClick={onViewHistory} className="flex-1">
                View History
              </Button>
            )}
            <Button
              variant={progress.status === "completed" ? "outline" : "default"}
              onClick={onClose}
              className={progress.status === "completed" ? "" : "flex-1"}
            >
              {progress.status === "processing" ? "Run in Background" : "Close"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
