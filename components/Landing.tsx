import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon } from './shared/Icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { fadeInUp, staggerContainer, staggerItem, transitions } from '@/lib/motion';
import { ArrowRight, Check, Sparkles, Zap, BarChart3, Users, MessageSquare, Calendar, TrendingUp, Shield } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const Landing: React.FC<LandingProps> = ({ onGetStarted, onSignIn }) => {
  const features = [
    {
      icon: Sparkles,
      title: 'AI Copilot',
      description: 'Get intelligent recommendations, automate tasks, and receive personalized insights tailored to your business.',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track KPIs, monitor sales trends, and visualize your business performance at a glance.',
    },
    {
      icon: Zap,
      title: 'Lead Management',
      description: 'Capture, nurture, and convert leads with AI-powered messaging and follow-up automation.',
    },
    {
      icon: Check,
      title: 'Task & Project Management',
      description: 'Organize your work, assign tasks to team members, and track progress in real-time.',
    },
    {
      icon: MessageSquare,
      title: 'Team Collaboration',
      description: 'Built-in chat, notifications, and shared workspaces keep everyone on the same page.',
    },
    {
      icon: Calendar,
      title: 'Social Media Tools',
      description: 'Schedule posts, analyze engagement, and optimize your social presence—all in one place.',
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Coming Soon',
      features: [
        'AI Copilot Insights',
        'Up to 5 Team Members',
        'Basic Analytics',
        'Lead Management',
        'Task Management',
      ],
    },
    {
      name: 'Professional',
      price: 'Coming Soon',
      features: [
        'Everything in Starter',
        'Unlimited Team Members',
        'Advanced Analytics',
        'Social Media Tools',
        'Priority Support',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Coming Soon',
      features: [
        'Everything in Professional',
        'Custom Integrations',
        'Dedicated Success Manager',
        'API Access',
        'White-Label Options',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 via-purple-50/30 to-pink-50/20 text-foreground overflow-x-hidden relative">
      {/* Enhanced animated background gradient with vibrant colors */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 opacity-25" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, #6366f1, transparent)' }} />
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 20% 50%, #8b5cf6, transparent)' }} />
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 80% 80%, #ec4899, transparent)' }} />
        <div className="absolute inset-0 opacity-15" style={{ background: 'radial-gradient(circle at 50% 50%, #06b6d4, transparent)' }} />
      </div>

      {/* Enhanced Header/Nav Bar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transitions.quick}
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-indigo-200/60 shadow-md"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center">
            <img
              src="/aether-logo/Logo_with_text.png"
              alt="Aether Logo"
              className="h-10 sm:h-12 w-auto drop-shadow-lg"
              loading="eager"
              width="auto"
              height="48"
              fetchPriority="high"
            />
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <a
              href="#features"
              className="hidden sm:inline-block text-indigo-600 hover:text-indigo-800 transition-colors text-sm font-medium"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="hidden sm:inline-block text-indigo-600 hover:text-indigo-800 transition-colors text-sm font-medium"
            >
              Pricing
            </a>
            <Button variant="ghost" onClick={onSignIn} className="hidden sm:flex text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50">
              Sign In
            </Button>
            <Button onClick={onGetStarted} className="hidden sm:flex bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg shadow-indigo-500/50">
              Get Started
            </Button>
            <Button onClick={onSignIn} size="sm" className="sm:hidden">
              Sign In
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={transitions.quick}
          className="space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...transitions.quick, delay: 0.1 }}
          >
            <Badge variant="secondary" className="mb-6 gap-2">
              <SparklesIcon className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              <span className="text-sm font-semibold">MVP Testing Phase</span>
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions.quick, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight"
          >
            Your AI-Powered <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, var(--primary), var(--chart-4), var(--chart-2))' }}>
              Business Copilot
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions.quick, delay: 0.3 }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Aether transforms how you run your business. Automate workflows, get AI-driven insights, and scale faster with the copilot built for modern entrepreneurs.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions.quick, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          >
            <Button
              onClick={onGetStarted}
              size="lg"
              className="text-base sm:text-lg px-8 py-6 h-auto gap-2 group bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl shadow-indigo-500/50"
            >
              Try Aether Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base sm:text-lg px-8 py-6 h-auto border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400"
            >
              Watch Demo
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-7xl mx-auto relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          className="space-y-16"
        >
          <div className="text-center space-y-4">
            <motion.h2
              variants={staggerItem}
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
            >
              Everything You Need to <span className="text-primary">Succeed</span>
            </motion.h2>
            <motion.p
              variants={staggerItem}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Aether brings together all the tools you need to manage, grow, and optimize your business in one powerful platform.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div key={idx} variants={staggerItem}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-indigo-200/50 hover:border-indigo-400/50 group bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:from-indigo-500/30 group-hover:to-purple-500/30 transition-all">
                        <Icon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={transitions.quick}
          className="space-y-16"
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Simple, Transparent <span className="text-primary">Pricing</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your business. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...transitions.quick, delay: idx * 0.1 }}
              >
                <Card
                  className={`h-full flex flex-col transition-all duration-300 ${
                    plan.highlighted
                      ? 'border-brand shadow-lg shadow-brand/20 scale-105'
                      : 'border-border/50 hover:border-brand/50 hover:shadow-lg'
                  }`}
                >
                  <CardHeader>
                    {plan.highlighted && (
                      <Badge variant="default" className="w-fit mb-4">
                        MOST POPULAR
                      </Badge>
                    )}
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <p className="text-4xl font-extrabold text-primary">{plan.price}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={onGetStarted}
                      variant={plan.highlighted ? 'default' : 'outline'}
                      className="w-full"
                      size="lg"
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Feedback Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={transitions.quick}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Feedback Card */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, var(--chart-4), var(--chart-5))' }}>
                  <MessageSquare className="w-6 h-6" style={{ color: 'var(--primary-foreground)' }} />
                </div>
                <CardTitle className="text-2xl">Share Your Feedback</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base mb-6">
                We're building Aether for entrepreneurs like you. Your feedback shapes our roadmap and helps us create the perfect business copilot.
              </CardDescription>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <Label htmlFor="feedback-name">Your Name</Label>
                  <Input id="feedback-name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feedback-email">Your Email</Label>
                  <Input id="feedback-email" type="email" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feedback-message">Your Feedback</Label>
                  <Textarea
                    id="feedback-message"
                    placeholder="What features would you love to see in Aether?"
                    rows={4}
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  Send Feedback
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Feature Requests Card */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, var(--chart-2), var(--chart-2))' }}>
                  <TrendingUp className="w-6 h-6" style={{ color: 'var(--primary-foreground)' }} />
                </div>
                <CardTitle className="text-2xl">Feature Requests</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base mb-6">
                Vote for the features you'd like to see next! Help us prioritize what matters most to you.
              </CardDescription>
              <div className="space-y-3">
                {[
                  { feature: 'Advanced AI Analytics', votes: 234 },
                  { feature: 'Mobile App (iOS & Android)', votes: 189 },
                  { feature: 'Team Collaboration Tools', votes: 156 },
                  { feature: 'Custom Integrations', votes: 143 },
                  { feature: 'White-Label Solution', votes: 98 },
                ].map((item, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-full justify-between h-auto py-3 px-4 hover:border-brand/50 transition-colors"
                    onClick={(e) => e.preventDefault()}
                  >
                    <span className="text-sm font-medium">{item.feature}</span>
                    <Badge variant="secondary" className="ml-2">
                      {item.votes} votes
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={transitions.quick}
        >
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            <CardContent className="p-8 sm:p-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
                Ready to Transform Your Business?
              </h2>
              <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto text-white/90">
                Join early adopters testing Aether and get exclusive access to the future of business management.
              </p>
              <Button
                onClick={onGetStarted}
                size="lg"
                variant="secondary"
                className="text-base sm:text-lg px-8 py-6 h-auto gap-2 group bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg"
              >
                Try Aether Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-12 border-t border-border/50 relative z-10">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center">
            <img
              src="/aether-logo/Logo_with_text.png"
              alt="Aether Logo"
              className="h-10 w-auto drop-shadow-lg"
              loading="lazy"
              width="auto"
              height="40"
              fetchPriority="low"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Aether. All rights reserved. Built for modern entrepreneurs.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Developed by <span className="font-semibold">Byte&Berry</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
