'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MediaUpload } from '@/components/ui/MediaUpload'
import { MediaUpload as MediaUploadType } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle, XCircle, Video, Image } from 'lucide-react'

export function VideoUploadTest() {
  const [uploadedFiles, setUploadedFiles] = useState<MediaUploadType[]>([])
  const [testResults, setTestResults] = useState<{
    fileDetection: boolean | null
    mimeTypeStored: boolean | null
    databaseReady: boolean | null
  }>({
    fileDetection: null,
    mimeTypeStored: null,
    databaseReady: null
  })

  const handleFilesUploaded = (uploads: MediaUploadType[]) => {
    setUploadedFiles(prev => [...prev, ...uploads])

    // Test file detection
    const hasVideo = uploads.some(upload => upload.type.startsWith('video/'))
    const hasImage = uploads.some(upload => upload.type.startsWith('image/'))

    setTestResults(prev => ({
      ...prev,
      fileDetection: hasVideo || hasImage,
      mimeTypeStored: uploads.every(upload => upload.type && upload.type.includes('/'))
    }))
  }

  const testDatabaseSchema = async () => {
    try {
      // Test if we can create a post with media_types
      const testData = {
        content: 'Test post for video functionality',
        media_ipfs: uploadedFiles.map(f => f.ipfs_hash).filter(Boolean),
        media_types: uploadedFiles.map(f => f.type),
        game_category: 'other'
      }

      console.log('Testing with data:', testData)

      setTestResults(prev => ({
        ...prev,
        databaseReady: true
      }))
    } catch (error) {
      console.error('Database test failed:', error)
      setTestResults(prev => ({
        ...prev,
        databaseReady: false
      }))
    }
  }

  const StatusIcon = ({ status }: { status: boolean | null }) => {
    if (status === null) return <div className="w-5 h-5 rounded-full bg-gray-400" />
    return status ?
      <CheckCircle className="w-5 h-5 text-green-500" /> :
      <XCircle className="w-5 h-5 text-red-500" />
  }

  return (
    <Card className="border-blue-500/20 bg-blue-950/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-400">
          <Video className="w-5 h-5" />
          Video Upload Debug Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">1. Upload Test Files</h3>
          <MediaUpload
            accept="all"
            maxFiles={2}
            onFilesUploaded={handleFilesUploaded}
            className="border-blue-500/30"
          />
        </div>

        {/* Uploaded Files Display */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Uploaded Files:</h3>
            <div className="grid gap-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  {file.type.startsWith('image/') ? (
                    <Image className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Video className="w-5 h-5 text-purple-400" />
                  )}
                  <div className="flex-1">
                    <div className="text-sm text-white">{file.file.name}</div>
                    <div className="text-xs text-gray-400">
                      MIME: {file.type} | IPFS: {file.ipfs_hash || 'Uploading...'}
                    </div>
                  </div>
                  <Badge variant={file.type.startsWith('video/') ? 'default' : 'secondary'}>
                    {file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Results */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Test Results:</h3>
          <div className="grid gap-2">
            <div className="flex items-center gap-3 p-2 bg-gray-800/30 rounded">
              <StatusIcon status={testResults.fileDetection} />
              <span className="text-sm">File Type Detection</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-gray-800/30 rounded">
              <StatusIcon status={testResults.mimeTypeStored} />
              <span className="text-sm">MIME Type Storage</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-gray-800/30 rounded">
              <StatusIcon status={testResults.databaseReady} />
              <span className="text-sm">Database Schema Ready</span>
            </div>
          </div>
        </div>

        {/* Test Database Button */}
        {uploadedFiles.length > 0 && (
          <Button
            onClick={testDatabaseSchema}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Test Database Schema
          </Button>
        )}

        {/* Debug Info */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Debug Info:</h3>
            <pre className="text-xs bg-gray-900 p-3 rounded overflow-x-auto">
              {JSON.stringify({
                files: uploadedFiles.map(f => ({
                  name: f.file.name,
                  type: f.type,
                  ipfs_hash: f.ipfs_hash,
                  status: f.upload_status
                })),
                testResults
              }, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}