"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/pagination"
import { getJobHistory, retryJob } from "@/lib/api"
import { Search, RefreshCw, Download, Eye, AlertCircle } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface Job {
  _id: string
  jobId: string
  fileName: string
  status: string
  totalRecords: number
  successCount: number
  failureCount: number
  createdAt: string
  updatedAt: string
}

export default function HistoryPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalJobs, setTotalJobs] = useState(0)
  const [retryingJobs, setRetryingJobs] = useState<Set<string>>(new Set())

  const jobsPerPage = 10

  useEffect(() => {
    fetchJobs()
  }, [currentPage, searchTerm])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const response = await getJobHistory({
        page: currentPage,
        limit: jobsPerPage,
        search: searchTerm,
      })
      setJobs(response.jobs)
      setTotalJobs(response.total)
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = async (jobId: string) => {
    setRetryingJobs((prev) => new Set(prev).add(jobId))
    try {
      await retryJob(jobId)
      // Refresh the job list
      await fetchJobs()
    } catch (error) {
      console.error("Error retrying job:", error)
    } finally {
      setRetryingJobs((prev) => {
        const newSet = new Set(prev)
        newSet.delete(jobId)
        return newSet
      })
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

  const totalPages = Math.ceil(totalJobs / jobsPerPage)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job History</h1>
        <p className="text-gray-600">Track all your upload jobs and their status</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by filename, job ID, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={fetchJobs} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search terms" : "Upload your first CSV file to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{job.fileName}</CardTitle>
                    <CardDescription className="font-mono text-sm">Job ID: {job.jobId}</CardDescription>
                  </div>
                  {getStatusBadge(job.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Records</p>
                    <p className="font-semibold">{job.totalRecords.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Successful</p>
                    <p className="font-semibold text-green-600">{job.successCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Failed</p>
                    <p className="font-semibold text-red-600">{job.failureCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="font-semibold">
                      {job.totalRecords > 0 ? Math.round((job.successCount / job.totalRecords) * 100) : 0}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Created {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                  </p>

                  <div className="flex gap-2">
                    <Link href={`/jobs/${job.jobId}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </Link>

                    {job.failureCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRetry(job.jobId)}
                        disabled={retryingJobs.has(job.jobId)}
                      >
                        {retryingJobs.has(job.jobId) ? (
                          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-1" />
                        )}
                        Retry Failed
                      </Button>
                    )}

                    <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${job.jobId}/download?format=csv`} download>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  )
}
