import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Upload, Search, Target, Zap, Shield, BarChart3, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Logo from '@/components/ui/Logo';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Upload,
    title: 'Smart Resume Parsing',
    description: 'Upload PDF, DOCX, or paste text. Our AI extracts skills, experience, and qualifications automatically.'
  },
  {
    icon: Search,
    title: 'Multi-Source Job Search',
    description: 'Aggregate jobs from LinkedIn, Indeed, Glassdoor, and remote job boards in one unified search.'
  },
  {
    icon: Target,
    title: 'AI-Powered Matching',
    description: 'Advanced algorithms match your profile to jobs based on skills, experience, and semantic similarity.'
  },
  {
    icon: BarChart3,
    title: 'Match Analytics',
    description: 'See detailed breakdowns of skill matches, experience relevance, and personalized recommendations.'
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your data stays secure. No third-party sharing. Process everything locally when possible.'
  },
  {
    icon: Zap,
    title: 'Real-Time Updates',
    description: 'Get instant job recommendations as new positions are posted across platforms.'
  }
];

const stats = [
  { value: '50K+', label: 'Jobs Indexed' },
  { value: '95%', label: 'Match Accuracy' },
  { value: '10s', label: 'Resume Analysis' },
  { value: '24/7', label: 'Job Monitoring' }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="default" />
          <div className="flex items-center gap-4">
              <Link to={createPageUrl('Dashboard')}>
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                  Dashboard
                </Button>
              </Link>
              <Link to={createPageUrl('Settings')}>
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                  Settings
                </Button>
              </Link>
              <Link to={createPageUrl('Upload')}>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                  Get Started
                </Button>
              </Link>
            </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full text-emerald-700 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              AI-Powered Job Matching
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                Find Your Perfect
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Job Match
              </span>
            </h1>
            
            <p className="mt-6 text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Upload your resume and let our AI analyze it against thousands of job listings.
              Get personalized match scores and actionable insights instantly.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={createPageUrl('Upload')}>
                <Button
                  size="lg"
                  className="h-14 px-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Resume
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('Jobs')}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 rounded-xl border-slate-200 hover:bg-slate-50"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Browse Jobs
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100"
              >
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-slate-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Intelligent Job Hunting
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Our platform combines advanced AI with comprehensive job aggregation
              to help you find the perfect role faster.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-slate-50/50">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-6">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
              Three simple steps to find your ideal job
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Upload Resume',
                description: 'Upload your resume in PDF or DOCX format, or paste your text directly.'
              },
              {
                step: '02',
                title: 'AI Analysis',
                description: 'Our AI parses your resume and creates a comprehensive skill profile.'
              },
              {
                step: '03',
                title: 'Get Matches',
                description: 'Receive ranked job matches with detailed compatibility scores.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                  <div className="text-5xl font-bold text-emerald-500/20 mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to={createPageUrl('Upload')}>
              <Button
                size="lg"
                className="h-14 px-10 bg-white text-slate-900 hover:bg-slate-100 font-semibold rounded-xl"
              >
                Start Now — It's Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Ready to find your next opportunity?
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Join thousands of job seekers using AI-powered matching to land their dream roles.
          </p>
          <Link to={createPageUrl('Upload')}>
            <Button
              size="lg"
              className="mt-8 h-14 px-10 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} RealTech Labs. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
