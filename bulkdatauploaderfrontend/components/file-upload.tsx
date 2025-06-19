"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Upload, File, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
  accept?: string
}

export function FileUpload({ onFileSelect, disabled = false, accept = ".csv" }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
    disabled,
  })

  const handleUpload = () => {
    if (selectedFile) {
      onFileSelect(selectedFile)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-blue-600">Drop the CSV file here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">Drag & drop a CSV file here, or click to select</p>
            <p className="text-sm text-gray-500">Supports: CSV files up to 100MB</p>
          </div>
        )}
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <File className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleUpload} disabled={disabled} className="bg-blue-600 hover:bg-blue-700">
              Upload & Process
            </Button>
            <Button variant="outline" size="sm" onClick={handleRemoveFile} disabled={disabled}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
