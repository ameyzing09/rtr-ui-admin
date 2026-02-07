'use client';

import { AlertCircle, Zap, Shield } from 'lucide-react';
import type { StageAction, RoleCapability } from '@/domain/tracking/actionSettings/schemas';

interface ActionSettingsClientProps {
  actions: StageAction[];
  capabilities: RoleCapability[];
}

export function ActionSettingsClient({
  actions,
  capabilities,
}: ActionSettingsClientProps) {
  // Sort actions by stage order, then sort order
  const sortedActions = [...actions].sort(
    (a, b) => a.stageOrderIndex - b.stageOrderIndex || a.sortOrder - b.sortOrder
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stage Actions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Read-only view of action configuration for your pipeline stages.
          Actions are configured by your system administrator.
        </p>
      </div>

      {/* Stage Actions Table */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Stage Actions</h2>
        </div>

        {sortedActions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No actions configured</h3>
            <p className="text-gray-500 max-w-sm">
              Stage actions have not been configured yet.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action Code
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Display Name
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                    Outcome Type
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Terminal
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Feedback
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Notes
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capability
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedActions.map((action) => (
                  <tr key={action.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <code className="text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        {action.actionCode}
                      </code>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {action.displayName}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <span className="text-sm text-gray-900">{action.stageName}</span>
                        <span className="text-xs text-gray-500 ml-1">({action.stageType})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <OutcomeTypeBadge outcomeType={action.outcomeType} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <BoolBadge value={action.isTerminal} trueLabel="Yes" falseLabel="No" trueColor="red" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <BoolBadge value={action.requiresFeedback} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <BoolBadge value={action.requiresNotes} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <code className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        {action.requiredCapability}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Capabilities Table */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Role Capabilities</h2>
        </div>

        {capabilities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No capabilities configured</h3>
            <p className="text-gray-500 max-w-sm">
              Role capabilities have not been configured yet.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    Role
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capabilities
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {capabilities.map((cap) => (
                  <tr key={cap.roleName} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {cap.roleName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {cap.capabilities.map((capability) => (
                          <span
                            key={capability}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {capability}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function OutcomeTypeBadge({ outcomeType }: { outcomeType: string }) {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-blue-100 text-blue-800',
    HOLD: 'bg-amber-100 text-amber-800',
    SUCCESS: 'bg-green-100 text-green-800',
    FAILURE: 'bg-red-100 text-red-800',
    NEUTRAL: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[outcomeType] ?? 'bg-gray-100 text-gray-800'}`}>
      {outcomeType}
    </span>
  );
}

function BoolBadge({
  value,
  trueLabel = 'Yes',
  falseLabel = 'No',
  trueColor = 'green',
}: {
  value: boolean;
  trueLabel?: string;
  falseLabel?: string;
  trueColor?: 'green' | 'red';
}) {
  if (value) {
    const colorClasses = trueColor === 'red'
      ? 'bg-red-100 text-red-800'
      : 'bg-green-100 text-green-800';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClasses}`}>
        {trueLabel}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
      {falseLabel}
    </span>
  );
}
