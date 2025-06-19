"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getJobById, getFailedRecords, retryJob } from "@/lib/api"
import { ArrowLeft, RefreshCw, Download, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { FailedRecordsTable } from "@/components/failed-records-table"

interface JobDetails {
  _id: string
  jobId: string
  fileName: string
  status: string
  totalRecords: number
  successCount: number
  failureCount: number
  createdAt: string
  updatedAt: string
  completedAt?: string
  errorMessage?: string
}

interface FailedRecord {
  index: number
  record: Record<string, any>
  reason: string
  retryCount: number
  failedAt: string
}

export default function JobDetailsPage() {
  const params = useParams()
  const jobId = params.jobId as string

  const [job, setJob] = useState<JobDetails | null>(null)
  const [failedRecords, setFailedRecords] = useState<FailedRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [failedRecordsLoading, setFailedRecordsLoading] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalFailedRecords, setTotalFailedRecords] = useState(0)

  useEffect(() => {
    fetchJobDetails()
  }, [jobId])

  useEffect(() => {
    if (job && job.failureCount > 0) {
      fetchFailedRecords()
    }
  }, [job, currentPage])

  const fetchJobDetails = async () => {
    try {
      const jobData = await getJobById(jobId)
      setJob(jobData)
    } catch (error) {
      console.error("Error fetching job details:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFailedRecords = async () => {
    setFailedRecordsLoading(true)
    try {
      const response = await getFailedRecords(jobId, currentPage, 50)
      setFailedRecords(response.failedRecords)
      setTotalFailedRecords(response.totalFailedRecords)
    } catch (error) {
      console.error("Error fetching failed records:", error)
    } finally {
      setFailedRecordsLoading(false)
    }
  }

  const handleRetry = async () => {
    setRetrying(true)
    try {
      await retryJob(jobId)
      // Refresh job details
      await fetchJobDetails()
    } catch (error) {
      console.error("Error retrying job:", error)
    } finally {
      setRetrying(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      processing: "bg-blue-100 text-blue-800",
      queued: "bg-yellow-100 text-yellow-800",
      pending: "bg-gray-100 text-gray-800",
    }

    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Job not found</h3>
            <p className="text-gray-600 mb-4">The requested job could not be found.</p>
            <Link href="/history">
              <Button>Back to History</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/history">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.fileName}</h1>
            <p className="text-gray-600 font-mono">Job ID: {job.jobId}</p>
          </div>
          {getStatusBadge(job.status)}
        </div>
      </div>

      {/* Job Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Job Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Records</p>
              <p className="text-2xl font-bold">{job.totalRecords.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Successful</p>
              <p className="text-2xl font-bold text-green-600">{job.successCount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-600">{job.failureCount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Success Rate</p>
              <p className="text-2xl font-bold">
                {job.totalRecords > 0 ? Math.round((job.successCount / job.totalRecords) * 100) : 0}%
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="font-medium">{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</p>
            </div>
            {job.completedAt && (
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="font-medium">{formatDistanceToNow(new Date(job.completedAt), { addSuffix: true })}</p>
              </div>
            )}
          </div>

          {job.errorMessage && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Error:</strong> {job.errorMessage}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 mb-6">
        {job.failureCount > 0 && (
          <Button onClick={handleRetry} disabled={retrying}>
            {retrying ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Retry Failed Records
          </Button>
        )}

        <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${job.jobId}/download?format=csv`} download>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Summary
          </Button>
        </a>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {job.failureCount > 0 && (
            <TabsTrigger value="failed-records">Failed Records ({job.failureCount.toLocaleString()})</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Processing Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">File Information</h4>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Filename:</dt>
                        <dd className="font-medium">{job.fileName}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Status:</dt>
                        <dd>{getStatusBadge(job.status)}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Processing Statistics</h4>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Total Records:</dt>
                        <dd className="font-medium">{job.totalRecords.toLocaleString()}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Success Rate:</dt>
                        <dd className="font-medium">
                          {job.totalRecords > 0 ? Math.round((job.successCount / job.totalRecords) * 100) : 0}%
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {job.failureCount > 0 && (
          <TabsContent value="failed-records">
            <FailedRecordsTable
              jobId={job.jobId}
              failedRecords={failedRecords}
              loading={failedRecordsLoading}
              totalRecords={totalFailedRecords}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
