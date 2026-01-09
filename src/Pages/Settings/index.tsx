import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Settings as SettingsIcon, Trash2, FileText, Briefcase, History,
  AlertTriangle, Check, Loader2, ArrowLeft, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import Logo from '@/components/ui/Logo';

export default function Settings() {
  const queryClient = useQueryClient();
  const [deletingResumes, setDeletingResumes] = useState(false);
  const [deletingJobs, setDeletingJobs] = useState(false);
  const [deletingMatches, setDeletingMatches] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  // Fetch counts
  const { data: resumes = [] } = useQuery({
    queryKey: ['all-resumes'],
    queryFn: () => base44.entities.Resume.list()
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['all-jobs'],
    queryFn: () => base44.entities.Job.list()
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['all-matches'],
    queryFn: () => base44.entities.JobMatch.list()
  });

  // Delete all resumes
  const deleteResumesMutation = useMutation({
    mutationFn: async () => {
      setDeletingResumes(true);
      for (const resume of resumes) {
        await base44.entities.Resume.delete(resume.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-resumes']);
      queryClient.invalidateQueries(['resumes']);
      toast.success('All resumes deleted');
      setDeletingResumes(false);
    },
    onError: () => {
      toast.error('Failed to delete resumes');
      setDeletingResumes(false);
    }
  });

  // Delete all jobs
  const deleteJobsMutation = useMutation({
    mutationFn: async () => {
      setDeletingJobs(true);
      for (const job of jobs) {
        await base44.entities.Job.delete(job.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-jobs']);
      queryClient.invalidateQueries(['jobs']);
      toast.success('All jobs deleted');
      setDeletingJobs(false);
    },
    onError: () => {
      toast.error('Failed to delete jobs');
      setDeletingJobs(false);
    }
  });

  // Delete all matches
  const deleteMatchesMutation = useMutation({
    mutationFn: async () => {
      setDeletingMatches(true);
      for (const match of matches) {
        await base44.entities.JobMatch.delete(match.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-matches']);
      queryClient.invalidateQueries(['matches']);
      toast.success('All match history deleted');
      setDeletingMatches(false);
    },
    onError: () => {
      toast.error('Failed to delete matches');
      setDeletingMatches(false);
    }
  });

  // Delete everything
  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      setDeletingAll(true);
      // Delete matches first (depends on resumes and jobs)
      for (const match of matches) {
        await base44.entities.JobMatch.delete(match.id);
      }
      // Delete resumes
      for (const resume of resumes) {
        await base44.entities.Resume.delete(resume.id);
      }
      // Delete jobs
      for (const job of jobs) {
        await base44.entities.Job.delete(job.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('All data deleted successfully');
      setDeletingAll(false);
    },
    onError: () => {
      toast.error('Failed to delete all data');
      setDeletingAll(false);
    }
  });

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
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <SettingsIcon className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-600">Manage your data and preferences</p>
              </div>
            </div>
          </div>

          {/* Data Summary */}
          <Card className="border-0 shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Your Data Summary</CardTitle>
              <CardDescription>Overview of stored data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900">{resumes.length}</p>
                  <p className="text-sm text-slate-500">Resumes</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <Briefcase className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900">{jobs.length}</p>
                  <p className="text-sm text-slate-500">Jobs</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <History className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900">{matches.length}</p>
                  <p className="text-sm text-slate-500">Matches</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delete Options */}
          <Card className="border-0 shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                Data Management
              </CardTitle>
              <CardDescription>Delete your stored data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Delete Resumes */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-slate-900">Delete All Resumes</p>
                    <p className="text-sm text-slate-500">{resumes.length} resume(s) stored</p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      disabled={resumes.length === 0 || deletingResumes}
                    >
                      {deletingResumes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete All Resumes?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all {resumes.length} resume(s). This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => deleteResumesMutation.mutate()}
                      >
                        Delete All Resumes
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Delete Jobs */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-slate-900">Delete All Jobs</p>
                    <p className="text-sm text-slate-500">{jobs.length} job(s) stored</p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      disabled={jobs.length === 0 || deletingJobs}
                    >
                      {deletingJobs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete All Jobs?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all {jobs.length} job(s). This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => deleteJobsMutation.mutate()}
                      >
                        Delete All Jobs
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Delete Match History */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-slate-900">Delete Match History</p>
                    <p className="text-sm text-slate-500">{matches.length} match record(s)</p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      disabled={matches.length === 0 || deletingMatches}
                    >
                      {deletingMatches ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Match History?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all {matches.length} match record(s). This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => deleteMatchesMutation.mutate()}
                      >
                        Delete Match History
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 shadow-sm">
            <CardHeader className="border-b border-red-100 bg-red-50/50">
              <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-red-600">
                Irreversible actions
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                <div>
                  <p className="font-medium text-red-900">Delete All Data</p>
                  <p className="text-sm text-red-600">
                    Permanently delete all resumes, jobs, and match history
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive"
                      disabled={deletingAll || (resumes.length === 0 && jobs.length === 0 && matches.length === 0)}
                    >
                      {deletingAll ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Delete Everything
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        Delete All Data?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete:
                        <ul className="mt-2 space-y-1 list-disc list-inside">
                          <li>{resumes.length} resume(s)</li>
                          <li>{jobs.length} job(s)</li>
                          <li>{matches.length} match record(s)</li>
                        </ul>
                        <p className="mt-3 font-medium text-red-600">
                          This action cannot be undone.
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => deleteAllMutation.mutate()}
                      >
                        Yes, Delete Everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Note */}
          <div className="mt-6 p-4 bg-emerald-50 rounded-xl flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-medium text-emerald-900">Your Privacy Matters</p>
              <p className="text-sm text-emerald-700">
                All your data is stored securely and is only accessible to you. 
                Deleting data is permanent and cannot be recovered.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
