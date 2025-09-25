import { Construction } from 'lucide-react';
import { ChartCard } from '@/components/ui';
import { UI_TEXT } from '@/config/constants';

type ComingSoonProps = {
  title?: string;
  description?: string;
  path?: string;
};

export default function ComingSoon({ title = UI_TEXT.COMING_SOON, description, path }: ComingSoonProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-3xl">
        <ChartCard title={title} description={description || UI_TEXT.NOT_AVAILABLE} icon={Construction}>
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center">
            <Construction className="h-8 w-8 text-[var(--muted-foreground)]" />
            <p className="text-sm text-[var(--muted-foreground)]">
              {UI_TEXT.EXPLORE_OTHER_SECTIONS}
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
