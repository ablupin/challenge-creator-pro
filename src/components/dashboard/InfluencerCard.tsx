import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Influencer, ChallengeRecord } from '@/types/dashboard';

interface Props {
  influencer: Influencer;
  challenges: ChallengeRecord[];
}

export function InfluencerCard({ influencer, challenges }: Props) {
  const activeCount = challenges.filter((c) => c.status === 'active').length;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1 pr-2">
            <h3 className="font-semibold truncate">{influencer.name}</h3>
            {influencer.handle && (
              <p className="text-sm text-muted-foreground">{influencer.handle}</p>
            )}
            {influencer.niche && (
              <p className="text-xs text-muted-foreground mt-0.5">{influencer.niche}</p>
            )}
          </div>
          <div
            className="w-4 h-4 rounded-full mt-0.5 shrink-0"
            style={{ backgroundColor: influencer.brand_color }}
          />
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{activeCount} active</Badge>
          <Button asChild size="sm" variant="outline">
            <Link to={`/?influencer=${influencer.id}`}>
              <Plus className="w-3 h-3 mr-1" />
              New Challenge
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
