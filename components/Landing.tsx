import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon } from './shared/Icons';
import Logo from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { fadeInUp, staggerContainer, staggerItem, transitions } from '@/lib/motion';
import { ArrowRight, Check, Sparkles, Zap, BarChart3, Users, MessageSquare, Calendar, TrendingUp, Shield, Star, Rocket } from 'lucide-react';

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

  // Animated floating orbs
  const FloatingOrb = ({ delay = 0, duration = 20, size = 400, color, startX = 0, startY = 0 }: { delay?: number; duration?: number; size?: number; color: string; startX?: number | string; startY?: number | string }) => (
    <motion.div
      className="absolute rounded-full blur-3xl opacity-30"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}, transparent)`,
        left: typeof startX === 'string' ? startX : `${startX}%`,
        top: typeof startY === 'string' ? startY : `${startY}%`,
      }}
      animate={{
        x: [0, 100, -50, 0],
        y: [0, -80, 50, 0],
        scale: [1, 1.2, 0.8, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 via-purple-950 to-pink-950 text-foreground overflow-x-hidden relative">
      {/* Ultra-enhanced animated background with floating orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Animated gradient base */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.4), transparent 50%)',
              'radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.4), transparent 50%)',
              'radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.4), transparent 50%)',
              'radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.4), transparent 50%)',
            ],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Floating animated orbs */}
        <FloatingOrb delay={0} duration={25} size={600} color="rgba(99, 102, 241, 0.6)" startX="10%" startY="20%" />
        <FloatingOrb delay={5} duration={30} size={500} color="rgba(139, 92, 246, 0.5)" startX="80%" startY="60%" />
        <FloatingOrb delay={10} duration={20} size={450} color="rgba(236, 72, 153, 0.5)" startX="50%" startY="80%" />
        <FloatingOrb delay={7} duration={35} size={400} color="rgba(6, 182, 212, 0.4)" startX="70%" startY="10%" />
        
        {/* Animated mesh gradient overlay */}
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              'radial-gradient(ellipse 80% 50% at 50% -20%, #6366f1, transparent 70%)',
              'radial-gradient(ellipse 80% 50% at 50% -20%, #8b5cf6, transparent 70%)',
              'radial-gradient(ellipse 80% 50% at 50% -20%, #ec4899, transparent 70%)',
              'radial-gradient(ellipse 80% 50% at 50% -20%, #6366f1, transparent 70%)',
            ],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer bg-[length:200%_100%]" />
      </div>

      {/* Ultra-enhanced Header/Nav Bar with glassmorphism */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transitions.quick}
        className="sticky top-0 z-50 bg-white/5 backdrop-blur-2xl border-b border-white/10 shadow-2xl"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center cursor-pointer">
            <Logo className="h-10 sm:h-12" animated />
          </motion.div>
          <div className="flex items-center gap-3 sm:gap-6">
            <motion.a
              href="#features"
              className="hidden sm:inline-block text-white/90 hover:text-white transition-all text-sm font-semibold relative group"
              whileHover={{ y: -2 }}
            >
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 group-hover:w-full transition-all duration-300" />
            </motion.a>
            <motion.a
              href="#pricing"
              className="hidden sm:inline-block text-white/90 hover:text-white transition-all text-sm font-semibold relative group"
              whileHover={{ y: -2 }}
            >
              Pricing
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300" />
            </motion.a>
            <Button
              variant="ghost"
              onClick={onSignIn}
              className="hidden sm:flex text-white/90 hover:text-white hover:bg-white/10 border border-white/20 backdrop-blur-sm"
            >
              Sign In
            </Button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onGetStarted}
                className="hidden sm:flex bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white shadow-2xl shadow-purple-500/50 border-0 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100"
                  initial={false}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </motion.div>
            <Button onClick={onSignIn} size="sm" className="sm:hidden bg-white/10 text-white border-white/20">
              Sign In
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Ultra-enhanced Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-24 max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={transitions.quick}
          className="space-y-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ ...transitions.gentle, delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <Badge className="mb-8 gap-2 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-white/20 backdrop-blur-xl text-white px-4 py-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <SparklesIcon className="w-4 h-4 text-yellow-400" />
              </motion.div>
              <span className="text-sm font-bold bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                MVP Testing Phase
              </span>
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions.gentle, delay: 0.2 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-tight"
          >
            <span className="block text-white mb-2">Your AI-Powered</span>
            <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent animate-gradient">
              Business Copilot
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions.gentle, delay: 0.3 }}
            className="text-xl sm:text-2xl md:text-3xl text-white/80 max-w-4xl mx-auto leading-relaxed font-medium"
          >
            Aether transforms how you run your business. Automate workflows, get AI-driven insights, and scale faster with the copilot built for modern entrepreneurs.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions.gentle, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-6"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={onGetStarted}
                size="lg"
                className="text-lg sm:text-xl px-10 py-7 h-auto gap-3 group bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white shadow-2xl shadow-purple-500/50 border-0 relative overflow-hidden rounded-2xl font-bold"
              >
                <Rocket className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span>Try Aether Free</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="lg"
                className="text-lg sm:text-xl px-10 py-7 h-auto border-2 border-white/30 bg-white/5 backdrop-blur-xl text-white hover:bg-white/10 hover:border-white/50 rounded-2xl font-bold"
              >
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating stats or features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions.gentle, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-8 pt-12"
          >
            {[
              { icon: Star, text: 'AI-Powered', color: 'from-yellow-400 to-orange-500' },
              { icon: Zap, text: 'Lightning Fast', color: 'from-blue-400 to-cyan-500' },
              { icon: Shield, text: 'Secure', color: 'from-green-400 to-emerald-500' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  className="flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full"
                  whileHover={{ scale: 1.1, y: -5, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  transition={transitions.quick}
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-semibold">{item.text}</span>
                </motion.div>
              );
            })}
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
          <div className="text-center space-y-6">
            <motion.h2
              variants={staggerItem}
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight"
            >
              <span className="text-white">Everything You Need to </span>
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Succeed
              </span>
            </motion.h2>
            <motion.p
              variants={staggerItem}
              className="text-xl sm:text-2xl text-white/80 max-w-3xl mx-auto font-medium"
            >
              Aether brings together all the tools you need to manage, grow, and optimize your business in one powerful platform.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              const gradients = [
                'from-indigo-500/20 via-purple-500/20 to-pink-500/20',
                'from-blue-500/20 via-cyan-500/20 to-teal-500/20',
                'from-purple-500/20 via-pink-500/20 to-rose-500/20',
                'from-emerald-500/20 via-teal-500/20 to-cyan-500/20',
                'from-orange-500/20 via-amber-500/20 to-yellow-500/20',
                'from-rose-500/20 via-pink-500/20 to-purple-500/20',
              ];
              const iconGradients = [
                'from-indigo-400 to-purple-500',
                'from-blue-400 to-cyan-500',
                'from-purple-400 to-pink-500',
                'from-emerald-400 to-teal-500',
                'from-orange-400 to-amber-500',
                'from-rose-400 to-pink-500',
              ];
              return (
                <motion.div
                  key={idx}
                  variants={staggerItem}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group"
                >
                  <Card className="h-full border-white/10 bg-gradient-to-br bg-white/5 backdrop-blur-2xl shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 rounded-2xl overflow-hidden relative">
                    {/* Animated gradient border */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `linear-gradient(135deg, ${['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#ef4444'][idx]}, transparent)`,
                        padding: '2px',
                      }}
                    >
                      <div className="w-full h-full bg-gradient-to-br bg-white/5 backdrop-blur-2xl rounded-2xl" />
                    </motion.div>
                    
                    <div className="relative z-10">
                      <CardHeader className="pb-4">
                        <motion.div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${iconGradients[idx]} flex items-center justify-center mb-4 shadow-lg`}
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </motion.div>
                        <CardTitle className="text-2xl text-white font-bold">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base leading-relaxed text-white/70">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </div>
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
          <div className="text-center space-y-6">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
              <span className="text-white">Simple, Transparent </span>
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Pricing
              </span>
            </h2>
            <p className="text-xl sm:text-2xl text-white/80 max-w-3xl mx-auto font-medium">
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
                <motion.div
                  whileHover={{ y: -10, scale: plan.highlighted ? 1.05 : 1.02 }}
                  transition={transitions.quick}
                >
                  <Card
                    className={`h-full flex flex-col transition-all duration-500 border-white/10 bg-gradient-to-br bg-white/5 backdrop-blur-2xl shadow-xl rounded-2xl overflow-hidden relative ${
                      plan.highlighted
                        ? 'border-2 border-purple-500/50 shadow-2xl shadow-purple-500/30'
                        : 'hover:border-white/20 hover:shadow-2xl'
                    }`}
                  >
                    {plan.highlighted && (
                      <motion.div
                        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                        animate={{
                          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        style={{
                          backgroundSize: '200% 100%',
                        }}
                      />
                    )}
                    <CardHeader className="pt-8">
                      {plan.highlighted && (
                        <Badge className="w-fit mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                          MOST POPULAR
                        </Badge>
                      )}
                      <CardTitle className="text-3xl text-white font-bold">{plan.name}</CardTitle>
                      <div className="mt-6">
                        <p className="text-5xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                          {plan.price}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col pb-8">
                      <ul className="space-y-4 mb-8 flex-1">
                        {plan.features.map((feature, fIdx) => (
                          <motion.li
                            key={fIdx}
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: fIdx * 0.1 }}
                          >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-white/80 font-medium">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={onGetStarted}
                          className={`w-full rounded-xl font-bold text-lg py-6 ${
                            plan.highlighted
                              ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white shadow-2xl shadow-purple-500/50'
                              : 'bg-white/10 border-2 border-white/20 text-white hover:bg-white/20 backdrop-blur-xl'
                          }`}
                          size="lg"
                        >
                          Get Started
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
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
          <motion.div whileHover={{ y: -5 }} transition={transitions.quick}>
            <Card className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-xl rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white font-bold">Share Your Feedback</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-6 text-white/70">
                  We're building Aether for entrepreneurs like you. Your feedback shapes our roadmap and helps us create the perfect business copilot.
                </CardDescription>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-2">
                    <Label htmlFor="feedback-name" className="text-white/90 font-semibold">Your Name</Label>
                    <Input id="feedback-name" placeholder="John Doe" className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feedback-email" className="text-white/90 font-semibold">Your Email</Label>
                    <Input id="feedback-email" type="email" placeholder="john@example.com" className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feedback-message" className="text-white/90 font-semibold">Your Feedback</Label>
                    <Textarea
                      id="feedback-message"
                      placeholder="What features would you love to see in Aether?"
                      rows={4}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white shadow-lg rounded-xl font-bold" size="lg">
                      Send Feedback
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Feature Requests Card */}
          <motion.div whileHover={{ y: -5 }} transition={transitions.quick}>
            <Card className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-xl rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white font-bold">Feature Requests</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-6 text-white/70">
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
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02, x: 5 }}
                      transition={transitions.quick}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-between h-auto py-3 px-4 hover:border-purple-400/50 transition-colors bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-xl"
                        onClick={(e) => e.preventDefault()}
                      >
                        <span className="text-sm font-semibold">{item.feature}</span>
                        <Badge className="ml-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30 text-white">
                          {item.votes} votes
                        </Badge>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
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
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={transitions.quick}
          >
            <Card className="border-0 shadow-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl overflow-hidden relative">
              {/* Animated shimmer overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <CardContent className="p-12 sm:p-16 relative z-10">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-white">
                  Ready to Transform Your Business?
                </h2>
                <p className="text-xl sm:text-2xl mb-10 max-w-3xl mx-auto text-white/90 font-medium">
                  Join early adopters testing Aether and get exclusive access to the future of business management.
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={onGetStarted}
                    size="lg"
                    className="text-lg sm:text-xl px-10 py-7 h-auto gap-3 group bg-white text-indigo-600 hover:bg-indigo-50 shadow-2xl rounded-2xl font-bold"
                  >
                    Try Aether Now
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* Enhanced Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-16 border-t border-white/10 relative z-10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="flex items-center justify-center"
          >
            <Logo className="h-12" />
          </motion.div>
          <p className="text-sm text-white/70 font-medium">
            © {new Date().getFullYear()} Aether. All rights reserved. Built for modern entrepreneurs.
          </p>
          <p className="text-xs text-white/50">
            Developed by <span className="font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Byte&Berry</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
