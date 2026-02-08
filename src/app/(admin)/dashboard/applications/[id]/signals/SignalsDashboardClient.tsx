'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Activity, Zap, RefreshCw } from 'lucide-react';
import { SignalCard } from '@/components/signals/SignalCard';
import { ActionConditionsPanel } from '@/components/signals/ActionConditionsPanel';
import { ManualSignalForm } from '@/components/signals/ManualSignalForm';
import { useAuth } from '@/components/auth/AuthProvider';
import { canSetManualSignals } from '@/domain/evaluation/permissions';
import Card from '@/components/ui/Card';
import type { Application } from '@/domain/applications/schemas';
import type { ApplicationSignal, AvailableActionWithSignals } from '@/domain/signals/schemas';

interface SignalsDashboardClientProps {
  application: Application;
  signals: ApplicationSignal[];
  actions: AvailableActionWithSignals[];
}

export function SignalsDashboardClient({
  application,
  signals,
  actions,
}: SignalsDashboardClientProps) {
  const router = useRouter();
  const { session } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const canSetManual = session ? canSetManualSignals(session.user.permissions) : false;

  const handleBack = () => {
    router.push(`/dashboard/applications/${application.id}`);
  };

  const handleRefresh = () => {
    router.refresh();
    setRefreshKey((k) => k + 1);
  };

  // Group signals by source for better organization
  const groupedSignals = signals.reduce<Record<string, ApplicationSignal[]>>(
    (acc, signal) => {
      const source = signal.source;
      if (!acc[source]) {
        acc[source] = [];
      }
      acc[source].push(signal);
      return acc;
    },
    {}
  );

  const sourceOrder = ['AGGREGATED', 'EVALUATION', 'MANUAL', 'SYSTEM'];
  const sortedSources = Object.keys(groupedSignals).sort(
    (a, b) => sourceOrder.indexOf(a) - sourceOrder.indexOf(b)
  );

  return (
    <div className="flex h-full flex-col" data-testid="signals-dashboard">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Go back"
              data-testid="signals-back-btn"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Application Signals
              </h1>
              <p className="text-sm text-gray-500" data-testid="signals-applicant-info">
                {application.applicantName} &mdash; {application.applicantEmail}
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            data-testid="signals-refresh-btn"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6" key={refreshKey}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Signals Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Signals</h2>
              <span className="ml-auto text-sm text-gray-500">
                {signals.length} signal{signals.length !== 1 ? 's' : ''}
              </span>
            </div>

            {signals.length === 0 ? (
              <Card className="p-6 text-center" data-testid="signals-empty-state">
                <div className="text-gray-400 mb-2">
                  <Activity className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-600">No signals recorded yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Signals will appear here after evaluations are submitted or
                  events occur.
                </p>
              </Card>
            ) : (
              <>
                {sortedSources.map((source) => (
                  <div key={source} className="space-y-3" data-testid={`signals-section-${source.toLowerCase()}`}>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      {source} Signals
                    </h3>
                    <div className="space-y-3">
                      {groupedSignals[source].map((signal) => (
                        <SignalCard key={signal.key} signal={signal} />
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Manual Signal Form */}
            {canSetManual && (
              <ManualSignalForm
                applicationId={application.id}
                onSuccess={handleRefresh}
              />
            )}
          </div>

          {/* Actions Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Action Conditions
              </h2>
            </div>

            {actions.length === 0 ? (
              <Card className="p-6 text-center" data-testid="actions-empty-state">
                <div className="text-gray-400 mb-2">
                  <Zap className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-600">No action conditions available</p>
                <p className="text-sm text-gray-500 mt-1">
                  Action conditions define when certain actions become available
                  based on signals.
                </p>
              </Card>
            ) : (
              <ActionConditionsPanel actions={actions} />
            )}

            {/* Info Card */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h4 className="font-medium text-blue-800 mb-1">
                How Signals Work
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  <strong>Aggregated:</strong> Combined from multiple evaluator
                  responses
                </li>
                <li>
                  <strong>Evaluation:</strong> From individual evaluator
                  submissions
                </li>
                <li>
                  <strong>Manual:</strong> Set by HR or administrators
                </li>
                <li>
                  <strong>System:</strong> Automatically generated by the system
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
