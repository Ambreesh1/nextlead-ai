'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, ShieldCheck, Sparkles, Upload, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/common/Logo';
import { ThemeToggle } from '@/components/common/ThemeToggle';

const FEATURES = [
  {
    icon: Upload,
    title: 'Any CSV layout',
    description: 'Facebook Ads, Google Ads, Excel exports, or a hand-made spreadsheet — no fixed columns required.',
  },
  {
    icon: Sparkles,
    title: 'AI field mapping',
    description: 'Gemini intelligently maps whatever columns you have onto a clean, structured CRM schema.',
  },
  {
    icon: ShieldCheck,
    title: 'Validated output',
    description: 'Every AI-extracted record is schema-validated before it reaches your CRM data.',
  },
  {
    icon: BarChart3,
    title: 'Instant insights',
    description: 'Status breakdowns, source performance, and import trends — the moment your data lands.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm">
            <Link href="/dashboard">
              Go to Dashboard <ArrowRight size={13} />
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-24 pt-16 text-center sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
        >
          <Zap size={12} className="text-primary" /> Powered by Gemini AI
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
        >
          AI-Powered Lead Intelligence
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-4 max-w-xl text-base text-muted-foreground"
        >
          NextLead turns any lead export into clean, structured CRM data in seconds — no matter
          how messy or unpredictable the original spreadsheet is.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <Button asChild size="lg">
            <Link href="/dashboard/import">
              Import your first CSV <ArrowRight size={15} />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">View dashboard</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-20 grid grid-cols-1 gap-4 text-left sm:grid-cols-2"
        >
          {FEATURES.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="flex items-start gap-3 p-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon size={17} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="font-display text-sm font-semibold text-foreground">{feature.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        NextLead — AI-Powered Lead Intelligence.
      </footer>
    </div>
  );
}
