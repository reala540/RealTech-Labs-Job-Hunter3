import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MatchScoreChart({ matches }) {
  if (!matches || matches.length === 0) return null;

  // Group matches by score ranges
  const scoreRanges = [
    { range: '90-100', min: 90, max: 100, count: 0, color: '#10b981' },
    { range: '70-89', min: 70, max: 89, count: 0, color: '#3b82f6' },
    { range: '50-69', min: 50, max: 69, count: 0, color: '#f59e0b' },
    { range: '30-49', min: 30, max: 49, count: 0, color: '#f97316' },
    { range: '0-29', min: 0, max: 29, count: 0, color: '#ef4444' }
  ];

  matches.forEach(match => {
    const score = match.overall_score;
    const range = scoreRanges.find(r => score >= r.min && score <= r.max);
    if (range) range.count++;
  });

  const data = scoreRanges.filter(r => r.count > 0);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Match Score Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis 
                type="category" 
                dataKey="range" 
                stroke="#94a3b8" 
                fontSize={12}
                width={60}
              />
              <Tooltip 
                contentStyle={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value) => [`${value} jobs`, 'Count']}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}