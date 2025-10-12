'use client';

import { useState } from 'react';
import { authClient } from '@/lib/api/authClient';

export function ApiTestComponent() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setResults([]);
    
    try {
      addResult('🔄 Testing API connection to localhost:8082');
      
      // Test basic connectivity
      const response = await fetch('http://localhost:8082/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        addResult('✅ Health check successful');
      } else {
        addResult(`⚠️ Health check returned ${response.status}`);
      }
    } catch (err) {
      addResult(`❌ Health check failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    
    setLoading(false);
  };

  const testSuperadminLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      addResult('🔄 Testing superadmin login');
      
      const session = await authClient.login({
        email: 'superadmin@recrutr.in',
        password: 'admin123', // Replace with actual test password
        audience: 'platform',
      });
      
      addResult('✅ Superadmin login successful');
      addResult(`📝 User: ${session.user.name} (${session.user.role})`);
      addResult(`🔑 Token: ${session.token.substring(0, 20)}...`);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      addResult(`❌ Login failed: ${errorMsg}`);
      setError(errorMsg);
    }
    
    setLoading(false);
  };

  // Tenant list test removed - tenantClient replaced with Server Actions
  // Use the actual tenant pages for testing tenant operations

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">API Connection Test (localhost:8082)</h2>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '⏳ Testing...' : '🔍 Test Health Check'}
        </button>
        
        <button
          onClick={testSuperadminLogin}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? '⏳ Testing...' : '🔐 Test Superadmin Login'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <div className="space-y-1 font-mono text-sm">
            {results.map((result, index) => (
              <div key={index}>{result}</div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Configuration Info:</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <div>• API Base URL: http://localhost:8082</div>
          <div>• Admin Login: /admin/login</div>
          <div>• Tenant Create: /tenant/create</div>
          <div>• Tenant List: /tenant/list</div>
          <div>• Tenant Status: /tenant/status</div>
        </div>
      </div>
    </div>
  );
}