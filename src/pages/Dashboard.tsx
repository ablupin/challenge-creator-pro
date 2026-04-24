import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInfluencers, useChallenges } from '@/hooks/useDashboard';
import { PromotionsCalendar } from '@/components/dashboard/PromotionsCalendar';
import { InfluencerCard } from '@/components/dashboard/InfluencerCard';
import { AddInfluencerModal } from '@/components/dashboard/AddInfluencerModal';

export default function Dashboard() {
  const { influencers, loading: loadingInfluencers } = useInfluencers();
  const { challenges, loading: loadingChallenges } = useChallenges();
  const [addModalOpen, setAddModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-primary shrink-0" />
          <h1 className="font-display text-xl font-bold text-gradient-hero">Dashboard</h1>
          <div className="ml-auto">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Create Challenge
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Promotions Calendar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Promotions Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingChallenges || loadingInfluencers ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Loading...</p>
            ) : (
              <PromotionsCalendar challenges={challenges} influencers={influencers} />
            )}
          </CardContent>
        </Card>

        {/* Influencer List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Influencers</h2>
            <Button size="sm" onClick={() => setAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Influencer
            </Button>
          </div>

          {loadingInfluencers ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : influencers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No influencers yet.{' '}
              <button
                className="underline hover:text-foreground transition-colors"
                onClick={() => setAddModalOpen(true)}
              >
                Add your first one.
              </button>
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {influencers.map((inf) => (
                <InfluencerCard
                  key={inf.id}
                  influencer={inf}
                  challenges={challenges.filter((c) => c.influencer_id === inf.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <AddInfluencerModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}
