import React from 'react';
import { 
  MapPin, Building2, Clock, Briefcase, DollarSign, ExternalLink, 
  Bookmark, BookmarkCheck, TrendingUp, CheckCircle, XCircle, 
  ArrowLeft, Share2, Calendar, Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

const workTypeStyles = {
  remote: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  hybrid: 'bg-blue-50 text-blue-700 border-blue-200',
  onsite: 'bg-orange-50 text-orange-700 border-orange-200'
};

const seniorityLabels = {
  entry: 'Entry Level',
  mid: 'Mid Level',
  senior: 'Senior',
  lead: 'Lead',
  executive: 'Executive'
};

const jobTypeLabels = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
  temporary: 'Temporary'
};

export default function JobDetail({ job, match, onBack, onSave, isSaved, onApply }) {
  if (!job) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "rounded-xl",
              isSaved ? "text-emerald-600 border-emerald-200" : ""
            )}
            onClick={() => onSave?.(job)}
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={() => {
              navigator.share?.({
                title: job.title,
                text: `${job.title} at ${job.company}`,
                url: job.application_url
              });
            }}
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Card */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            {/* Company Logo */}
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              {job.company_logo ? (
                <img
                  src={job.company_logo}
                  alt={job.company}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-10 h-10 text-slate-400" />
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
              <p className="text-lg text-emerald-600 font-medium mt-1">{job.company}</p>
              
              <div className="flex flex-wrap items-center gap-3 mt-4">
                {job.location && (
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                )}
                {job.work_type && (
                  <Badge variant="outline" className={workTypeStyles[job.work_type]}>
                    {job.work_type.charAt(0).toUpperCase() + job.work_type.slice(1)}
                  </Badge>
                )}
                {job.job_type && (
                  <Badge variant="outline" className="bg-slate-50">
                    <Briefcase className="w-3 h-3 mr-1" />
                    {jobTypeLabels[job.job_type]}
                  </Badge>
                )}
                {job.seniority && (
                  <Badge variant="outline" className="bg-slate-50">
                    <Users className="w-3 h-3 mr-1" />
                    {seniorityLabels[job.seniority]}
                  </Badge>
                )}
              </div>

              {/* Salary */}
              {(job.salary_min || job.salary_max) && (
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex items-center gap-1 text-lg font-semibold text-emerald-600">
                    <DollarSign className="w-5 h-5" />
                    {job.salary_min && job.salary_max ? (
                      `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
                    ) : job.salary_min ? (
                      `From ${job.salary_min.toLocaleString()}`
                    ) : (
                      `Up to ${job.salary_max.toLocaleString()}`
                    )}
                  </div>
                  <span className="text-slate-400">/ year</span>
                </div>
              )}

              {job.posted_date && (
                <p className="text-sm text-slate-500 mt-3 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Posted {formatDistanceToNow(new Date(job.posted_date), { addSuffix: true })}
                </p>
              )}
            </div>

            {/* Apply Button */}
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 px-8"
                onClick={() => {
                  if (job.application_url) {
                    window.open(job.application_url, '_blank');
                  }
                  onApply?.(job);
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Apply Now
              </Button>
              <p className="text-xs text-slate-500 text-center">
                Opens in new tab
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match Analysis */}
      {match && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Match Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Score */}
            <div className="text-center pb-6 border-b">
              <div className={cn(
                "inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold",
                match.overall_score >= 80 ? "bg-emerald-100 text-emerald-700" :
                match.overall_score >= 60 ? "bg-blue-100 text-blue-700" :
                match.overall_score >= 40 ? "bg-yellow-100 text-yellow-700" :
                "bg-slate-100 text-slate-600"
              )}>
                {match.overall_score}%
              </div>
              <p className="text-slate-600 mt-2">Overall Match Score</p>
            </div>

            {/* Score Breakdown */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Skills Match</span>
                  <span className="font-medium">{match.skills_score}%</span>
                </div>
                <Progress value={match.skills_score} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Experience Match</span>
                  <span className="font-medium">{match.experience_score}%</span>
                </div>
                <Progress value={match.experience_score} className="h-2" />
              </div>
            </div>

            {/* Matched Skills */}
            {match.matched_skills?.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Matching Skills ({match.matched_skills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {match.matched_skills.map((skill, i) => (
                    <Badge key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {match.missing_skills?.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Skills to Develop ({match.missing_skills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {match.missing_skills.map((skill, i) => (
                    <Badge key={i} variant="outline" className="border-red-200 text-red-600">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            {match.recommendation && (
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-medium text-slate-900 mb-2">AI Recommendation</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{match.recommendation}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Job Description */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap text-slate-600 leading-relaxed">
              {job.description}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      {job.requirements?.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-slate-600">{req}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      {job.benefits?.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Benefits & Perks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {job.benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {benefit}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom Apply CTA */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">
            Ready to apply for this position?
          </h3>
          <p className="text-slate-300 mb-6">
            Take the next step in your career journey
          </p>
          <Button
            size="lg"
            className="bg-white text-slate-900 hover:bg-slate-100 font-semibold rounded-xl px-8"
            onClick={() => {
              if (job.application_url) {
                window.open(job.application_url, '_blank');
              }
              onApply?.(job);
            }}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Apply on {job.source?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Company Site'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}