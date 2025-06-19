const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Helper function for API requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Request failed" }))
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// File upload
export async function uploadFile(file: File, socketId?: string) {
  const formData = new FormData()
  formData.append("file", file)
  if (socketId) {
    formData.append("socketId", socketId)
  }

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Upload failed" }))
    throw new Error(errorData.message || "Upload failed")
  }

  return response.json()
}

// Job History
export async function getJobHistory(params: {
  page?: number
  limit?: number
  search?: string
  status?: string
}) {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.append("page", params.page.toString())
  if (params.limit) searchParams.append("limit", params.limit.toString())
  if (params.search) searchParams.append("search", params.search)
  if (params.status) searchParams.append("status", params.status)

  return apiRequest(`/api/jobs?${searchParams.toString()}`)
}

// Get job by ID
export async function getJobById(jobId: string) {
  return apiRequest(`/api/jobs/${jobId}`)
}

// Get failed records for a job
export async function getFailedRecords(jobId: string, page = 1, limit = 50) {
  return apiRequest(`/api/jobs/${jobId}/failed?page=${page}&limit=${limit}`)
}

// Retry failed job
export async function retryJob(jobId: string) {
  return apiRequest(`/api/jobs/${jobId}/retry`, {
    method: "POST",
  })
}

// Admin APIs
export async function getAdminStats() {
  return apiRequest("/admin/overview")
}

export async function getAllJobs(params: {
  page?: number
  limit?: number
  search?: string
}) {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.append("page", params.page.toString())
  if (params.limit) searchParams.append("limit", params.limit.toString())
  if (params.search) searchParams.append("search", params.search)

  return apiRequest(`/admin/jobs?${searchParams.toString()}`)
}

export async function retryFailedRecords(jobId: string) {
  return apiRequest(`/admin/jobs/${jobId}/retry`, {
    method: "POST",
  })
}

// Send summary email for a job
export async function sendEmailSummary(jobId: string) {
  return apiRequest(`/api/email/summary`, {
    method: "POST",
    body: JSON.stringify({ jobId }),
  })
}


// Stores API
export async function getStores(params: {
  page?: number
  limit?: number
  search?: string
}) {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.append("page", params.page.toString())
  if (params.limit) searchParams.append("limit", params.limit.toString())
  if (params.search) searchParams.append("search", params.search)

  return apiRequest(`/api/stores?${searchParams.toString()}`)
}
