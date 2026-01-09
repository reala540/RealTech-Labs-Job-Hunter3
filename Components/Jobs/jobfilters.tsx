import React, { useState, useEffect } from 'react';
import { Search, MapPin, Building2, Briefcase, DollarSign, Filter, X, ChevronDown, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { TIME_INTERVALS } from './JobSourceConnector';

const WORK_TYPES = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' }
];

const JOB_TYPES = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'temporary', label: 'Temporary' }
];

const SENIORITY_LEVELS = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'executive', label: 'Executive' }
];

export default function JobFilters({ filters, onFilterChange, companies = [], showTimeFilter = true }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const timeIntervalOptions = Object.entries(TIME_INTERVALS).map(([key, val]) => ({
    value: key,
    label: val.label
  }));

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleArrayFilter = (key, value) => {
    const current = localFilters[key] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const clearFilters = () => {
    const clearedFilters = {
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
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const activeFilterCount = [
    localFilters.keywords,
    localFilters.title,
    localFilters.location,
    ...(localFilters.work_type || []),
    ...(localFilters.job_type || []),
    ...(localFilters.seniority || []),
    ...(localFilters.companies || []),
    localFilters.salary_min > 0 ? 1 : 0,
    localFilters.salary_max < 500000 ? 1 : 0
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Primary Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search jobs, skills, keywords..."
            value={localFilters.keywords || ''}
            onChange={(e) => updateFilter('keywords', e.target.value)}
            className="pl-11 h-12 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
          />
        </div>
        
        <div className="relative w-full md:w-64">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Location"
            value={localFilters.location || ''}
            onChange={(e) => updateFilter('location', e.target.value)}
            className="pl-11 h-12 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
          />
        </div>

        {showTimeFilter && (
          <Select
            value={localFilters.timeInterval || 'all'}
            onValueChange={(value) => updateFilter('timeInterval', value)}
          >
            <SelectTrigger className="w-full md:w-44 h-12 bg-white border-slate-200 rounded-xl">
              <Clock className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Posted date" />
            </SelectTrigger>
            <SelectContent>
              {timeIntervalOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(
            "h-12 px-4 rounded-xl border-slate-200",
            showAdvanced && "bg-emerald-50 border-emerald-200 text-emerald-700"
          )}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-2 bg-emerald-500 text-white text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Advanced Filters</h3>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-slate-500 hover:text-red-500"
              >
                <X className="w-4 h-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Job Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Job Title</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="e.g. Software Engineer"
                  value={localFilters.title || ''}
                  onChange={(e) => updateFilter('title', e.target.value)}
                  className="pl-10 border-slate-200"
                />
              </div>
            </div>

            {/* Work Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Work Type</label>
              <div className="space-y-2">
                {WORK_TYPES.map(type => (
                  <label
                    key={type.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={(localFilters.work_type || []).includes(type.value)}
                      onCheckedChange={() => toggleArrayFilter('work_type', type.value)}
                    />
                    <span className="text-sm text-slate-600">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Job Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Job Type</label>
              <div className="space-y-2">
                {JOB_TYPES.map(type => (
                  <label
                    key={type.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={(localFilters.job_type || []).includes(type.value)}
                      onCheckedChange={() => toggleArrayFilter('job_type', type.value)}
                    />
                    <span className="text-sm text-slate-600">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Seniority */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Seniority Level</label>
              <div className="space-y-2">
                {SENIORITY_LEVELS.map(level => (
                  <label
                    key={level.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={(localFilters.seniority || []).includes(level.value)}
                      onCheckedChange={() => toggleArrayFilter('seniority', level.value)}
                    />
                    <span className="text-sm text-slate-600">{level.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Salary Range */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Salary Range (USD)</label>
              <span className="text-sm text-emerald-600 font-medium">
                ${(localFilters.salary_min || 0).toLocaleString()} - ${(localFilters.salary_max || 500000).toLocaleString()}
              </span>
            </div>
            <div className="px-2">
              <Slider
                value={[localFilters.salary_min || 0, localFilters.salary_max || 500000]}
                min={0}
                max={500000}
                step={5000}
                onValueChange={([min, max]) => {
                  updateFilter('salary_min', min);
                  updateFilter('salary_max', max);
                }}
                className="[&_[role=slider]]:bg-emerald-500"
              />
            </div>
          </div>

          {/* Companies */}
          {companies.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Companies</label>
              <div className="flex flex-wrap gap-2">
                {companies.slice(0, 10).map(company => (
                  <Badge
                    key={company}
                    variant="outline"
                    className={cn(
                      "cursor-pointer transition-colors",
                      (localFilters.companies || []).includes(company)
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : "hover:bg-slate-50"
                    )}
                    onClick={() => toggleArrayFilter('companies', company)}
                  >
                    <Building2 className="w-3 h-3 mr-1" />
                    {company}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && !showAdvanced && (
        <div className="flex flex-wrap gap-2">
          {localFilters.keywords && (
            <Badge variant="secondary" className="bg-slate-100">
              "{localFilters.keywords}"
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => updateFilter('keywords', '')}
              />
            </Badge>
          )}
          {localFilters.location && (
            <Badge variant="secondary" className="bg-slate-100">
              <MapPin className="w-3 h-3 mr-1" />
              {localFilters.location}
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => updateFilter('location', '')}
              />
            </Badge>
          )}
          {(localFilters.work_type || []).map(type => (
            <Badge key={type} variant="secondary" className="bg-emerald-50 text-emerald-700">
              {WORK_TYPES.find(t => t.value === type)?.label}
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => toggleArrayFilter('work_type', type)}
              />
            </Badge>
          ))}
          {(localFilters.seniority || []).map(level => (
            <Badge key={level} variant="secondary" className="bg-blue-50 text-blue-700">
              {SENIORITY_LEVELS.find(l => l.value === level)?.label}
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => toggleArrayFilter('seniority', level)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}