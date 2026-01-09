import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function SkillsOverview({ matches, resumeSkills = [] }) {
  if (!matches || matches.length === 0) return null;

  // Aggregate matched and missing skills across all matches
  const skillCounts = {};
  const missingSkillCounts = {};

  matches.forEach(match => {
    (match.matched_skills || []).forEach(skill => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
    (match.missing_skills || []).forEach(skill => {
      missingSkillCounts[skill] = (missingSkillCounts[skill] || 0) + 1;
    });
  });

  const topMatchedSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const topMissingSkills = Object.entries(missingSkillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const maxCount = Math.max(
    ...topMatchedSkills.map(([, count]) => count),
    ...topMissingSkills.map(([, count]) => count),
    1
  );

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Top Matched Skills */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Your Strong Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topMatchedSkills.length > 0 ? (
            <div className="space-y-3">
              {topMatchedSkills.map(([skill, count]) => (
                <div key={skill}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700 capitalize">{skill}</span>
                    <span className="text-slate-500">{count} matches</span>
                  </div>
                  <Progress 
                    value={(count / maxCount) * 100} 
                    className="h-2 bg-emerald-100"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No skill matches found yet</p>
          )}
        </CardContent>
      </Card>

      {/* Skills to Develop */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Skills to Develop
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topMissingSkills.length > 0 ? (
            <div className="space-y-3">
              {topMissingSkills.map(([skill, count]) => (
                <div key={skill}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700 capitalize">{skill}</span>
                    <span className="text-slate-500">{count} jobs need this</span>
                  </div>
                  <Progress 
                    value={(count / maxCount) * 100} 
                    className="h-2 bg-amber-100"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Great! No major skill gaps identified</p>
          )}
          
          {topMissingSkills.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Tip:</strong> Consider learning these skills to increase your match rate for more jobs.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}