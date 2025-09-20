import { DashboardLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PostNotFound() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card className="border-red-500/20 bg-red-900/10">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-red-400 mb-2">
              Post Not Found
            </h1>
            <p className="text-gray-400 mb-6">
              This post may have been deleted, made private, or the link is incorrect.
            </p>
            <Link href="/feed">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Feed
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}