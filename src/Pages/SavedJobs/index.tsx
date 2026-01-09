import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bookmark, Briefcase, Loader2, Trash2, CheckCircle, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Logo from '@/components/ui/Logo';
import JobCard from '@/components/jobs/JobCard';
import JobDetail from '@/components/jobs/JobDetail';

export default function SavedJobs() {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeTab, setActiveTab] = useState('saved');

  // Fetch saved matches
  const { data: matches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ['saved-matches'],
    queryFn: () => base44.entities.JobMatch.filter({ is_saved: true }, '-created_date')
  });

  // Fetch applied matches
  const { data: appliedMatches = [] } = useQuery({
    queryKey: ['applied-matches'],
    queryFn: () => base44.entities.JobMatch.filter({ is_applied: true }, '-created_date')
  });

  // Fetch jobs for matches
  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['saved-jobs', matches, appliedMatches],
    queryFn: async () => {
      const allMatches = [...matches, ...appliedMatches];
      const jobIds = [...new Set(allMatches.map(m => m.job_id))];
      if (jobIds.length === 0) return [];
      
      const jobPromises = jobIds.map(id => 
        base44.entities.Job.filter({ id })
      );
      const results = await Promise.all(jobPromises);
      return results.flat();
    },
    enabled: matches.length > 0 || appliedMatches.length > 0
  });

  // Remove saved job
  const unsaveMutation = useMutation({
    mutationFn: async (matchId) => {
      await base44.entities.JobMatch.update(matchId, { is_saved: false });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-matches']);
    }
  });

  const getJobForMatch = (match) => jobs.find(j => j.id === match.job_id);

  const savedJobs = matches.map(m => ({
    match: m,
    job: getJobForMatch(m)
  })).filter(item => item.job);

  const appliedJobs = appliedMatches.map(m => ({
    match: m,
    job: getJobForMatch(m)
  })).filter(item => item.job);

  if (selectedJob) {
    const match = [...matches, ...appliedMatches].find(m => m.job_id === selectedJob.id);
    return (
      <div className="min-h-screen bg-slate-50">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link to={createPageUrl('Home')}>
              <Logo size="default" />
            </Link>
          </div>
        </nav>
        <div className="pt-24 pb-16 px-6">
          <div className="max-w-4xl mx-auto">
            <JobDetail
              job={selectedJob}
              match={match}
              onBack={() => setSelectedJob(null)}
              onSave={() => unsaveMutation.mutate(match.id)}
              isSaved={match?.is_saved}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl('Home')}>
            <Logo size="default" />
          </Link>
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Jobs')}>
              <Button variant="outline" className="rounded-xl">
                Browse Jobs
              </Button>
            </Link>
            <Link to={createPageUrl('Dashboard')}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Saved & Applied Jobs</h1>
            <p className="text-slate-600 mt-1">
              Track your job applications and saved opportunities
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 bg-white border border-slate-200 rounded-xl p-1">
              <TabsTrigger 
                value="saved" 
                className="rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
              >
                <Bookmark className="w-4 h-4 mr-2" />
                Saved ({savedJobs.length})
              </TabsTrigger>
              <TabsTrigger 
                value="applied"
                className="rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Applied ({appliedJobs.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="saved">
              {matchesLoading || jobsLoading ? (
                <div className="text-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
                  <p className="text-slate-600">Loading saved jobs...</p>
                </div>
              ) : savedJobs.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Bookmark className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No saved jobs yet</h3>
                    <p className="text-slate-600 mb-6">
                      Save jobs while browsing to keep track of opportunities you're interested in
                    </p>
                    <Link to={createPageUrl('Jobs')}>
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                        Browse Jobs
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {savedJobs.map(({ match, job }) => (
                    <div key={match.id} className="relative group">
                      <JobCard
                        job={job}
                        match={match}
                        onSelect={setSelectedJob}
                        onSave={() => unsaveMutation.mutate(match.id)}
                        isSaved={true}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="applied">
              {appliedJobs.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No applications yet</h3>
                    <p className="text-slate-600 mb-6">
                      Jobs you apply to will appear here for easy tracking
                    </p>
                    <Link to={createPageUrl('Dashboard')}>
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                        Find Matches
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {appliedJobs.map(({ match, job }) => (
                    <div key={match.id} className="relative">
                      <Badge className="absolute -top-2 -right-2 z-10 bg-emerald-500">
                        Applied
                      </Badge>
                      <JobCard
                        job={job}
                        match={match}
                        onSelect={setSelectedJob}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
