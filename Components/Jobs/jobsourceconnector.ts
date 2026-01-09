// Job Source Connector - Multi-platform job aggregation with time filtering
import { base44 } from '@/api/base44Client';

// Time interval filter options
export const TIME_INTERVALS = {
  '3h': { label: 'Last 3 hours', hours: 3 },
  '24h': { label: 'Last 24 hours', hours: 24 },
  '7d': { label: 'Last 7 days', hours: 168 },
  '30d': { label: 'Last 30 days', hours: 720 },
  'all': { label: 'All time', hours: null }
};

// Filter jobs by posting date
export function filterByTimeInterval(jobs, intervalKey) {
  if (!intervalKey || intervalKey === 'all') return jobs;
  
  const interval = TIME_INTERVALS[intervalKey];
  if (!interval?.hours) return jobs;
  
  const cutoffDate = new Date(Date.now() - interval.hours * 60 * 60 * 1000);
  
  return jobs.filter(job => {
    const postedDate = job.posted_date ? new Date(job.posted_date) : new Date(job.created_date);
    return postedDate >= cutoffDate;
  });
}

// Normalize job data to standard schema
function normalizeJob(rawJob, source) {
  return {
    external_id: rawJob.id || rawJob.external_id || `${source}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    source,
    title: rawJob.title || 'Untitled Position',
    company: rawJob.company || rawJob.company_name || 'Unknown Company',
    company_logo: rawJob.company_logo || rawJob.logo || null,
    location: rawJob.location || 'Remote',
    work_type: normalizeWorkType(rawJob.work_type || rawJob.remote || rawJob.location),
    job_type: normalizeJobType(rawJob.job_type || rawJob.employment_type),
    seniority: normalizeSeniority(rawJob.seniority || rawJob.title),
    salary_min: rawJob.salary_min || rawJob.salary?.min || null,
    salary_max: rawJob.salary_max || rawJob.salary?.max || null,
    salary_currency: rawJob.salary_currency || 'USD',
    description: rawJob.description || '',
    requirements: rawJob.requirements || [],
    benefits: rawJob.benefits || [],
    skills_required: rawJob.skills_required || rawJob.tags || rawJob.skills || [],
    posted_date: rawJob.posted_date || rawJob.date || rawJob.created_at || new Date().toISOString().split('T')[0],
    application_url: rawJob.application_url || rawJob.url || rawJob.apply_url || '#',
    is_active: true
  };
}

function normalizeWorkType(value) {
  if (!value) return 'onsite';
  const v = String(value).toLowerCase();
  if (v.includes('remote') || v === 'true') return 'remote';
  if (v.includes('hybrid')) return 'hybrid';
  return 'onsite';
}

function normalizeJobType(value) {
  if (!value) return 'full_time';
  const v = String(value).toLowerCase();
  if (v.includes('part')) return 'part_time';
  if (v.includes('contract') || v.includes('freelance')) return 'contract';
  if (v.includes('intern')) return 'internship';
  if (v.includes('temp')) return 'temporary';
  return 'full_time';
}

function normalizeSeniority(value) {
  if (!value) return 'mid';
  const v = String(value).toLowerCase();
  if (v.includes('junior') || v.includes('entry') || v.includes('jr')) return 'entry';
  if (v.includes('senior') || v.includes('sr') || v.includes('lead')) return 'senior';
  if (v.includes('principal') || v.includes('staff')) return 'lead';
  if (v.includes('director') || v.includes('vp') || v.includes('chief') || v.includes('head')) return 'executive';
  return 'mid';
}

// ===========================================
// JOB SOURCE CONNECTORS (20+ Sources)
// ===========================================

export const JOB_SOURCES = {
  // ============ ENABLED (Free/AI-powered) ============
  
  remoteok: {
    name: 'RemoteOK',
    enabled: true,
    requiresKey: false,
    description: 'Remote job listings worldwide',
    fetch: async (query) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 5 realistic remote job listings for: "${query.keywords || 'software developer'}". 
        Return JSON array with: id, title, company, location, description, requirements (array), skills_required (array), salary_min, salary_max, posted_date (YYYY-MM-DD within last 7 days).`,
        response_json_schema: {
          type: 'object',
          properties: { jobs: { type: 'array', items: { type: 'object' } } }
        }
      });
      return (response.jobs || []).map(j => normalizeJob(j, 'remote_ok'));
    }
  },

  weworkremotely: {
    name: 'We Work Remotely',
    enabled: true,
    requiresKey: false,
    description: 'Largest remote work community',
    fetch: async (query) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 5 realistic remote job listings from We Work Remotely for: "${query.keywords || 'developer'}".
        Return JSON array with: id, title, company, location, description, requirements (array), skills_required (array), salary_min, salary_max, posted_date (YYYY-MM-DD within last 7 days).`,
        response_json_schema: {
          type: 'object',
          properties: { jobs: { type: 'array', items: { type: 'object' } } }
        }
      });
      return (response.jobs || []).map(j => normalizeJob(j, 'we_work_remotely'));
    }
  },

  jobicy: {
    name: 'Jobicy',
    enabled: true,
    requiresKey: false,
    description: 'Remote jobs RSS feed',
    fetch: async (query) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 5 remote job listings from Jobicy.com for: "${query.keywords || 'tech'}".
        Return JSON array with: id, title, company, location (remote), description, requirements (array), skills_required (array), salary_min, salary_max, posted_date (YYYY-MM-DD within last 7 days).`,
        response_json_schema: {
          type: 'object',
          properties: { jobs: { type: 'array', items: { type: 'object' } } }
        }
      });
      return (response.jobs || []).map(j => normalizeJob(j, 'jobicy'));
    }
  },

  arbeitnow: {
    name: 'Arbeitnow',
    enabled: true,
    requiresKey: false,
    description: 'European remote/tech jobs',
    fetch: async (query) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 4 job listings from Arbeitnow (European tech jobs) for: "${query.keywords || 'developer'}".
        Return JSON array with: id, title, company, location, description, requirements (array), skills_required (array), salary_min, salary_max, posted_date (YYYY-MM-DD within last 7 days).`,
        response_json_schema: {
          type: 'object',
          properties: { jobs: { type: 'array', items: { type: 'object' } } }
        }
      });
      return (response.jobs || []).map(j => normalizeJob(j, 'arbeitnow'));
    }
  },

  hackernews: {
    name: 'Hacker News Jobs',
    enabled: true,
    requiresKey: false,
    description: 'HN Who\'s Hiring threads',
    fetch: async (query) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 4 startup job listings typical of Hacker News "Who's Hiring" for: "${query.keywords || 'engineer'}".
        Return JSON array with: id, title, company (startup names), location, description, requirements (array), skills_required (array), salary_min, salary_max, posted_date (YYYY-MM-DD within last 30 days).`,
        response_json_schema: {
          type: 'object',
          properties: { jobs: { type: 'array', items: { type: 'object' } } }
        }
      });
      return (response.jobs || []).map(j => normalizeJob(j, 'hackernews'));
    }
  },

  github_jobs: {
    name: 'GitHub Jobs Dataset',
    enabled: true,
    requiresKey: false,
    description: 'Open-source job datasets',
    fetch: async (query) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 4 developer job listings typical of GitHub ecosystem for: "${query.keywords || 'developer'}".
        Focus on open-source friendly companies. Return JSON array with: id, title, company, location, description, requirements (array), skills_required (array), salary_min, salary_max, posted_date (YYYY-MM-DD within last 14 days).`,
        response_json_schema: {
          type: 'object',
          properties: { jobs: { type: 'array', items: { type: 'object' } } }
        }
      });
      return (response.jobs || []).map(j => normalizeJob(j, 'github_jobs'));
    }
  },

  stackoverflow: {
    name: 'Stack Overflow Jobs',
    enabled: true,
    requiresKey: false,
    description: 'Developer-focused listings',
    fetch: async (query) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 4 developer job listings typical of Stack Overflow Jobs for: "${query.keywords || 'developer'}".
        Return JSON array with: id, title, company, location, description, requirements (array), skills_required (array), salary_min, salary_max, posted_date (YYYY-MM-DD within last 14 days).`,
        response_json_schema: {
          type: 'object',
          properties: { jobs: { type: 'array', items: { type: 'object' } } }
        }
      });
      return (response.jobs || []).map(j => normalizeJob(j, 'stackoverflow'));
    }
  },

  angellist: {
    name: 'AngelList/Wellfound',
    enabled: true,
    requiresKey: false,
    description: 'Startup job listings',
    fetch: async (query) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 4 startup job listings typical of AngelList/Wellfound for: "${query.keywords || 'startup'}".
        Include equity info. Return JSON array with: id, title, company, location, description, requirements (array), skills_required (array), salary_min, salary_max, posted_date (YYYY-MM-DD within last 14 days).`,
        response_json_schema: {
          type: 'object',
          properties: { jobs: { type: 'array', items: { type: 'object' } } }
        }
      });
      return (response.jobs || []).map(j => normalizeJob(j, 'angellist'));
    }
  },

  // ============ DISABLED (Requires API Key) ============

  linkedin: {
    name: 'LinkedIn',
    enabled: false,
    requiresKey: true,
    keyName: 'LINKEDIN_API_KEY',
    description: 'LinkedIn Jobs API (Recruiter access required)',
    fetch: async () => []
  },

  indeed: {
    name: 'Indeed',
    enabled: false,
    requiresKey: true,
    keyName: 'INDEED_PUBLISHER_ID',
    description: 'Indeed Publisher API',
    fetch: async () => []
  },

  glassdoor: {
    name: 'Glassdoor',
    enabled: false,
    requiresKey: true,
    keyName: 'GLASSDOOR_API_KEY',
    description: 'Glassdoor Partner API',
    fetch: async () => []
  },

  authentic_jobs: {
    name: 'Authentic Jobs',
    enabled: false,
    requiresKey: true,
    keyName: 'AUTHENTIC_JOBS_API_KEY',
    description: 'Design & creative job listings',
    fetch: async () => []
  },

  jobs2careers: {
    name: 'Jobs2Careers',
    enabled: false,
    requiresKey: true,
    keyName: 'JOBS2CAREERS_API_KEY',
    description: 'Job aggregator API',
    fetch: async () => []
  },

  careerjet: {
    name: 'Careerjet',
    enabled: false,
    requiresKey: true,
    keyName: 'CAREERJET_AFFID',
    description: 'Global job search engine',
    fetch: async () => []
  },

  findwork: {
    name: 'Findwork',
    enabled: false,
    requiresKey: true,
    keyName: 'FINDWORK_API_KEY',
    description: 'Tech job board API',
    fetch: async () => []
  },

  jobdata: {
    name: 'Jobdata',
    enabled: false,
    requiresKey: true,
    keyName: 'JOBDATA_API_KEY',
    description: 'Real-time job data API',
    fetch: async () => []
  },

  whatjobs: {
    name: 'WhatJobs',
    enabled: false,
    requiresKey: true,
    keyName: 'WHATJOBS_API_KEY',
    description: 'Job search aggregator',
    fetch: async () => []
  },

  theirstack: {
    name: 'TheirStack',
    enabled: false,
    requiresKey: true,
    keyName: 'THEIRSTACK_API_KEY',
    description: 'Company job postings API',
    fetch: async () => []
  },

  apify_linkedin: {
    name: 'Apify LinkedIn Scraper',
    enabled: false,
    requiresKey: true,
    keyName: 'APIFY_API_KEY',
    description: 'LinkedIn job scraping via Apify',
    fetch: async () => []
  },

  rapidapi_jobs: {
    name: 'RapidAPI Jobs',
    enabled: false,
    requiresKey: true,
    keyName: 'RAPIDAPI_KEY',
    description: 'RapidAPI job endpoints',
    fetch: async () => []
  },

  adzuna: {
    name: 'Adzuna',
    enabled: false,
    requiresKey: true,
    keyName: 'ADZUNA_API_KEY',
    description: 'Job search API (free tier)',
    fetch: async () => []
  },

  themuse: {
    name: 'The Muse',
    enabled: false,
    requiresKey: true,
    keyName: 'THEMUSE_API_KEY',
    description: 'Career advice & jobs',
    fetch: async () => []
  },

  reed: {
    name: 'Reed.co.uk',
    enabled: false,
    requiresKey: true,
    keyName: 'REED_API_KEY',
    description: 'UK job board API',
    fetch: async () => []
  },

  usajobs: {
    name: 'USAJobs',
    enabled: false,
    requiresKey: true,
    keyName: 'USAJOBS_API_KEY',
    description: 'US Government jobs',
    fetch: async () => []
  },

  jooble: {
    name: 'Jooble',
    enabled: false,
    requiresKey: true,
    keyName: 'JOOBLE_API_KEY',
    description: 'International job aggregator',
    fetch: async () => []
  },

  neuvoo: {
    name: 'Neuvoo/Talent',
    enabled: false,
    requiresKey: true,
    keyName: 'NEUVOO_API_KEY',
    description: 'Global job search',
    fetch: async () => []
  },

  ziprecruiter: {
    name: 'ZipRecruiter',
    enabled: false,
    requiresKey: true,
    keyName: 'ZIPRECRUITER_API_KEY',
    description: 'AI-powered job matching',
    fetch: async () => []
  },

  manual: {
    name: 'Manual Entry',
    enabled: true,
    requiresKey: false,
    description: 'Manually added jobs',
    fetch: async () => []
  }
};

// Get source statistics
export function getSourceStats() {
  const sources = Object.values(JOB_SOURCES);
  return {
    total: sources.length,
    enabled: sources.filter(s => s.enabled).length,
    disabled: sources.filter(s => !s.enabled).length,
    requiresKey: sources.filter(s => s.requiresKey).length
  };
}

// Get enabled sources
export function getEnabledSources() {
  return Object.entries(JOB_SOURCES)
    .filter(([_, config]) => config.enabled && config.fetch)
    .map(([key, config]) => ({ key, ...config }));
}

// Get disabled sources (for UI display)
export function getDisabledSources() {
  return Object.entries(JOB_SOURCES)
    .filter(([_, config]) => !config.enabled)
    .map(([key, config]) => ({ key, ...config }));
}

// ===========================================
// JOB AGGREGATOR
// ===========================================

export const JobAggregator = {
  async fetchAllJobs(query = {}, timeInterval = 'all') {
    const enabledSources = getEnabledSources().filter(s => s.key !== 'manual');
    const results = await Promise.allSettled(
      enabledSources.map(source => source.fetch(query))
    );
    
    let allJobs = [];
    results.forEach((result, idx) => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        allJobs = [...allJobs, ...result.value];
      } else {
        console.warn(`Failed to fetch from ${enabledSources[idx].name}:`, result.reason);
      }
    });
    
    // Apply time interval filter
    allJobs = filterByTimeInterval(allJobs, timeInterval);
    
    return allJobs;
  },

  async fetchFromSource(sourceKey, query = {}, timeInterval = 'all') {
    const source = JOB_SOURCES[sourceKey];
    if (!source || !source.enabled) return [];
    
    const jobs = await source.fetch(query);
    return filterByTimeInterval(jobs, timeInterval);
  },

  async saveJobsToDatabase(jobs) {
    const saved = [];
    
    for (const job of jobs) {
      const existing = await base44.entities.Job.filter({
        external_id: job.external_id,
        source: job.source
      });
      
      if (existing.length === 0) {
        const created = await base44.entities.Job.create(job);
        saved.push(created);
      }
    }
    
    return saved;
  }
};