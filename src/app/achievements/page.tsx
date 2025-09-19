'use client'

import { DashboardLayout } from '@/components/layout/AppLayout'
import { Section, Stack } from '@/components/ui/Container'
import AchievementNFTSection from '@/components/achievements/AchievementNFTSection'
import { useUser } from '@/contexts/UserContext'
import { Loading } from '@/components/ui/Loading'

export default function AchievementsPage() {
  const { user, isLoading } = useUser()

  if (isLoading) {
    return (
      <DashboardLayout>
        <Section>
          <Loading />
        </Section>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout>
        <Section>
          <div className="text-center">
            <p className="text-text-secondary">Please log in to view your achievements.</p>
          </div>
        </Section>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Stack gap="xl" className="animate-slideUp">
        <Section>
          <AchievementNFTSection
            userId={user.id}
            isOwnProfile={true}
          />
        </Section>
      </Stack>
    </DashboardLayout>
  )
}