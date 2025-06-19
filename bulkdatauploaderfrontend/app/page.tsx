"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FileUpload } from "@/components/file-upload"
import { ProgressModal } from "@/components/progress-modal"
import { useSocket } from "@/hooks/use-socket"
import { uploadFile, sendEmailSummary } from "@/lib/api"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Upload,
  History,
  Settings,
  BarChart3,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Zap,
  Shield,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Download,
  TrendingUp,
  Users,
  Server,
  Globe,
  Star,
  Heart,
  Code,
  Sparkles,
  Database,
  CloudUpload,
  Activity,
} from "lucide-react"
import Link from "next/link"

interface UploadProgress {
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

interface QuickStat {
  label: string
  value: string
  icon: React.ReactNode
  color: string
  trend?: string
}

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}

export default function HomePage() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [showProgress, setShowProgress] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [recentStats, setRecentStats] = useState<QuickStat[]>([])
  const [systemHealth, setSystemHealth] = useState(98.5)
  const [activeTab, setActiveTab] = useState("upload")

  const router = useRouter()

  const { socket, isConnected } = useSocket({
    onUploadProgress: (data: UploadProgress) => {
      setUploadProgress(data)
    },
    onUploadComplete: async (data: any) => {
      setUploadProgress((prev) => (prev ? { ...prev, ...data, status: "completed" } : null))
      setIsUploading(false)

      try {
        await sendEmailSummary(data.jobId)
        toast.success("🎉 Processing Complete!", {
          description: "Email summary sent to your inbox with detailed results.",
          duration: 5000,
        })
      } catch (err: any) {
        toast.error("❌ Email delivery failed", {
          description: "Processing completed successfully, but email couldn't be sent.",
          action: {
            label: "Retry",
            onClick: () => handleResendEmail(),
          },
        })
      }

      setTimeout(() => {
        setShowProgress(false)
        setUploadProgress(null)
      }, 6000)
    },
    onUploadError: (data: any) => {
      setUploadProgress((prev) => (prev ? { ...prev, ...data, status: "failed" } : null))
      setIsUploading(false)
      toast.error("Upload failed", {
        description: data.message || "Please check your file format and try again.",
        action: {
          label: "Help",
          onClick: () => setActiveTab("help"),
        },
      })
    },
  })

  // Enhanced stats with trends
  useEffect(() => {
    const loadStats = () => {
      setRecentStats([
        {
          label: "Files Processed Today",
          value: "47",
          icon: <FileText className="h-4 w-4" />,
          color: "text-cyan-600",
          trend: "+12%",
        },
        {
          label: "Success Rate",
          value: "99.2%",
          icon: <CheckCircle className="h-4 w-4" />,
          color: "text-emerald-600",
          trend: "+0.7%",
        },
        {
          label: "Avg Processing Time",
          value: "1.8min",
          icon: <Clock className="h-4 w-4" />,
          color: "text-orange-600",
          trend: "-15%",
        },
        {
          label: "Active Users",
          value: "234",
          icon: <Users className="h-4 w-4" />,
          color: "text-purple-600",
          trend: "+8%",
        },
      ])
    }

    loadStats()
    const interval = setInterval(loadStats, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!socket || !isConnected) {
        toast.error("Connection Error", {
          description: "Please check your internet connection and refresh the page.",
          action: {
            label: "Refresh",
            onClick: () => window.location.reload(),
          },
        })
        return
      }

      // Enhanced file validation
      const maxSize = 100 * 1024 * 1024 // Increased to 100MB
      if (file.size > maxSize) {
        toast.error("File too large", {
          description: "Please upload a file smaller than 100MB.",
        })
        return
      }

      // Check file type
      if (!file.name.toLowerCase().endsWith(".csv")) {
        toast.error("Invalid file type", {
          description: "Please upload a CSV file only.",
        })
        return
      }

      setIsUploading(true)
      setShowProgress(true)
      setActiveTab("upload")

      try {
        const response = await uploadFile(file, socket.id)

        if (response.success) {
          setUploadProgress({
            jobId: response.jobId,
            status: "queued",
            message: "File uploaded successfully. Processing will begin shortly...",
            processedRecords: 0,
            successfulRecords: 0,
            failedRecords: 0,
            progress: 0,
          })

          toast.success("🚀 Upload successful!", {
            description: `Processing ${file.name} - You'll see real-time updates.`,
          })
        } else {
          throw new Error(response.message || "Upload failed")
        }
      } catch (error) {
        setUploadProgress({
          jobId: "",
          status: "failed",
          message: error instanceof Error ? error.message : "Upload failed",
        })
        setIsUploading(false)
      }
    },
    [socket, isConnected],
  )

  const handleCloseProgress = () => {
    setShowProgress(false)
    setUploadProgress(null)
  }

  const handleViewHistory = () => {
    router.push("/history")
  }

  const handleResendEmail = async () => {
    if (!uploadProgress?.jobId) return
    setIsResending(true)

    try {
      await sendEmailSummary(uploadProgress.jobId)
      toast.success("📨 Email resent successfully!", {
        description: "Check your inbox for the updated summary.",
      })
    } catch {
      toast.error("❌ Failed to resend email", {
        description: "Please try again or contact support.",
      })
    } finally {
      setIsResending(false)
    }
  }

  const getConnectionStatus = () => {
    if (isConnected) {
      return {
        variant: "default" as const,
        icon: <CheckCircle className="h-4 w-4" />,
        text: "Connected",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      }
    }
    return {
      variant: "destructive" as const,
      icon: <XCircle className="h-4 w-4" />,
      text: "Disconnected",
      className: "bg-red-50 text-red-700 border-red-200",
    }
  }

  const connectionStatus = getConnectionStatus()

  const features: Feature[] = [
    {
      icon: <CloudUpload className="h-6 w-6" />,
      title: "Smart Upload",
      description: "Intelligent file validation and preprocessing",
      color: "bg-cyan-100 text-cyan-600",
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Real-time Tracking",
      description: "Live progress updates and performance metrics",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Batch Processing",
      description: "Efficient handling of large datasets",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Enterprise Security",
      description: "End-to-end encryption and data protection",
      color: "bg-orange-100 text-orange-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100">
      {/* Header with AT.dev Branding */}
      <header className="border-b border-white/20 bg-white/10 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* AT.dev Logo */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">AT</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Code className="h-2 w-2 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AT.dev</h1>
                  <p className="text-xs text-gray-600">Smart to create code</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge
                variant={connectionStatus.variant}
                className={`${connectionStatus.className} px-3 py-1 text-sm font-medium`}
              >
                {connectionStatus.icon}
                <span className="ml-2">{connectionStatus.text}</span>
              </Badge>

              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <Server className="h-4 w-4 text-cyan-600" />
                <span>System Health:</span>
                <span className="font-semibold text-emerald-600">{systemHealth}%</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 px-6 py-3 rounded-full text-sm font-medium mb-6 shadow-sm">
            <Sparkles className="h-4 w-4" />
            Enterprise Bulk Data Processing Platform
            <Sparkles className="h-4 w-4" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Bulk Data
            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent"> Uploader</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Transform your data processing workflow with our intelligent bulk upload system. Process thousands of CSV
            records with real-time monitoring, comprehensive analytics, and automated reporting.
          </p>

          {/* Quick Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            {recentStats.map((stat, index) => (
              <Card
                key={index}
                className="border-0 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
              >
                <CardContent className="p-4 text-center">
                  <div className={`${stat.color} mb-2 flex justify-center`}>{stat.icon}</div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                  {stat.trend && (
                    <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center justify-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {stat.trend}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Connection Alert */}
        {!isConnected && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Connection to server lost. Some features may not work properly.
              <Button variant="link" className="p-0 h-auto ml-2 text-red-600" onClick={() => window.location.reload()}>
                Refresh page
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Tabs Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Help
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Upload Section */}
              <div className="lg:col-span-2">
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="p-3 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl">
                        <Upload className="h-6 w-6 text-cyan-600" />
                      </div>
                      Upload CSV File
                    </CardTitle>
                    <CardDescription className="text-base">
                      Select a CSV file to upload and process. Maximum file size: 100MB
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <FileUpload onFileSelect={handleFileUpload} disabled={isUploading || !isConnected} accept=".csv" />

                    {isUploading && (
                      <div className="mt-6 p-6 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
                        <div className="flex items-center gap-3 text-cyan-800 mb-4">
                          <RefreshCw className="h-5 w-5 animate-spin" />
                          <span className="font-semibold">Processing your file...</span>
                        </div>
                        <Progress value={uploadProgress?.progress || 0} className="h-2" />
                        <p className="text-sm text-cyan-600 mt-2">{uploadProgress?.message}</p>
                      </div>
                    )}

                    {/* Sample CSV Download */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Need a template?</h4>
                          <p className="text-sm text-gray-600">Download our sample CSV file to get started</p>
                        </div>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Sample CSV
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions Sidebar */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>

                {[
                  {
                    href: "/history",
                    icon: History,
                    title: "Job History",
                    description: "Track uploads and download reports",
                    color: "bg-blue-100 text-blue-600",
                  },
                  {
                    href: "/admin",
                    icon: BarChart3,
                    title: "Analytics Dashboard",
                    description: "Monitor performance and trends",
                    color: "bg-emerald-100 text-emerald-600",
                  },
                  {
                    href: "/stores",
                    icon: Settings,
                    title: "Data Management",
                    description: "Browse and search records",
                    color: "bg-purple-100 text-purple-600",
                  },
                ].map((action, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-0 bg-white/80 backdrop-blur-sm"
                  >
                    <Link href={action.href} className="block">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-2 ${action.color} rounded-lg group-hover:scale-110 transition-transform`}>
                            <action.icon className="h-5 w-5" />
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{action.title}</h4>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all"
                >
                  <CardContent className="p-6 text-center">
                    <div className={`${feature.color} p-3 rounded-xl inline-flex mb-4`}>{feature.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Advanced Features */}
            <Card className="border-0 bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xl">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Enterprise-Grade Performance</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-cyan-200" />
                        <span>Process up to 1M records per batch</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-cyan-200" />
                        <span>99.9% uptime guarantee</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-cyan-200" />
                        <span>Advanced error handling & recovery</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-cyan-200" />
                        <span>Real-time monitoring & alerts</span>
                      </li>
                    </ul>
                  </div>
                  <div className="text-center">
                    <Globe className="h-24 w-24 text-cyan-200 mx-auto mb-4" />
                    <p className="text-cyan-100">Trusted by 500+ companies worldwide</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Processing Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-600 mb-2">+23%</div>
                  <p className="text-sm text-gray-600">Increase in processing speed this month</p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 mb-2">1,247</div>
                  <p className="text-sm text-gray-600">Users processed files this week</p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-purple-600" />
                    Data Processed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600 mb-2">2.4M</div>
                  <p className="text-sm text-gray-600">Records processed successfully</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Help Tab */}
          <TabsContent value="help" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* CSV Format Guide */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-cyan-600" />
                    CSV Format Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Required Columns:</h4>
                    <div className="space-y-2">
                      {["storeName", "storeAddress", "retailerName", "storeType"].map((col) => (
                        <div key={col} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{col}</code>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Optional Columns:</h4>
                    <div className="space-y-2">
                      {["cityName", "regionName", "storeLongitude", "storeLatitude"].map((col) => (
                        <div key={col} className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{col}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Process Flow */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-emerald-600" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      { step: 1, title: "Upload File", desc: "Select and upload your CSV file", icon: Upload },
                      { step: 2, title: "Validation", desc: "File is validated and queued", icon: CheckCircle },
                      { step: 3, title: "Processing", desc: "Real-time progress updates", icon: Activity },
                      { step: 4, title: "Results", desc: "Get detailed results and email", icon: Mail },
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-cyan-100 to-blue-100 text-cyan-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {item.step}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <item.icon className="h-4 w-4 text-gray-500" />
                            <h5 className="font-medium text-gray-900">{item.title}</h5>
                          </div>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer with Developer Credit */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-gray-600">Developed by</span>
                <span className="font-semibold text-gray-900">Ankit Tripathi</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-xs">AT</span>
                </div>
                <span className="font-medium text-cyan-600">AT.dev</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>© 2024 AT.dev. All rights reserved.</span>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span>Enterprise Grade</span>
              </div>
            </div>
          </div>
        </footer>

        {/* Progress Modal */}
        {showProgress && uploadProgress && (
          <ProgressModal progress={uploadProgress} onClose={handleCloseProgress} onViewHistory={handleViewHistory} />
        )}

        {/* Floating Resend Email Button */}
        {uploadProgress?.status === "completed" && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              size="lg"
              className="shadow-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white border-0"
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5 mr-2" />
                  Resend Email Summary
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
