import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User, FileText, Briefcase, TrendingUp, Trash2, Plus, Clock,
  ChevronRight, Loader2, Upload, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import Logo from '@/components/ui/Logo';
import ParsedResumeView from '@/components/resume/ParsedResumeView';
import { format } from 'date-fns';

export default function Profile() {
  const queryClient = useQueryClient();
  const [selectedResumeId, setSelectedResumeId] = useState(null);

  // Fetch resumes
  const { data: resumes = [], isLoading: resumesLoading } = useQuery({
    queryKey: ['all-resumes'],
    queryFn: () => base44.entities.Resume.list('-created_date')
  });

  // Fetch matches for stats
  const { data: allMatches = [] } = useQuery({
    queryKey: ['all-matches'],
    queryFn: () => base44.entities.JobMatch.list('-created_date')
  });

  // Delete resume
  const deleteResumeMutation = useMutation({
    mutationFn: async (resumeId) => {
      // Delete associated matches first
      const matches = await base44.entities.JobMatch.filter({ resume_id: resumeId });
      for (const match of matches) {
        await base44.entities.JobMatch.delete(match.id);
      }
      await base44.entities.Resume.delete(resumeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-resumes']);
      queryClient.invalidateQueries(['all-matches']);
      setSelectedResumeId(null);
    }
  });

  const selectedResume = resumes.find(r => r.id === selectedResumeId);

  // Stats
  const readyResumes = resumes.filter(r => r.status === 'ready');
  const totalApplications = allMatches.filter(m => m.is_applied).length;
  const averageMatch = allMatches.length > 0
    ? Math.round(allMatches.reduce((sum, m) => sum + m.overall_score, 0) / allMatches.length)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl('Home')}>
            <Logo size="default" />
          </Link>
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="outline" className="rounded-xl">
                Dashboard
              </Button>
            </Link>
            <Link to={createPageUrl('Upload')}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                New Resume
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
            <p className="text-slate-600 mt-1">
              Manage your resumes and track your job search progress
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{readyResumes.length}</p>
                    <p className="text-sm text-slate-500">Resumes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{allMatches.length}</p>
                    <p className="text-sm text-slate-500">Job Matches</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{averageMatch}%</p>
                    <p className="text-sm text-slate-500">Avg Match</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{totalApplications}</p>
                    <p className="text-sm text-slate-500">Applications</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Resume List */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>My Resumes</span>
                    <Link to={createPageUrl('Upload')}>
                      <Button size="sm" variant="outline" className="rounded-lg">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {resumesLoading ? (
                    <div className="py-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                    </div>
                  ) : resumes.length === 0 ? (
                    <div className="py-8 text-center">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 mb-4">No resumes uploaded yet</p>
                      <Link to={createPageUrl('Upload')}>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Resume
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {resumes.map(resume => {
                        const matchCount = allMatches.filter(m => m.resume_id === resume.id).length;
                        
                        return (
                          <div
                            key={resume.id}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                              selectedResumeId === resume.id
                                ? 'border-emerald-300 bg-emerald-50'
                                : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'
                            }`}
                            onClick={() => setSelectedResumeId(resume.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 truncate">
                                  {resume.parsed_data?.name || 'Resume'}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant="secondary"
                                    className={
                                      resume.status === 'ready' ? 'bg-emerald-50 text-emerald-700' :
                                      resume.status === 'error' ? 'bg-red-50 text-red-700' :
                                      'bg-yellow-50 text-yellow-700'
                                    }
                                  >
                                    {resume.status}
                                  </Badge>
                                  {matchCount > 0 && (
                                    <span className="text-xs text-slate-500">
                                      {matchCount} matches
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {format(new Date(resume.created_date), 'MMM d, yyyy')}
                                </p>
                              </div>
                              <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${
                                selectedResumeId === resume.id ? 'rotate-90' : ''
                              }`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Resume Detail */}
            <div className="lg:col-span-2">
              {selectedResume ? (
                <div className="space-y-6">
                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-900">
                      {selectedResume.parsed_data?.name || 'Resume Details'}
                    </h2>
                    <div className="flex items-center gap-2">
                      <Link to={createPageUrl('Dashboard') + `?resume=${selectedResume.id}`}>
                        <Button variant="outline" className="rounded-xl">
                          View Matches
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this resume and all associated job matches. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteResumeMutation.mutate(selectedResume.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Parsed View */}
                  {selectedResume.status === 'ready' ? (
                    <ParsedResumeView parsedData={selectedResume.parsed_data} />
                  ) : selectedResume.status === 'error' ? (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8 text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Processing Failed</h3>
                        <p className="text-slate-600 mb-4">{selectedResume.error_message || 'An error occurred while processing this resume'}</p>
                        <Link to={createPageUrl('Upload')}>
                          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                            Upload New Resume
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-8 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Processing Resume</h3>
                        <p className="text-slate-600">Please wait while we analyze your resume...</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="border-0 shadow-sm h-full min-h-[400px] flex items-center justify-center">
                  <CardContent className="text-center">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Select a Resume</h3>
                    <p className="text-slate-600">
                      Click on a resume from the list to view its details
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}