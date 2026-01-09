import React from 'react';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, Languages, Code } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ParsedResumeView({ parsedData }) {
  if (!parsedData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{parsedData.name || 'Your Name'}</h2>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-300">
                {parsedData.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    {parsedData.email}
                  </span>
                )}
                {parsedData.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    {parsedData.phone}
                  </span>
                )}
                {parsedData.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {parsedData.location}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {parsedData.summary && (
            <p className="mt-4 text-slate-300 leading-relaxed">
              {parsedData.summary}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      {parsedData.skills?.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Code className="w-5 h-5 text-emerald-500" />
              Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {parsedData.skills.map((skill, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Experience */}
      {parsedData.experience?.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="w-5 h-5 text-emerald-500" />
              Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {parsedData.experience.map((exp, i) => (
              <div key={i} className="relative pl-6 border-l-2 border-emerald-200">
                <div className="absolute -left-1.5 top-1 w-3 h-3 bg-emerald-500 rounded-full" />
                <h4 className="font-semibold text-slate-900">{exp.title}</h4>
                <p className="text-emerald-600 font-medium">{exp.company}</p>
                <p className="text-sm text-slate-500 mt-1">
                  {exp.start_date} – {exp.end_date || 'Present'}
                  {exp.location && ` • ${exp.location}`}
                </p>
                {exp.description && (
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Education */}
      {parsedData.education?.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="w-5 h-5 text-emerald-500" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {parsedData.education.map((edu, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{edu.degree}</h4>
                  <p className="text-emerald-600">{edu.institution}</p>
                  <p className="text-sm text-slate-500">
                    {edu.graduation_date}
                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Certifications */}
      {parsedData.certifications?.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-emerald-500" />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {parsedData.certifications.map((cert, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-700">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  {cert}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Languages */}
      {parsedData.languages?.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Languages className="w-5 h-5 text-emerald-500" />
              Languages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {parsedData.languages.map((lang, i) => (
                <Badge key={i} variant="outline" className="border-slate-200">
                  {lang}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
