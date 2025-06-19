"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/pagination"
import { Download, AlertCircle } from "lucide-react"

interface FailedRecord {
  index: number
  record: Record<string, any>
  reason: string
  retryCount: number
  failedAt: string
}

interface FailedRecordsTableProps {
  jobId: string
  failedRecords: FailedRecord[]
  loading: boolean
  totalRecords: number
  currentPage: number
  onPageChange: (page: number) => void
}

export function FailedRecordsTable({
  jobId,
  failedRecords,
  loading,
  totalRecords,
  currentPage,
  onPageChange,
}: FailedRecordsTableProps) {
  const recordsPerPage = 50
  const totalPages = Math.ceil(totalRecords / recordsPerPage)

  const downloadFailedRecords = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${jobId}/failed/download`, "_blank")
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (failedRecords.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No failed records</h3>
          <p className="text-gray-600">All records were processed successfully!</p>
        </CardContent>
      </Card>
    )
  }

  // Get all unique keys from failed records for table headers
  const allKeys = Array.from(new Set(failedRecords.flatMap((record) => Object.keys(record.record))))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Failed Records</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Showing {failedRecords.length} of {totalRecords.toLocaleString()} failed records
            </p>
          </div>
          <Button onClick={downloadFailedRecords} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead className="w-48">Error Reason</TableHead>
                <TableHead className="w-24">Retries</TableHead>
                {allKeys.map((key) => (
                  <TableHead key={key} className="min-w-32">
                    {key}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {failedRecords.map((failedRecord) => (
                <TableRow key={failedRecord.index}>
                  <TableCell className="font-medium">{failedRecord.index}</TableCell>
                  <TableCell>
                    <div className="max-w-48">
                      <Badge variant="destructive" className="text-xs">
                        {failedRecord.reason}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{failedRecord.retryCount}</Badge>
                  </TableCell>
                  {allKeys.map((key) => (
                    <TableCell key={key} className="max-w-32 truncate">
                      {failedRecord.record[key] || "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
