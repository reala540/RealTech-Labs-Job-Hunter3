import React from 'react';
import { Sparkles, ChevronRight, TrendingUp, ThumbsDown, Bookmark, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export function getRecommendedJobs(jobs, matches, preferences = {}) {
  const {
    minMatchScore = 50,
    preferredWorkTypes = [],
    preferredSeniority = [],
    excludeDismissed = true,
    boostSaved = true,
    boostApplied = false
  } = preferences;

  // Create a map of job matches for quick lookup
  const matchMap = new Map();
  matches.forEach(m => matchMap.set(m.job_id, m));

  // Score and filter jobs
  const scoredJobs = jobs
    .map(job => {
      const match = matchMap.get(job.id);
      if (!match) return null;

      // Skip dismissed jobs
      if (excludeDismissed && match.is_dismissed) return null;

      // Base score from matching algorithm
      let recommendationScore = match.overall_score;

      // Apply preference boosts
      if (preferredWorkTypes.length > 0 && preferredWorkTypes.includes(job.work_type)) {
        recommendationScore += 10;
      }
      if (preferredSeniority.length > 0 && preferredSeniority.includes(job.seniority)) {
        recommendationScore += 8;
      }

      // Boost saved jobs (user showed interest)
      if (boostSaved && match.is_saved) {
        recommendationScore += 15;
      }

      // Slight penalty for already applied (show new opportunities)
      if (!boostApplied && match.is_applied) {
        recommendationScore -= 20;
      }

      // Skills match bonus
      if (match.skills_score >= 70) {
        recommendationScore += 5;
      }

      // Experience match bonus
      if (match.experience_score >= 60) {
        recommendationScore += 5;
      }

      return {
        job,
        match,
        recommendationScore: Math.min(100, Math.max(0, recommendationScore)),
        reasons: generateReasons(job, match, preferences)
      };
    })
    .filter(item => item && item.recommendationScore >= minMatchScore)
    .sort((a, b) => b.recommendationScore - a.recommendationScore);

  return scoredJobs;
}

function generateReasons(job, match, preferences) {
  const reasons = [];

  if (match.skills_score >= 70) {
    reasons.push({ type: 'skills', text: `${match.matched_skills?.length || 0} skills match` });
  }
  if (match.experience_score >= 60) {
    reasons.push({ type: 'experience', text: 'Relevant experience' });
  }
  if (preferences.preferredWorkTypes?.includes(job.work_type)) {
    reasons.push({ type: 'preference', text: `${job.work_type} work` });
  }
  if (match.is_saved) {
    reasons.push({ type: 'saved', text: 'You saved this' });
  }

  return reasons.slice(0, 3);
}

export default function RecommendedJobs({ 
  recommendations, 
  onSelectJob, 
  onSaveJob, 
  onDismissJob,
  onViewAll,
  maxDisplay = 5 
}) {
  const topRecommendations = recommendations.slice(0, maxDisplay);

  if (topRecommendations.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">No recommendations yet</h3>
          <p className="text-sm text-slate-500">
            Fetch jobs and upload a resume to get personalized recommendations
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <CardTitle className="text-lg font-semibold">Recommended For You</CardTitle>
          </div>
          <Badge className="bg-white/20 text-white hover:bg-white/30">
            {recommendations.length} matches
          </Badge>
        </div>
        <p className="text-purple-100 text-sm mt-1">
          Based on your resume and preferences
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {topRecommendations.map(({ job, match, recommendationScore, reasons }) => (
            <div
              key={job.id}
              className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
              onClick={() => onSelectJob(job)}
            >
              <div className="flex items-start gap-4">
                {/* Company Logo */}
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {job.company_logo ? (
                    <img src={job.company_logo} alt={job.company} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-slate-400">
                      {job.company?.charAt(0) || 'J'}
                    </span>
                  )}
                </div>

                {/* Job Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors truncate">
                        {job.title}
                      </h4>
                      <p className="text-sm text-slate-500 truncate">{job.company}</p>
                    </div>
                    
                    {/* Match Score */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div className={cn(
                        "text-sm font-bold px-2 py-1 rounded-lg",
                        recommendationScore >= 80 ? "bg-emerald-100 text-emerald-700" :
                        recommendationScore >= 60 ? "bg-blue-100 text-blue-700" :
                        "bg-slate-100 text-slate-600"
                      )}>
                        {Math.round(recommendationScore)}%
                      </div>
                    </div>
                  </div>

                  {/* Match Progress */}
                  <div className="mt-2">
                    <Progress 
                      value={recommendationScore} 
                      className="h-1.5 bg-slate-100"
                    />
                  </div>

                  {/* Reasons */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {reasons.map((reason, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className="text-xs bg-white"
                      >
                        {reason.type === 'skills' && <TrendingUp className="w-3 h-3 mr-1" />}
                        {reason.text}
                      </Badge>
                    ))}
                    {job.work_type && (
                      <Badge variant="outline" className="text-xs bg-white">
                        {job.work_type}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSaveJob(job);
                    }}
                  >
                    <Bookmark className={cn("w-4 h-4", match?.is_saved && "fill-orange-500 text-orange-500")} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismissJob(job, match);
                    }}
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {recommendations.length > maxDisplay && (
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <Button 
              variant="ghost" 
              className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              onClick={onViewAll}
            >
              View all {recommendations.length} recommendations
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
