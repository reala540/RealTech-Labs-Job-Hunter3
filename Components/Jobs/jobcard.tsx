import React from 'react';
import { MapPin, Building2, Clock, Briefcase, DollarSign, ExternalLink, Bookmark, BookmarkCheck, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

export default function JobCard({ job, match, onSelect, onSave, isSaved }) {
  const matchScore = match?.overall_score;
  
  return (
    <Card
      className={cn(
        "border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group",
        "bg-white hover:bg-slate-50/50"
      )}
      onClick={() => onSelect?.(job)}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            {job.company_logo ? (
              <img
                src={job.company_logo}
                alt={job.company}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="w-7 h-7 text-slate-400" />
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-slate-600 font-medium mt-0.5">{job.company}</p>
              </div>
              
              {/* Match Score */}
              {matchScore !== undefined && (
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-sm",
                  matchScore >= 80 ? "bg-emerald-100 text-emerald-700" :
                  matchScore >= 60 ? "bg-blue-100 text-blue-700" :
                  matchScore >= 40 ? "bg-yellow-100 text-yellow-700" :
                  "bg-slate-100 text-slate-600"
                )}>
                  <TrendingUp className="w-4 h-4" />
                  {matchScore}%
                </div>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-500">
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </span>
              )}
              {job.work_type && (
                <Badge variant="outline" className={workTypeStyles[job.work_type]}>
                  {job.work_type.charAt(0).toUpperCase() + job.work_type.slice(1)}
                </Badge>
              )}
              {job.seniority && (
                <Badge variant="outline" className="bg-slate-50">
                  {seniorityLabels[job.seniority]}
                </Badge>
              )}
              {job.posted_date && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDistanceToNow(new Date(job.posted_date), { addSuffix: true })}
                </span>
              )}
            </div>

            {/* Salary */}
            {(job.salary_min || job.salary_max) && (
              <div className="flex items-center gap-1 mt-3 text-emerald-600 font-semibold">
                <DollarSign className="w-4 h-4" />
                {job.salary_min && job.salary_max ? (
                  `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                ) : job.salary_min ? (
                  `From $${job.salary_min.toLocaleString()}`
                ) : (
                  `Up to $${job.salary_max.toLocaleString()}`
                )}
                {job.salary_currency && job.salary_currency !== 'USD' && (
                  <span className="text-slate-400 text-sm ml-1">{job.salary_currency}</span>
                )}
              </div>
            )}

            {/* Skills */}
            {job.skills_required?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {job.skills_required.slice(0, 5).map((skill, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      match?.matched_skills?.includes(skill.toLowerCase())
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {skill}
                  </Badge>
                ))}
                {job.skills_required.length > 5 && (
                  <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
                    +{job.skills_required.length - 5}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-xl",
                isSaved ? "text-emerald-600" : "text-slate-400 hover:text-emerald-600"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onSave?.(job);
              }}
            >
              {isSaved ? (
                <BookmarkCheck className="w-5 h-5" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </Button>
            {job.application_url && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-slate-400 hover:text-emerald-600"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(job.application_url, '_blank');
                }}
              >
                <ExternalLink className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}