'use client';

import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Settings as SettingsIcon, User, Bell, Database } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Container className="py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light text-[#ededed] mb-2">Settings</h1>
          <p className="text-[#64748b]">Configure your Evolution Studios Engine</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* User Settings */}
          <Card variant="elevated">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#d4a964]/10 rounded-lg">
                <User className="h-6 w-6 text-[#d4a964]" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-[#ededed] mb-2">User Profile</h2>
                <p className="text-[#64748b] mb-4">Manage your account settings and preferences</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-[#64748b]">User ID</label>
                    <p className="text-[#ededed] font-mono text-sm">4a6e4cb7-9fa4-4333-85b4-1ac440119167</p>
                  </div>
                  <div>
                    <label className="text-sm text-[#64748b]">Mode</label>
                    <p className="text-[#ededed]">Development Mode</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* API Settings */}
          <Card variant="elevated">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#d4a964]/10 rounded-lg">
                <Database className="h-6 w-6 text-[#d4a964]" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-[#ededed] mb-2">API Configuration</h2>
                <p className="text-[#64748b] mb-4">Orchestrator and service endpoints</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-[#64748b]">Orchestrator URL</label>
                    <p className="text-[#ededed] font-mono text-sm">http://localhost:8080</p>
                  </div>
                  <div>
                    <label className="text-sm text-[#64748b]">Status</label>
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#4ade80]/10 text-[#4ade80] rounded-lg text-sm">
                      <span className="h-2 w-2 bg-[#4ade80] rounded-full"></span>
                      Connected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card variant="elevated">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#d4a964]/10 rounded-lg">
                <Bell className="h-6 w-6 text-[#d4a964]" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-[#ededed] mb-2">Notifications</h2>
                <p className="text-[#64748b] mb-4">Manage how you receive updates</p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-[#2a2a2a] bg-[#1a1a1a] text-[#d4a964] focus:ring-[#d4a964]"
                    />
                    <span className="text-[#ededed]">Job completion notifications</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-[#2a2a2a] bg-[#1a1a1a] text-[#d4a964] focus:ring-[#d4a964]"
                    />
                    <span className="text-[#ededed]">Error alerts</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-[#2a2a2a] bg-[#1a1a1a] text-[#d4a964] focus:ring-[#d4a964]"
                    />
                    <span className="text-[#ededed]">Weekly summary emails</span>
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Coming Soon */}
          <Card variant="outlined" className="border-dashed">
            <div className="text-center py-8">
              <SettingsIcon className="h-12 w-12 text-[#64748b] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#ededed] mb-2">More Settings Coming Soon</h3>
              <p className="text-[#64748b]">
                Additional configuration options will be available in future updates
              </p>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}
