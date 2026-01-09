import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/Logo';
import ResumeUploader from '@/components/resume/ResumeUploader';
import ResumeProgress from '@/components/resume/ResumeProgress';
import ParsedResumeView from '@/components/resume/ParsedResumeView';

export default function Upload() {
  const navigate = useNavigate();
  const [resumeId, setResumeId] = useState(null);
  const [pollingEnabled, setPollingEnabled] = useState(false);

  const { data: resume, isLoading } = useQuery({
    queryKey: ['resume', resumeId],
    queryFn: async () => {
      if (!resumeId) return null;
      const resumes = await base44.entities.Resume.filter({ id: resumeId });
      return resumes[0] || null;
    },
    enabled: !!resumeId,
    refetchInterval: pollingEnabled ? 2000 : false
  });

  useEffect(() => {
    if (resume) {
      if (resume.status === 'ready' || resume.status === 'error') {
        setPollingEnabled(false);
      } else {
        setPollingEnabled(true);
      }
    }
  }, [resume?.status]);

  const handleResumeUploaded = (id) => {
    setResumeId(id);
    setPollingEnabled(true);
  };

  const handleContinue = () => {
    navigate(createPageUrl('Dashboard') + `?resume=${resumeId}`);
  };

  const handleUploadAnother = () => {
    setResumeId(null);
    setPollingEnabled(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl('Home')}>
            <Logo size="default" />
          </Link>
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
              Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Back Link */}
          <Link
            to={createPageUrl('Home')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              {!resumeId ? 'Upload Your Resume' : 
               resume?.status === 'ready' ? 'Resume Analyzed' : 
               'Analyzing Resume'}
            </h1>
            <p className="mt-3 text-lg text-slate-600 max-w-lg mx-auto">
              {!resumeId ? 'Upload your resume or paste text to get personalized job matches' :
               resume?.status === 'ready' ? 'Your resume has been processed successfully' :
               'Please wait while we analyze your resume'}
            </p>
          </div>

          {/* Content */}
          {!resumeId ? (
            <ResumeUploader onResumeUploaded={handleResumeUploaded} />
          ) : resume?.status === 'ready' ? (
            <div className="space-y-8">
              {/* Success Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-emerald-800">Resume Processed Successfully</h3>
                  <p className="text-sm text-emerald-600 mt-0.5">
                    We've extracted your skills, experience, and qualifications
                  </p>
                </div>
                <Button
                  onClick={handleContinue}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  Find Matches
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Parsed Resume */}
              <ParsedResumeView parsedData={resume.parsed_data} />

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={handleUploadAnother}
                  className="rounded-xl"
                >
                  Upload Different Resume
                </Button>
                <Button
                  onClick={handleContinue}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 px-8"
                >
                  Continue to Job Matches
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-10">
              <ResumeProgress status={resume?.status} error={resume?.error_message} />
              
              {resume?.status === 'error' && (
                <div className="mt-8 text-center">
                  <Button
                    onClick={handleUploadAnother}
                    variant="outline"
                    className="rounded-xl"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
