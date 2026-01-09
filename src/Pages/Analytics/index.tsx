import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, TrendingUp, Target, Briefcase, Loader2, Calendar,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import Logo from '@/components/ui/Logo';
import MatchScoreChart from '@/components/dashboard/MatchScoreChart';
import SkillsOverview from '@/components/dashboard/SkillsOverview';
import JobSourceStats from '@/components/dashboard/JobSourceStats';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedResumeId, setSelectedResumeId] = useState('all');

  // Fetch data
  const { data: resumes = [] } = useQuery({
    queryKey: ['resumes-analytics'],
    queryFn: () => base44.entities.Resume.filter({ status: 'ready' }, '-created_date')
  });

  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs-analytics'],
    queryFn: () => base44.entities.Job.filter({ is_active: true }, '-created_date')
  });

  const { data: matches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ['matches-analytics'],
    queryFn: () => base44.entities.JobMatch.list('-created_date')
  });

  const isLoading = jobsLoading || matchesLoading;

  // Filter matches by resume if selected
  const filteredMatches = selectedResumeId === 'all' 
    ? matches 
    : matches.filter(m => m.resume_id === selectedResumeId);

  // Calculate stats
  const totalJobs = jobs.length;
  const totalMatches = filteredMatches.length;
  const avgMatchScore = totalMatches > 0
    ? Math.round(filteredMatches.reduce((sum, m) => sum + m.overall_score, 0) / totalMatches)
    : 0;
  const highMatchCount = filteredMatches.filter(m => m.overall_score >= 70).length;
  const savedCount = filteredMatches.filter(m => m.is_saved).length;
  const appliedCount = filteredMatches.filter(m => m.is_applied).length;

  // Generate time-series data
  const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
  const dateRange = eachDayOfInterval({
    start: subDays(new Date(), days - 1),
    end: new Date()
  });

  const timeSeriesData = dateRange.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayMatches = filteredMatches.filter(m => 
      m.created_date && format(new Date(m.created_date), 'yyyy-MM-dd') === dateStr
    );
    const dayJobs = jobs.filter(j => 
      j.posted_date && j.posted_date === dateStr
    );
    
    return {
      date: format(date, 'MMM d'),
      matches: dayMatches.length,
      jobs: dayJobs.length,
      avgScore: dayMatches.length > 0 
        ? Math.round(dayMatches.reduce((sum, m) => sum + m.overall_score, 0) / dayMatches.length)
        : null
    };
  });

  // Get selected resume skills
  const selectedResume = resumes.find(r => r.id === selectedResumeId);
  const resumeSkills = selectedResume?.parsed_data?.skills || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl('Home')}>
            <Logo size="default" />
          </Link>
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="outline" className="rounded-xl">
                Dashboard
              </Button>
            </Link>
            <Link to={createPageUrl('Jobs')}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                Browse Jobs
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
              <p className="text-slate-600 mt-1">
                Track your job search progress and insights
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                <SelectTrigger className="w-48 bg-white border-slate-200 rounded-xl">
                  <SelectValue placeholder="Select resume" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resumes</SelectItem>
                  {resumes.map(resume => (
                    <SelectItem key={resume.id} value={resume.id}>
                      {resume.parsed_data?.name || 'Resume'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 bg-white border-slate-200 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="14d">Last 14 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
              <p className="text-slate-600">Loading analytics...</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Total Jobs</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{totalJobs}</p>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Matches</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{totalMatches}</p>
                      </div>
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Target className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Avg Score</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{avgMatchScore}%</p>
                      </div>
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Strong Matches</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{highMatchCount}</p>
                      </div>
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Applied</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{appliedCount}</p>
                      </div>
                      <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-rose-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row 1 */}
              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                {/* Activity Over Time */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Activity Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timeSeriesData}>
                          <defs>
                            <linearGradient id="colorMatches" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              background: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="matches"
                            stroke="#10b981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorMatches)"
                            name="Job Matches"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Match Score Distribution */}
                <MatchScoreChart matches={filteredMatches} />
              </div>

              {/* Charts Row 2 */}
              <div className="grid lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                  <SkillsOverview matches={filteredMatches} resumeSkills={resumeSkills} />
                </div>
                <JobSourceStats jobs={jobs} />
              </div>

              {/* Average Score Trend */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Match Score Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeSeriesData.filter(d => d.avgScore !== null)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                          formatter={(value) => [`${value}%`, 'Avg Match Score']}
                        />
                        <Line
                          type="monotone"
                          dataKey="avgScore"
                          stroke="#6366f1"
                          strokeWidth={2}
                          dot={{ fill: '#6366f1', strokeWidth: 2 }}
                          name="Average Score"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
