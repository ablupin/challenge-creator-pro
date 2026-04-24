import { useMemo } from 'react';
import { ChallengeRecord, Influencer } from '@/types/dashboard';

function parseLocalDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function diffDays(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

interface Props {
  challenges: ChallengeRecord[];
  influencers: Influencer[];
}

export function PromotionsCalendar({ challenges, influencers }: Props) {
  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const { windowStart, months, totalDays } = useMemo(() => {
    // 3 calendar months back to 3 calendar months forward
    const start = new Date(today.getFullYear(), today.getMonth() - 3, 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 4, 0);
    const total = diffDays(end, start) + 1;

    const mths: { label: string; dayOffset: number; days: number }[] = [];
    let cur = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cur <= end) {
      const monthStart = new Date(cur.getFullYear(), cur.getMonth(), 1);
      const monthEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
      const clampStart = monthStart < start ? start : monthStart;
      const clampEnd = monthEnd > end ? end : monthEnd;
      mths.push({
        label: clampStart.toLocaleString('default', { month: 'short', year: '2-digit' }),
        dayOffset: diffDays(clampStart, start),
        days: diffDays(clampEnd, clampStart) + 1,
      });
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }

    return { windowStart: start, windowEnd: end, months: mths, totalDays: total };
  }, [today]);

  const todayOffset = diffDays(today, windowStart);

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: '680px' }}>
        {/* Month headers */}
        <div className="flex border-b border-border pb-1 mb-1">
          <div className="w-40 shrink-0" />
          <div className="flex-1 relative h-6">
            {months.map((m) => (
              <div
                key={m.label}
                className="absolute top-0 h-full border-l border-border/40 text-[11px] text-muted-foreground px-1.5 flex items-center overflow-hidden"
                style={{
                  left: `${(m.dayOffset / totalDays) * 100}%`,
                  width: `${(m.days / totalDays) * 100}%`,
                }}
              >
                {m.label}
              </div>
            ))}
          </div>
        </div>

        {influencers.length === 0 ? (
          <p className="text-center py-8 text-sm text-muted-foreground">
            Add influencers below to see their challenges here.
          </p>
        ) : (
          influencers.map((inf) => {
            const rows = challenges.filter((c) => c.influencer_id === inf.id);
            return (
              <div
                key={inf.id}
                className="flex items-center py-2 border-b border-border/20 min-h-[44px]"
              >
                <div className="w-40 shrink-0 pr-3">
                  <p className="text-sm font-medium truncate leading-tight">{inf.name}</p>
                  {inf.handle && (
                    <p className="text-[11px] text-muted-foreground leading-tight">{inf.handle}</p>
                  )}
                </div>
                <div className="flex-1 relative h-7">
                  {/* Today line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-400/60 z-10 pointer-events-none"
                    style={{ left: `${(todayOffset / totalDays) * 100}%` }}
                  />
                  {rows.map((ch) => {
                    const dropDate = parseLocalDate(ch.drop_date);
                    const expiryDate = parseLocalDate(ch.expiry_date);
                    const startDay = Math.max(0, diffDays(dropDate, windowStart));
                    const endDay = Math.min(totalDays - 1, diffDays(expiryDate, windowStart));
                    if (endDay < 0 || startDay >= totalDays || endDay < startDay) return null;
                    const left = (startDay / totalDays) * 100;
                    const width = Math.max(0.8, ((endDay - startDay + 1) / totalDays) * 100);
                    const barClass =
                      ch.type === 'food'
                        ? 'bg-amber-400 hover:bg-amber-500'
                        : 'bg-indigo-400 hover:bg-indigo-500';
                    const opacity = ch.status === 'expired' ? 'opacity-40' : '';
                    return (
                      <div
                        key={ch.id}
                        title={`${ch.title}\n${ch.drop_date} → ${ch.expiry_date}\nStatus: ${ch.status}`}
                        className={`absolute top-0.5 bottom-0.5 ${barClass} ${opacity} rounded-md flex items-center px-1.5 overflow-hidden cursor-default transition-colors`}
                        style={{ left: `${left}%`, width: `${width}%` }}
                      >
                        <span className="text-[10px] text-white font-semibold truncate leading-none">
                          {ch.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {/* Today label at bottom */}
        <div className="flex mt-1">
          <div className="w-40 shrink-0" />
          <div className="flex-1 relative h-4">
            <div
              className="absolute -translate-x-1/2 text-[10px] text-red-400 font-medium"
              style={{ left: `${(todayOffset / totalDays) * 100}%` }}
            >
              Today
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
