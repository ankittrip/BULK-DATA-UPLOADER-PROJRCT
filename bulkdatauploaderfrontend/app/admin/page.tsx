"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAdminStats, getAllJobs, retryFailedRecords } from "@/lib/api"
import { BarChart3, Users, Database, AlertTriangle, RefreshCw, Search } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface AdminStats {
  totalJobs: number
  totalRecords: number
  failedJobs: number
  totalFailedRecords: number
}

interface Job {
  _id: string
  jobId: string
  fileName: string
  status: string
  totalRecords: number
  successCount: number
  failureCount: number
  createdAt: string
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [jobsLoading, setJobsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalJobs, setTotalJobs] = useState(0)
  const [retryingJobs, setRetryingJobs] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchAdminStats()
    fetchJobs()
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [currentPage, searchTerm])

  const fetchAdminStats = async () => {
    try {
      const statsData = await getAdminStats()
      setStats(statsData)
    } catch (error) {
      console.error("Error fetching admin stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchJobs = async () => {
    setJobsLoading(true)
    try {
      const response = await getAllJobs({
        page: currentPage,
        limit: 10,
        search: searchTerm,
      })
      setJobs(response.jobs)
      setTotalJobs(response.total)
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setJobsLoading(false)
    }
  }

  const handleRetryJob = async (jobId: string) => {
    setRetryingJobs((prev) => new Set(prev).add(jobId))
    try {
      await retryFailedRecords(jobId)
      await fetchJobs()
      await fetchAdminStats()
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor system performance and manage jobs</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRecords.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Jobs</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failedJobs.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Records</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.totalFailedRecords.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Jobs Management */}
      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Job Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Jobs</CardTitle>
                  <CardDescription>Manage and monitor all upload jobs</CardDescription>
                </div>
                <Button onClick={fetchJobs} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Jobs List */}
              {jobsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{job.fileName}</h3>
                          {getStatusBadge(job.status)}
                        </div>
                        <p className="text-sm text-gray-600 font-mono mb-1">Job ID: {job.jobId}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Total: {job.totalRecords.toLocaleString()}</span>
                          <span className="text-green-600">Success: {job.successCount.toLocaleString()}</span>
                          <span className="text-red-600">Failed: {job.failureCount.toLocaleString()}</span>
                          <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {job.failureCount > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetryJob(job.jobId)}
                            disabled={retryingJobs.has(job.jobId)}
                          >
                            {retryingJobs.has(job.jobId) ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>System Analytics</CardTitle>
              <CardDescription>Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
                <p className="text-gray-600">Detailed analytics and reporting features will be available here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
