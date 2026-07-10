'use client';

import * as React from 'react';
import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { toast } from 'sonner';

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [importAlerts, setImportAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    toast.success('Profile saved', { description: 'Your changes have been saved.' });
  }

  return (
    <div>
      <PageHeader title="Settings" description="Manage your profile, workspace, and preferences." />

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="text-base">AR</AvatarFallback>
                </Avatar>
                <Button type="button" variant="outline" size="sm">
                  Change avatar
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="name">
                    Full name
                  </label>
                  <Input id="name" defaultValue="Aditi Rao" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="email">
                    Email
                  </label>
                  <Input id="email" type="email" defaultValue="aditi@nextlead.io" />
                </div>
              </div>

              <div>
                <Button type="submit" size="sm">
                  Save changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how NextLead looks on your device.</CardDescription>
          </CardHeader>
          <CardContent>
            <SettingRow title="Theme" description="Switch between light and dark mode.">
              <ThemeToggle />
            </SettingRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Choose what you want to be notified about.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <SettingRow title="Email notifications" description="Receive important updates by email.">
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </SettingRow>
            <SettingRow title="Import alerts" description="Get notified when a CSV import finishes.">
              <Switch checked={importAlerts} onCheckedChange={setImportAlerts} />
            </SettingRow>
            <SettingRow title="Weekly digest" description="A weekly summary of your lead activity.">
              <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
            </SettingRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API connection</CardTitle>
            <CardDescription>The backend service NextLead sends CSV uploads to.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2.5">
              <code className="font-mono text-xs text-foreground">{apiUrl}</code>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> Configured
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Set via the <code className="font-mono">NEXT_PUBLIC_API_URL</code> environment
              variable at build time.
            </p>
          </CardContent>
        </Card>

        <Separator />
        <p className="text-xs text-muted-foreground">
          NextLead — AI-Powered Lead Intelligence. Built on Next.js, TypeScript, and Tailwind CSS.
        </p>
      </div>
    </div>
  );
}
