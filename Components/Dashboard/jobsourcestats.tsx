import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SOURCE_COLORS = {
  linkedin: '#0A66C2',
  indeed: '#2164F3',
  glassdoor: '#0CAA41',
  remote_ok: '#FF6550',
  we_work_remotely: '#47BFA0',
  company_career: '#6366F1',
  manual: '#94A3B8'
};

const SOURCE_LABELS = {
  linkedin: 'LinkedIn',
  indeed: 'Indeed',
  glassdoor: 'Glassdoor',
  remote_ok: 'RemoteOK',
  we_work_remotely: 'We Work Remotely',
  company_career: 'Company Careers',
  manual: 'Manual'
};

export default function JobSourceStats({ jobs }) {
  if (!jobs || jobs.length === 0) return null;

  // Count jobs by source
  const sourceCounts = {};
  jobs.forEach(job => {
    const source = job.source || 'manual';
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  });

  const data = Object.entries(sourceCounts).map(([source, count]) => ({
    name: SOURCE_LABELS[source] || source,
    value: count,
    color: SOURCE_COLORS[source] || '#94A3B8'
  }));

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Jobs by Source</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value) => [`${value} jobs`, 'Count']}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-slate-600">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}