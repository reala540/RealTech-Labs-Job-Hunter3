import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Briefcase, Search, RefreshCw, Loader2, ChevronLeft, ChevronRight,
  Grid, List, SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import Logo from '@/components/ui/Logo';
import JobCard from '@/components/jobs/JobCard';
import JobFilters from '@/components/jobs/JobFilters';
import JobDetail from '@/components/jobs/JobDetail';
import { JobAggregator, filterByTimeInterval, getSourceStats, getEnabledSources, getDisabledSources } from '@/components/jobs/JobSourceConnector';
import AddJobModal from '@/components/jobs/AddJobModal';

const ITEMS_PER_PAGE = 20;

export default function Jobs() {
  const queryClient = useQueryClient();
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
  const [sortBy, setSortBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('list');

  // Fetch jobs
  const { data: jobs = [], isLoading, refetch } = useQuery({
    queryKey: ['all-jobs'],
    queryFn: () => base44.entities.Job.filter({ is_active: true }, '-created_date', 500)
  });

  // Fetch new jobs with time interval
  const fetchJobsMutation = useMutation({
    mutationFn: async () => {
      const fetchedJobs = await JobAggregator.fetchAllJobs(
        { keywords: filters.keywords || 'software developer' },
        filters.timeInterval || 'all'
      );
      await JobAggregator.saveJobsToDatabase(fetchedJobs);
      return fetchedJobs;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-jobs']);
    }
  });

  // Get source stats
  const sourceStats = getSourceStats();

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

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.posted_date || b.created_date) - new Date(a.posted_date || a.created_date);
      case 'salary_high':
        return (b.salary_max || 0) - (a.salary_max || 0);
      case 'salary_low':
        return (a.salary_min || 0) - (b.salary_min || 0);
      case 'company':
        return (a.company || '').localeCompare(b.company || '');
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = sortedJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Get unique companies for filter
  const uniqueCompanies = [...new Set(jobs.map(j => j.company).filter(Boolean))];

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  if (selectedJob) {
    return (
      <div className="min-h-screen bg-slate-50">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link to={createPageUrl('Home')}>
              <Logo size="default" />
            </Link>
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('Upload')}>
                <Button variant="outline" className="rounded-xl">
                  Upload Resume
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
          <div className="max-w-4xl mx-auto">
            <JobDetail
              job={selectedJob}
              onBack={() => setSelectedJob(null)}
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
                Upload Resume
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Browse Jobs</h1>
                <p className="text-slate-600 mt-1">
                  {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} available
                  <span className="text-slate-400 ml-2">
                    • {sourceStats.enabled} sources active ({sourceStats.disabled} require API keys)
                  </span>
                </p>
              </div>
            <div className="flex items-center gap-3">
              <AddJobModal />
              <Button
                onClick={() => fetchJobsMutation.mutate()}
                disabled={fetchJobsMutation.isLoading}
                variant="outline"
                className="rounded-xl"
              >
                {fetchJobsMutation.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Fetch Jobs
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <JobFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              companies={uniqueCompanies}
            />
          </div>

          {/* Sort & View Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 bg-white border-slate-200 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date Posted</SelectItem>
                  <SelectItem value="salary_high">Salary (High to Low)</SelectItem>
                  <SelectItem value="salary_low">Salary (Low to High)</SelectItem>
                  <SelectItem value="company">Company Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="rounded-lg"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="rounded-lg"
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Job List */}
          {isLoading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
              <p className="text-slate-600">Loading jobs...</p>
            </div>
          ) : paginatedJobs.length === 0 ? (
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
                {jobs.length === 0 && (
                  <Button
                    onClick={() => fetchJobsMutation.mutate()}
                    disabled={fetchJobsMutation.isLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Fetch Jobs
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 gap-4' : 'space-y-4'}>
                {paginatedJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onSelect={setSelectedJob}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={`rounded-lg w-10 ${currentPage === page ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}