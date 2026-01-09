import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, Briefcase, TrendingUp, Bookmark, Search, RefreshCw,
  ChevronRight, Loader2, Sparkles, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Logo from '@/components/ui/Logo';
import JobCard from '@/components/jobs/JobCard';
import JobFilters from '@/components/jobs/JobFilters';
import JobDetail from '@/components/jobs/JobDetail';
import { JobAggregator, filterByTimeInterval } from '@/components/jobs/JobSourceConnector';
import { matchJobsForResume } from '@/components/matching/MatchingService';
import RecommendedJobs, { getRecommendedJobs } from '@/components/recommendations/RecommendedJobs';
import RecommendationPreferences from '@/components/recommendations/RecommendationPreferences';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const resumeIdParam = urlParams.get('resume');

  const [selectedResumeId, setSelectedResumeId] = useState(resumeIdParam);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filters, setFilters] = useState({
    keywords: '',
    title: '',
    location: '',
    work_type: [],
    job_type: [],
    seniority: [],
    salary_min: 0,
    salary_max: 500000,
    companies: [],
    timeInterval: 'all'
  });
  const [isMatching, setIsMatching] = useState(false);
  const [recommendationPrefs, setRecommendationPrefs] = useState({
    minMatchScore: 50,
    preferredWorkTypes: [],
    preferredSeniority: [],
    excludeDismissed: true,
    boostSaved: true,
    boostApplied: false
  });

  // Fetch user's resumes
  const { data: resumes = [], isLoading: resumesLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => base44.entities.Resume.filter({ status: 'ready' }, '-created_date')
  });

  // Fetch jobs
  const { data: jobs = [], isLoading: jobsLoading, refetch: refetchJobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => base44.entities.Job.filter({ is_active: true }, '-created_date', 100)
  });

  // Fetch matches
  const { data: matches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ['matches', selectedResumeId],
    queryFn: () => selectedResumeId 
      ? base44.entities.JobMatch.filter({ resume_id: selectedResumeId }, '-overall_score')
      : [],
    enabled: !!selectedResumeId
  });

  // Set default resume
  useEffect(() => {
    if (!selectedResumeId && resumes.length > 0) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  const selectedResume = resumes.find(r => r.id === selectedResumeId);

  // Fetch and match jobs
  const fetchJobsMutation = useMutation({
    mutationFn: async () => {
      setIsMatching(true);
      
      // Fetch jobs from enabled connectors with time filter
      const fetchedJobs = await JobAggregator.fetchAllJobs(
        { keywords: filters.keywords || selectedResume?.parsed_data?.skills?.slice(0, 3).join(' ') || 'software developer' },
        filters.timeInterval || 'all'
      );
      
      // Save jobs to database
      const savedJobs = await JobAggregator.saveJobsToDatabase(fetchedJobs);
      
      // Calculate matches if resume selected
      if (selectedResume && savedJobs.length > 0) {
        const jobMatches = await matchJobsForResume(selectedResume, savedJobs);
        
        // Save matches
        for (const match of jobMatches) {
          const existing = await base44.entities.JobMatch.filter({
            resume_id: match.resume_id,
            job_id: match.job_id
          });
          
          if (existing.length === 0) {
            await base44.entities.JobMatch.create(match);
          }
        }
      }
      
      return savedJobs;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['jobs']);
      queryClient.invalidateQueries(['matches']);
      setIsMatching(false);
    },
    onError: () => {
      setIsMatching(false);
    }
  });

  // Save/unsave job
  const toggleSaveMutation = useMutation({
    mutationFn: async (job) => {
      const match = matches.find(m => m.job_id === job.id);
      if (match) {
        await base44.entities.JobMatch.update(match.id, { is_saved: !match.is_saved });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['matches']);
    }
  });

  // Dismiss job from recommendations
  const dismissJobMutation = useMutation({
    mutationFn: async ({ job, match }) => {
      if (match) {
        await base44.entities.JobMatch.update(match.id, { is_dismissed: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['matches']);
    }
  });

  // Apply time interval filter first
  const timeFilteredJobs = filterByTimeInterval(jobs, filters.timeInterval);

  // Filter jobs
  const filteredJobs = timeFilteredJobs.filter(job => {
    if (filters.keywords && !`${job.title} ${job.company} ${job.description}`.toLowerCase().includes(filters.keywords.toLowerCase())) {
      return false;
    }
    if (filters.title && !job.title.toLowerCase().includes(filters.title.toLowerCase())) {
      return false;
    }
    if (filters.location && !job.location?.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.work_type?.length > 0 && !filters.work_type.includes(job.work_type)) {
      return false;
    }
    if (filters.job_type?.length > 0 && !filters.job_type.includes(job.job_type)) {
      return false;
    }
    if (filters.seniority?.length > 0 && !filters.seniority.includes(job.seniority)) {
      return false;
    }
    if (filters.salary_min > 0 && job.salary_max && job.salary_max < filters.salary_min) {
      return false;
    }
    if (filters.salary_max < 500000 && job.salary_min && job.salary_min > filters.salary_max) {
      return false;
    }
    if (filters.companies?.length > 0 && !filters.companies.includes(job.company)) {
      return false;
    }
    return true;
  });

  // Sort by match score
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const matchA = matches.find(m => m.job_id === a.id);
    const matchB = matches.find(m => m.job_id === b.id);
    return (matchB?.overall_score || 0) - (matchA?.overall_score || 0);
  });

  // Get unique companies for filter
  const uniqueCompanies = [...new Set(jobs.map(j => j.company).filter(Boolean))];

  // Stats
  const totalJobs = jobs.length;
  const averageMatch = matches.length > 0 
    ? Math.round(matches.reduce((sum, m) => sum + m.overall_score, 0) / matches.length)
    : 0;
  const savedCount = matches.filter(m => m.is_saved).length;
  const highMatches = matches.filter(m => m.overall_score >= 70).length;

  // Get personalized recommendations
  const recommendations = getRecommendedJobs(jobs, matches, recommendationPrefs);

  if (selectedJob) {
    const match = matches.find(m => m.job_id === selectedJob.id);
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
              onSave={() => toggleSaveMutation.mutate(selectedJob)}
              isSaved={match?.is_saved}
              onApply={(job) => {
                if (match) {
                  base44.entities.JobMatch.update(match.id, { is_applied: true });
                }
              }}
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
              <Link to={createPageUrl('Upload')}>
                <Button variant="outline" className="rounded-xl">
                  <FileText className="w-4 h-4 mr-2" />
                  Upload Resume
                </Button>
              </Link>
              <Link to={createPageUrl('Settings')}>
                <Button variant="outline" className="rounded-xl">
                  Settings
                </Button>
              </Link>
              <Link to={createPageUrl('Jobs')}>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                  <Search className="w-4 h-4 mr-2" />
                  Browse All Jobs
                </Button>
              </Link>
            </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Job Matches Dashboard</h1>
            <p className="text-slate-600 mt-1">
              {selectedResume 
                ? `Showing matches for your resume • ${selectedResume.parsed_data?.name || 'Your Profile'}`
                : 'Upload a resume to see personalized job matches'}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{totalJobs}</p>
                    <p className="text-sm text-slate-500">Total Jobs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{averageMatch}%</p>
                    <p className="text-sm text-slate-500">Avg Match</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{highMatches}</p>
                    <p className="text-sm text-slate-500">Strong Matches</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Bookmark className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{savedCount}</p>
                    <p className="text-sm text-slate-500">Saved Jobs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resume Selector */}
          {resumes.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-slate-700">Active Resume:</span>
                {resumes.map(resume => (
                  <Button
                    key={resume.id}
                    variant={selectedResumeId === resume.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedResumeId(resume.id)}
                    className={`rounded-lg ${selectedResumeId === resume.id ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                  >
                    <FileText className="w-4 h-4 mr-1.5" />
                    {resume.parsed_data?.name || 'Resume'}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Jobs Section */}
          {selectedResume && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Recommended For You
                </h2>
                <RecommendationPreferences 
                  preferences={recommendationPrefs}
                  onPreferencesChange={setRecommendationPrefs}
                />
              </div>
              <RecommendedJobs
                recommendations={recommendations}
                onSelectJob={setSelectedJob}
                onSaveJob={(job) => toggleSaveMutation.mutate(job)}
                onDismissJob={(job, match) => dismissJobMutation.mutate({ job, match })}
                onViewAll={() => {
                  setFilters(prev => ({ ...prev, keywords: '' }));
                }}
                maxDisplay={5}
              />
            </div>
          )}

          {/* Filters & Refresh */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Job Listings</h2>
              <Button
                onClick={() => fetchJobsMutation.mutate()}
                disabled={isMatching || fetchJobsMutation.isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
              >
                {isMatching || fetchJobsMutation.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fetching Jobs...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Fetch New Jobs
                  </>
                )}
              </Button>
            </div>
            
            <JobFilters
              filters={filters}
              onFilterChange={setFilters}
              companies={uniqueCompanies}
            />
          </div>

          {/* Job List */}
          {jobsLoading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
              <p className="text-slate-600">Loading jobs...</p>
            </div>
          ) : sortedJobs.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No jobs found</h3>
                <p className="text-slate-600 mb-6">
                  {jobs.length === 0 
                    ? 'Click "Fetch New Jobs" to discover opportunities'
                    : 'Try adjusting your filters to see more results'}
                </p>
                <Button
                  onClick={() => fetchJobsMutation.mutate()}
                  disabled={isMatching || fetchJobsMutation.isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Fetch Jobs
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedJobs.map(job => {
                const match = matches.find(m => m.job_id === job.id);
                return (
                  <JobCard
                    key={job.id}
                    job={job}
                    match={match}
                    onSelect={setSelectedJob}
                    onSave={() => toggleSaveMutation.mutate(job)}
                    isSaved={match?.is_saved}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}