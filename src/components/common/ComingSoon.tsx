import { Construction } from 'lucide-react';
import { ChartCard } from '@/components/ui';

type ComingSoonProps = {
  title?: string;
  description?: string;
  path?: string;
};

export default function ComingSoon({ title = 'Coming Soon', description, path }: ComingSoonProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-3xl">
        <ChartCard title={title} description={description || 'This page is not available yet. Check back soon.'} icon={Construction}>
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center">
            <Construction className="h-8 w-8 text-[var(--muted-foreground)]" />
            <p className="text-sm text-[var(--muted-foreground)]">
              We’re building this experience. In the meantime, explore other sections from the sidebar.
            </p>
            {path && (
              <p className="text-xs text-[var(--muted-foreground)]/80">
                Requested path: <span className="font-mono">{path}</span>
              </p>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
