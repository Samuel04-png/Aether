import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon } from './shared/Icons';
import Logo from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { fadeInUp, staggerContainer, staggerItem, transitions } from '@/lib/motion';
import {
  ArrowRight,
  Check,
  Sparkles,
  Zap,
  BarChart3,
  MessageSquare,
  Calendar,
  TrendingUp,
  Shield,
  Star,
  Rocket,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const Landing: React.FC<LandingProps> = ({ onGetStarted, onSignIn }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const screenshots = [
    { src: '/aether_screenshots/Copilot_lightmode.png', alt: 'Aether Copilot showing KPI insights and recommended actions' },
    { src: '/aether_screenshots/Tasks_lightmode.png', alt: 'Aether task board and automation timeline' },
  ];
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const openPreview = (index: number) => {
    setPreviewIndex(index);
    setPreviewOpen(true);
  };
  const nextPreview = () => setPreviewIndex((i) => (i + 1) % screenshots.length);
  const prevPreview = () => setPreviewIndex((i) => (i - 1 + screenshots.length) % screenshots.length);

  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name || !email || !feedback) {
      setStatusMessage({ type: 'error', text: 'Please fill out all required fields before submitting.' });
      toast({
        title: 'Missing information',
        description: 'Please complete your name, email, and feedback before sending.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const response = await fetch('https://impeldown.app.n8n.cloud/webhook-test/aether-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, feedback, timestamp: new Date().toISOString() }),
      });

      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

      setName('');
      setEmail('');
      setFeedback('');
      setStatusMessage({ type: 'success', text: 'Thanks for sharing! We appreciate your feedback.' });
      toast({ title: 'Feedback sent', description: 'Thanks for helping us shape Aether.' });
    } catch (error) {
      console.error('Feedback submission failed', error);
      setStatusMessage({ type: 'error', text: 'Something went wrong sending your feedback. Please try again in a moment.' });
      toast({
        title: 'Submission failed',
        description: 'We could not send your feedback. Please try again shortly.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    { icon: Sparkles, title: 'AI Copilot', description: 'Get intelligent recommendations, automate tasks, and receive personalized insights tailored to your business.' },
    { icon: BarChart3, title: 'Analytics Dashboard', description: 'Track KPIs, monitor sales trends, and visualize your business performance at a glance.' },
    { icon: Zap, title: 'Lead Management', description: 'Capture, nurture, and convert leads with AI-powered messaging and follow-up automation.' },
    { icon: Check, title: 'Task & Project Management', description: 'Organize your work, assign tasks to team members, and track progress in real-time.' },
    { icon: MessageSquare, title: 'Team Collaboration', description: 'Built-in chat, notifications, and shared workspaces keep everyone on the same page.' },
    { icon: Calendar, title: 'Social Media Tools', description: 'Schedule posts, analyze engagement, and optimize your social presence—all in one place.' },
  ];

  const pricingPlans = [
    { name: 'Starter', price: 'Coming Soon', features: ['AI Copilot Insights', 'Up to 5 Team Members', 'Basic Analytics', 'Lead Management', 'Task Management'] },
    {
      name: 'Professional',
      price: 'Coming Soon',
      features: ['Everything in Starter', 'Unlimited Team Members', 'Advanced Analytics', 'Social Media Tools', 'Priority Support'],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Coming Soon',
      features: ['Everything in Professional', 'Custom Integrations', 'Dedicated Success Manager', 'API Access', 'White-Label Options'],
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-indigo-100/70 blur-3xl dark:bg-indigo-500/30" />
        <div className="absolute top-1/3 right-0 h-64 w-64 rounded-full bg-sky-100/70 blur-3xl dark:bg-sky-500/25" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-pink-100/60 blur-3xl dark:bg-pink-500/25" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.08),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.2),transparent_70%)]" />
      </div>

      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transitions.quick}
        className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl shadow-sm dark:border-white/10 dark:bg-slate-950/95"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Logo className="h-10 sm:h-12" animated />
          </motion.div>
          <div className="flex items-center gap-3 sm:gap-6">
            {[
              { href: '#features', label: 'Features' },
              { href: '#pricing', label: 'Pricing' },
              { href: '#contact', label: 'Contact' },
            ].map((item) => (
              <motion.a
                key={item.href}
                href={item.href}
                className="hidden text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 dark:text-white/80 dark:hover:text-white sm:inline-block"
                whileHover={{ y: -2 }}
              >
                {item.label}
              </motion.a>
            ))}
            <Button
              variant="outline"
              onClick={onSignIn}
              className="hidden border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10 sm:flex"
            >
              Sign In
            </Button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={onGetStarted} className="hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg sm:flex">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
            <Button onClick={onSignIn} size="sm" className="sm:hidden">
              Sign In
            </Button>
          </div>
        </div>
      </motion.nav>

      <main className="relative z-10">
        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={transitions.quick}
              className="space-y-8 text-left"
            >
              <Badge className="w-fit gap-2 border border-indigo-100 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-100">
                <SparklesIcon className="h-4 w-4" />
                Early access program
              </Badge>
              <h1 className="text-4xl font-black leading-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
                Automate every workflow with an AI copilot that understands your business.
              </h1>
              <p className="text-lg text-slate-600 dark:text-white/70">
                Aether unifies analytics, tasks, leads, and collaboration so you can move from insight to execution in minutes.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  onClick={onGetStarted}
                  size="lg"
                  className="h-auto rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-4 text-lg font-semibold shadow-xl"
                >
                  Try Aether Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onSignIn}
                  className="h-auto rounded-2xl border border-slate-200 px-8 py-4 text-lg font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
                >
                  Sign In
                </Button>
              </div>
              <div className="grid gap-6 text-sm text-slate-600 dark:text-slate-400 sm:grid-cols-3">
                {[{ label: 'Minutes to onboard', value: '10' }, { label: 'Automation templates', value: '50+' }, { label: 'Teams using Aether', value: '200+' }].map(
                  (stat) => (
                    <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/80 dark:backdrop-blur-sm">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                      <p>{stat.label}</p>
                    </div>
                  ),
                )}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={transitions.quick}>
              <Card className="border border-slate-200 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-slate-900/80 dark:backdrop-blur-sm">
                <button type="button" onClick={() => openPreview(0)} className="relative block w-full text-left" aria-label="Open screenshot preview">
                  <img
                    src={screenshots[0].src}
                    alt={screenshots[0].alt}
                    loading="lazy"
                    width="1920"
                    height="1080"
                    className="w-full rounded-2xl border border-slate-100 shadow-xl transition-transform duration-300 hover:scale-[1.01] dark:border-white/10"
                  />
                  <span className="pointer-events-none absolute right-4 top-4 hidden items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 backdrop-blur sm:flex dark:bg-slate-900/80 dark:text-slate-200 dark:ring-white/10">
                    <Maximize2 className="h-3.5 w-3.5" />
                    Preview
                  </span>
                </button>
              </Card>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>Built with</span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-white/10 dark:bg-slate-900/80">Firebase</span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-white/10 dark:bg-slate-900/80">React 19</span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-white/10 dark:bg-slate-900/80">DeepSeek AI</span>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            className="mx-auto max-w-6xl space-y-16"
          >
            <div className="text-center space-y-5">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white">One workspace for every team</h2>
              <p className="mx-auto max-w-3xl text-lg text-slate-600 dark:text-slate-300">
                Replace disconnected tools with an operating system that brings automation, analytics, and execution together.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.div key={feature.title} variants={staggerItem} whileHover={{ y: -6 }}>
                    <Card className="h-full border border-slate-200 bg-white text-left shadow-lg transition-all dark:border-white/10 dark:bg-slate-900/80 dark:backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-purple-500/20 text-indigo-600 dark:bg-gradient-to-br dark:from-indigo-500/30 dark:to-purple-500/30 dark:text-indigo-300">
                          <Icon className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-slate-900 dark:text-white">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base text-slate-600 dark:text-slate-300">{feature.description}</CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={transitions.quick}
            >
              <Card className="overflow-hidden border border-slate-200 bg-gradient-to-r from-white to-slate-50 shadow-2xl dark:border-white/10 dark:bg-gradient-to-r dark:from-slate-900 dark:to-slate-800/90">
                <div className="grid gap-0 lg:grid-cols-3">
                  <div className="space-y-3 p-8">
                    <Badge className="w-fit border border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-500/40 dark:bg-pink-500/15 dark:text-pink-200">See it in action</Badge>
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Insights that turn into action</h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      Aether surfaces the most important signals and recommends who should act, why it matters, and the impact on your KPIs.
                    </p>
                  </div>
                  <div className="relative lg:col-span-2">
                    <button type="button" onClick={() => openPreview(1)} className="block w-full text-left" aria-label="Open screenshot preview">
                      <img
                        src={screenshots[1].src}
                        alt={screenshots[1].alt}
                        loading="lazy"
                        width="1920"
                        height="1080"
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.01]"
                      />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">How it works</h2>
              <p className="text-slate-600 dark:text-slate-300">Connect your data, choose automations, and let Aether handle the busywork.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { step: '1', title: 'Connect', desc: 'Add your team, KPIs, and tools—no complex setup required.' },
                { step: '2', title: 'Automate', desc: 'Use prebuilt flows or let the copilot create ones for you.' },
                { step: '3', title: 'Grow', desc: 'Get proactive insights, outreach, and playbooks that ship outcomes.' },
              ].map((item) => (
                <Card key={item.step} className="border border-slate-200 bg-white text-left shadow-lg dark:border-white/10 dark:bg-slate-900/80 dark:backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <Badge className="w-fit border border-slate-200 bg-slate-100 text-slate-700 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-200">{`Step ${item.step}`}</Badge>
                    <CardTitle className="mt-3 text-slate-900 dark:text-white">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-slate-600 dark:text-slate-300">{item.desc}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-10">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white">Simple, transparent pricing</h2>
              <p className="text-slate-600 dark:text-slate-300">Select the plan that matches your stage. Paid tiers launch soon.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {pricingPlans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`flex h-full flex-col border border-slate-200 bg-white text-left shadow-xl dark:border-white/10 dark:bg-slate-900/80 dark:backdrop-blur-sm ${
                    plan.highlighted ? 'ring-2 ring-indigo-400 dark:ring-indigo-400' : ''
                  }`}
                >
                  <CardHeader>
                    {plan.highlighted && <Badge className="w-fit border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/20 dark:text-indigo-200">Most popular</Badge>}
                    <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-white">{plan.name}</CardTitle>
                    <p className="text-4xl font-black text-slate-900 dark:text-white">{plan.price}</p>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={onGetStarted}
                      className={`mt-8 w-full rounded-xl ${
                        plan.highlighted
                          ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:bg-white/10'
                      }`}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">Frequently asked questions</h2>
              <p className="text-slate-600 dark:text-slate-300">Quick answers before you jump in.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { q: 'Is there a free trial?', a: 'Yes. Create a workspace with demo data and explore every feature.' },
                { q: 'Do I need a credit card?', a: 'Not yet. Pricing tiers will launch soon with annual and monthly options.' },
                { q: 'Can I invite my team?', a: 'Absolutely. Collaborate with teammates, assign tasks, and share insights.' },
                { q: 'What powers the AI?', a: 'Byte&Berry co-pilot v3 plus proprietary prompts tuned for operations, sales, and marketing.' },
                { q: 'Is my data secure?', a: 'We rely on battle-tested Firebase security, role-based access, and audit logs.' },
                { q: 'Does it work on mobile?', a: 'Yes. The UI is responsive across phones, tablets, and desktops.' },
              ].map((item) => (
                <Card key={item.q} className="border border-slate-200 bg-white text-left shadow-md dark:border-white/10 dark:bg-slate-900/80 dark:backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl text-slate-900 dark:text-white">{item.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-slate-600 dark:text-slate-300">{item.a}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
            <Card className="border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900/80 dark:backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-700 dark:bg-indigo-500/25 dark:text-indigo-300">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-slate-900 dark:text-white">Share feedback</CardTitle>
                    <CardDescription className="text-base text-slate-600 dark:text-slate-300">Help us prioritize the roadmap. Tell us what would make Aether perfect for you.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <Label htmlFor="feedback-name">Your Name</Label>
                    <Input id="feedback-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Johnson" className="mt-1" required />
                  </div>
                  <div>
                    <Label htmlFor="feedback-email">Your Email</Label>
                    <Input id="feedback-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="alex@example.com" className="mt-1" required />
                  </div>
                  <div>
                    <Label htmlFor="feedback-message">Your Feedback</Label>
                    <Textarea
                      id="feedback-message"
                      rows={4}
                      value={feedback}
                      onChange={(event) => setFeedback(event.target.value)}
                      placeholder="What features would you love to see?"
                      className="mt-1"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
                    {isSubmitting ? 'Sending...' : 'Send Feedback'}
                  </Button>
                  {statusMessage && (
                    <p className={`text-sm font-medium ${statusMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>{statusMessage.text}</p>
                  )}
                </form>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900/80 dark:backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-slate-900 dark:text-white">Feature requests</CardTitle>
                    <CardDescription className="text-base text-slate-600 dark:text-slate-300">Vote for what we should launch next.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { feature: 'Advanced AI analytics', votes: 234 },
                  { feature: 'Mobile apps', votes: 189 },
                  { feature: 'Custom automations', votes: 156 },
                  { feature: 'White-label mode', votes: 104 },
                ].map((item) => (
                  <Button
                    key={item.feature}
                    variant="outline"
                    className="flex w-full items-center justify-between rounded-xl border-slate-200 px-4 py-3 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-white dark:hover:bg-white/20"
                  >
                    {item.feature}
                    <Badge className="bg-slate-100 text-slate-700 dark:bg-indigo-500/20 dark:text-indigo-200">{item.votes} votes</Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <Card className="mx-auto max-w-5xl border border-slate-200 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-2xl dark:border-white/5 dark:shadow-indigo-500/20">
            <CardContent className="space-y-6 px-6 py-12 text-center sm:px-12">
              <h2 className="text-3xl font-black">Ready to ship smarter workflows?</h2>
              <p className="text-lg text-white/95">Join early adopters using Aether as their operating system for growth.</p>
              <Button onClick={onGetStarted} size="lg" className="h-auto rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-indigo-600 hover:bg-white/95">
                Try Aether Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl border border-slate-200 bg-white/95 p-4 text-slate-900 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95 dark:text-white">
          <div className="relative">
            <img
              src={screenshots[previewIndex].src}
              alt={screenshots[previewIndex].alt}
              loading="eager"
              className="w-full rounded-xl border border-slate-200 shadow-2xl dark:border-white/10"
            />
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
              <Button
                type="button"
                variant="ghost"
                onClick={prevPreview}
                aria-label="Previous screenshot"
                className="h-9 w-9 rounded-full bg-white/80 text-slate-700 hover:bg-white dark:bg-slate-900/80 dark:text-white dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={nextPreview}
                aria-label="Next screenshot"
                className="h-9 w-9 rounded-full bg-white/80 text-slate-700 hover:bg-white dark:bg-slate-900/80 dark:text-white dark:hover:bg-slate-800"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <footer className="border-t border-slate-200 bg-white/95 backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/95">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Brand Section */}
            <div className="space-y-4 md:col-span-1">
              <Logo className="h-10" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                The all-in-one workspace for modern entrepreneurs. Automate workflows, track metrics, and grow your business.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://www.linkedin.com/company/byte-berry/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 transition-colors hover:text-indigo-600 dark:text-white/60 dark:hover:text-indigo-400"
                  aria-label="LinkedIn"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href="https://web.facebook.com/p/ByteBerry-61575125536198/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 transition-colors hover:text-indigo-600 dark:text-white/60 dark:hover:text-indigo-400"
                  aria-label="Facebook"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Product</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#features" className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                    Changelog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Company</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="https://byteandberry.com" target="_blank" rel="noopener noreferrer" className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                    Byte&Berry
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Resources</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 dark:border-white/10 sm:flex-row">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © {new Date().getFullYear()} Aether. Built with care for modern entrepreneurs.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Terms of Service
              </a>
              <a href="#" className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
