"use client";

import { useEffect, useState } from 'react';
import { getActivePromotions } from '@/lib/services/orders';
import { Promotion } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function PromotionsBanner() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getActivePromotions();
        if (mounted) setPromos(data);
      } catch (e) {
        // silent fail; banner is non-blocking
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading || promos.length === 0) return null;

  return (
    <Card className="p-3 md:p-4 mb-4 border-primary/30 bg-primary/5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="default" className="bg-primary text-primary-foreground">Promo</Badge>
        <div className="flex-1 min-w-0">
          <div className="flex overflow-x-auto gap-4 no-scrollbar">
            {promos.map((p) => (
              <div key={p.id} className="shrink-0">
                <p className="text-sm font-semibold line-clamp-1">{p.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
