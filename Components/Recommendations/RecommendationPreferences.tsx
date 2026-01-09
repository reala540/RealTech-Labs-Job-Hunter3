import React from 'react';
import { Settings2, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';

const WORK_TYPES = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' }
];

const SENIORITY_LEVELS = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'executive', label: 'Executive' }
];

export default function RecommendationPreferences({ preferences, onPreferencesChange }) {
  const [localPrefs, setLocalPrefs] = React.useState(preferences);
  const [open, setOpen] = React.useState(false);

  const updateLocalPref = (key, value) => {
    setLocalPrefs(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayPref = (key, value) => {
    setLocalPrefs(prev => {
      const current = prev[key] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const handleSave = () => {
    onPreferencesChange(localPrefs);
    setOpen(false);
  };

  const handleReset = () => {
    const defaults = {
      minMatchScore: 50,
      preferredWorkTypes: [],
      preferredSeniority: [],
      excludeDismissed: true,
      boostSaved: true,
      boostApplied: false
    };
    setLocalPrefs(defaults);
    onPreferencesChange(defaults);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-lg">
          <Sliders className="w-4 h-4 mr-2" />
          Preferences
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-purple-600" />
            Recommendation Preferences
          </SheetTitle>
          <SheetDescription>
            Fine-tune how jobs are recommended to you
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Minimum Match Score */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Minimum Match Score</Label>
              <span className="text-sm font-semibold text-purple-600">
                {localPrefs.minMatchScore}%
              </span>
            </div>
            <Slider
              value={[localPrefs.minMatchScore]}
              min={0}
              max={90}
              step={5}
              onValueChange={([val]) => updateLocalPref('minMatchScore', val)}
              className="[&_[role=slider]]:bg-purple-500"
            />
            <p className="text-xs text-slate-500">
              Only show jobs with at least this match score
            </p>
          </div>

          {/* Preferred Work Types */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Preferred Work Type</Label>
            <div className="space-y-2">
              {WORK_TYPES.map(type => (
                <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={(localPrefs.preferredWorkTypes || []).includes(type.value)}
                    onCheckedChange={() => toggleArrayPref('preferredWorkTypes', type.value)}
                  />
                  <span className="text-sm text-slate-600">{type.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Jobs matching these will be ranked higher
            </p>
          </div>

          {/* Preferred Seniority */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Preferred Seniority</Label>
            <div className="space-y-2">
              {SENIORITY_LEVELS.map(level => (
                <label key={level.value} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={(localPrefs.preferredSeniority || []).includes(level.value)}
                    onCheckedChange={() => toggleArrayPref('preferredSeniority', level.value)}
                  />
                  <span className="text-sm text-slate-600">{level.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Behavior Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Behavior</Label>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={localPrefs.excludeDismissed}
                  onCheckedChange={(checked) => updateLocalPref('excludeDismissed', checked)}
                />
                <span className="text-sm text-slate-600">Hide dismissed jobs</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={localPrefs.boostSaved}
                  onCheckedChange={(checked) => updateLocalPref('boostSaved', checked)}
                />
                <span className="text-sm text-slate-600">Prioritize saved jobs</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={localPrefs.boostApplied}
                  onCheckedChange={(checked) => updateLocalPref('boostApplied', checked)}
                />
                <span className="text-sm text-slate-600">Show applied jobs in recommendations</span>
              </label>
            </div>
          </div>
        </div>

        <SheetFooter className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            Reset
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-purple-600 hover:bg-purple-700">
            Save Preferences
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}