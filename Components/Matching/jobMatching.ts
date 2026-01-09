// AI Matching Service - Computes match scores between resumes and jobs
import { base44 } from '@/api/base44Client';

// Calculate cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  if (!vecA?.length || !vecB?.length) return 0;
  
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * (vecB[i] || 0), 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

// Common stop words to filter out
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 
  'one', 'our', 'out', 'has', 'have', 'been', 'will', 'with', 'this', 'that', 'from', 
  'they', 'would', 'there', 'their', 'what', 'about', 'which', 'when', 'make', 'like', 
  'time', 'just', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 
  'could', 'them', 'than', 'then', 'look', 'only', 'come', 'over', 'such', 'also', 
  'back', 'after', 'work', 'first', 'well', 'being', 'working', 'must', 'should', 
  'able', 'experience', 'required', 'preferred', 'including', 'using', 'within',
  'strong', 'excellent', 'proven', 'demonstrate', 'demonstrated', 'ability', 'abilities',
  'responsible', 'responsibilities', 'looking', 'seeking', 'join', 'team', 'company',
  'role', 'position', 'opportunity', 'opportunities', 'years', 'minimum', 'plus',
  'equivalent', 'related', 'field', 'degree', 'bachelor', 'master', 'other'
]);

// Technical terms to preserve (don't filter these)
const TECH_TERMS = new Set([
  'api', 'aws', 'css', 'sql', 'git', 'ios', 'vue', 'php', 'c++', 'c#', 'go', 'ai', 
  'ml', 'ui', 'ux', 'qa', 'ci', 'cd', 'gcp', 'seo', 'crm', 'erp', 'tcp', 'ip', 'dns',
  'ssl', 'tls', 'jwt', 'oauth', 'rest', 'soap', 'json', 'xml', 'html', 'dom', 'npm',
  'yarn', 'pip', 'mvn', 'maven', 'gradle', 'webpack', 'babel', 'sass', 'less'
]);

// Extract keywords from text with improved accuracy
function extractKeywords(text) {
  if (!text) return [];
  
  // Preserve compound technical terms
  let processedText = text.toLowerCase()
    .replace(/\bnode\.js\b/g, 'nodejs')
    .replace(/\breact\.js\b/g, 'reactjs')
    .replace(/\bvue\.js\b/g, 'vuejs')
    .replace(/\bnext\.js\b/g, 'nextjs')
    .replace(/\bexpress\.js\b/g, 'expressjs')
    .replace(/\bangular\.js\b/g, 'angularjs')
    .replace(/\bd3\.js\b/g, 'd3js')
    .replace(/\bthree\.js\b/g, 'threejs')
    .replace(/\bc\+\+/g, 'cplusplus')
    .replace(/\bc#/g, 'csharp')
    .replace(/\.net/g, 'dotnet')
    .replace(/\bci\/cd\b/g, 'cicd')
    .replace(/\bui\/ux\b/g, 'uiux')
    .replace(/\bdevops\b/g, 'devops')
    .replace(/\bmachine learning\b/g, 'machinelearning')
    .replace(/\bdeep learning\b/g, 'deeplearning')
    .replace(/\bdata science\b/g, 'datascience')
    .replace(/\bfull stack\b/g, 'fullstack')
    .replace(/\bfront end\b/g, 'frontend')
    .replace(/\bback end\b/g, 'backend');
  
  return processedText
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1)
    .filter(word => TECH_TERMS.has(word) || (word.length > 2 && !STOP_WORDS.has(word)));
}

// Comprehensive skill aliases for technology variations
const SKILL_ALIASES = {
  'javascript': ['js', 'ecmascript', 'es6', 'es2015', 'es2016', 'es2017', 'es2018', 'es2019', 'es2020', 'es2021', 'es2022', 'es2023', 'vanilla js', 'vanilla javascript'],
  'typescript': ['ts', 'type script'],
  'react': ['reactjs', 'react.js', 'react js', 'react native', 'reactnative'],
  'vue': ['vuejs', 'vue.js', 'vue js', 'vue 2', 'vue 3', 'vuex', 'nuxt', 'nuxtjs'],
  'angular': ['angularjs', 'angular.js', 'angular js', 'angular 2', 'angular 4', 'angular 8', 'angular 12', 'angular 14', 'angular 15', 'angular 16', 'angular 17'],
  'node': ['nodejs', 'node.js', 'node js'],
  'express': ['expressjs', 'express.js', 'express js'],
  'next': ['nextjs', 'next.js', 'next js'],
  'python': ['py', 'python2', 'python3', 'python 2', 'python 3'],
  'java': ['java se', 'java ee', 'j2ee', 'j2se', 'jdk', 'jre', 'openjdk'],
  'spring': ['spring boot', 'springboot', 'spring framework', 'spring mvc', 'spring cloud'],
  'postgresql': ['postgres', 'psql', 'pg', 'postgre'],
  'mysql': ['my sql', 'mariadb', 'maria db'],
  'mongodb': ['mongo', 'mongo db', 'mongoose'],
  'redis': ['redis cache', 'redis db'],
  'elasticsearch': ['elastic search', 'elastic', 'es', 'elk'],
  'kubernetes': ['k8s', 'kube', 'k8'],
  'amazon web services': ['aws', 'amazon aws'],
  'google cloud platform': ['gcp', 'google cloud', 'gcloud'],
  'microsoft azure': ['azure', 'azure cloud', 'ms azure'],
  'machine learning': ['ml', 'machinelearning'],
  'deep learning': ['dl', 'deeplearning'],
  'artificial intelligence': ['ai'],
  'natural language processing': ['nlp'],
  'computer vision': ['cv', 'image recognition'],
  'data science': ['datascience', 'data analytics'],
  'continuous integration': ['ci'],
  'continuous deployment': ['cd', 'continuous delivery'],
  'ci/cd': ['cicd', 'ci cd', 'ci-cd'],
  'docker': ['containerization', 'containers', 'docker compose', 'dockerfile'],
  'terraform': ['tf', 'infrastructure as code', 'iac'],
  'ansible': ['ansible playbook'],
  'rest': ['restful', 'rest api', 'restful api', 'rest apis'],
  'graphql': ['gql', 'graph ql'],
  'sql': ['structured query language', 'sql server', 'mssql', 'tsql', 't-sql'],
  'nosql': ['no sql', 'non-relational', 'non relational'],
  'c++': ['cpp', 'cplusplus', 'c plus plus'],
  'c#': ['csharp', 'c sharp', 'c-sharp'],
  '.net': ['dotnet', 'dot net', '.net core', 'dotnet core', 'asp.net', 'aspnet'],
  'ruby': ['ruby on rails', 'rails', 'ror'],
  'php': ['laravel', 'symfony', 'wordpress', 'drupal'],
  'go': ['golang', 'go lang'],
  'rust': ['rustlang', 'rust lang'],
  'swift': ['swiftui', 'swift ui', 'ios development'],
  'kotlin': ['android development', 'kotlin android'],
  'flutter': ['dart', 'flutter sdk'],
  'html': ['html5', 'html 5'],
  'css': ['css3', 'css 3', 'scss', 'sass', 'less', 'stylus', 'tailwind', 'tailwindcss', 'bootstrap'],
  'git': ['github', 'gitlab', 'bitbucket', 'version control', 'source control'],
  'agile': ['scrum', 'kanban', 'sprint', 'jira', 'agile methodology'],
  'linux': ['unix', 'ubuntu', 'centos', 'debian', 'redhat', 'rhel', 'bash', 'shell'],
  'windows': ['windows server', 'powershell'],
  'figma': ['sketch', 'adobe xd', 'invision'],
  'photoshop': ['adobe photoshop', 'ps'],
  'illustrator': ['adobe illustrator', 'ai'],
  'pandas': ['numpy', 'scipy', 'matplotlib', 'seaborn'],
  'tensorflow': ['tf', 'keras', 'pytorch', 'torch'],
  'spark': ['apache spark', 'pyspark', 'spark sql'],
  'hadoop': ['hdfs', 'mapreduce', 'hive', 'pig'],
  'kafka': ['apache kafka', 'kafka streams'],
  'rabbitmq': ['rabbit mq', 'message queue', 'amqp'],
  'jenkins': ['jenkins ci', 'jenkins pipeline'],
  'gitlab ci': ['gitlab-ci', 'gitlab pipeline'],
  'github actions': ['gh actions'],
  'aws lambda': ['lambda', 'serverless'],
  'dynamodb': ['dynamo db', 'dynamo'],
  's3': ['aws s3', 'amazon s3', 'simple storage'],
  'ec2': ['aws ec2', 'amazon ec2'],
  'cloudformation': ['cloud formation', 'cfn'],
};

// Normalize skill for comparison
function normalizeSkill(skill) {
  return skill.toLowerCase().trim()
    .replace(/[.\-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Build reverse lookup map for faster alias matching
const ALIAS_LOOKUP = new Map();
for (const [main, aliases] of Object.entries(SKILL_ALIASES)) {
  const normalizedMain = normalizeSkill(main);
  ALIAS_LOOKUP.set(normalizedMain, normalizedMain);
  for (const alias of aliases) {
    ALIAS_LOOKUP.set(normalizeSkill(alias), normalizedMain);
  }
}

// Get canonical skill name
function getCanonicalSkill(skill) {
  const normalized = normalizeSkill(skill);
  return ALIAS_LOOKUP.get(normalized) || normalized;
}

// Check if two skills match (exact or alias)
function skillsMatch(skill1, skill2) {
  const norm1 = normalizeSkill(skill1);
  const norm2 = normalizeSkill(skill2);
  
  // Exact match
  if (norm1 === norm2) return true;
  
  // Canonical match (both map to same base skill)
  const canonical1 = getCanonicalSkill(skill1);
  const canonical2 = getCanonicalSkill(skill2);
  if (canonical1 === canonical2) return true;
  
  // Check if one contains the other (for compound skills like "React Native" matching "React")
  // Only if the contained skill is at least 4 chars to avoid false positives
  if (norm1.length >= 4 && norm2.includes(norm1)) return true;
  if (norm2.length >= 4 && norm1.includes(norm2)) return true;
  
  // Check if canonical versions contain each other
  if (canonical1.length >= 4 && canonical2.includes(canonical1)) return true;
  if (canonical2.length >= 4 && canonical1.includes(canonical2)) return true;
  
  return false;
}

// Calculate skill match - ENHANCED PRECISION MODE
function calculateSkillMatch(resumeSkills, jobSkills) {
  if (!resumeSkills?.length || !jobSkills?.length) {
    return { score: 0, matched: [], missing: jobSkills || [] };
  }
  
  const matched = [];
  const missing = [];
  
  // Weight skills by importance (required skills at top are more important)
  const skillWeights = jobSkills.map((_, idx) => Math.max(0.5, 1 - idx * 0.05));
  let weightedMatches = 0;
  let totalWeight = skillWeights.reduce((a, b) => a + b, 0);
  
  jobSkills.forEach((skill, idx) => {
    const isMatch = resumeSkills.some(rs => skillsMatch(rs, skill));
    
    if (isMatch) {
      matched.push(skill);
      weightedMatches += skillWeights[idx];
    } else {
      missing.push(skill);
    }
  });
  
  // Score based on weighted matches
  const score = totalWeight > 0 
    ? Math.round((weightedMatches / totalWeight) * 100)
    : 0;
    
  return { score, matched, missing };
}

// Levenshtein distance for fuzzy matching
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  
  return dp[m][n];
}

// Job title similarity patterns
const SIMILAR_TITLES = {
  'software engineer': ['developer', 'programmer', 'coder', 'software developer', 'swe', 'sde'],
  'frontend': ['front end', 'front-end', 'ui', 'client side', 'web developer'],
  'backend': ['back end', 'back-end', 'server side', 'api developer'],
  'fullstack': ['full stack', 'full-stack'],
  'devops': ['sre', 'site reliability', 'platform engineer', 'infrastructure'],
  'data scientist': ['data analyst', 'ml engineer', 'machine learning engineer'],
  'product manager': ['pm', 'product owner', 'po'],
  'designer': ['ux', 'ui', 'ux/ui', 'ui/ux', 'product designer'],
  'senior': ['sr', 'sr.', 'lead', 'principal', 'staff'],
  'junior': ['jr', 'jr.', 'entry level', 'associate'],
};

// Check if job titles are similar
function titlesAreSimilar(title1, title2) {
  const norm1 = title1.toLowerCase().trim();
  const norm2 = title2.toLowerCase().trim();
  
  if (norm1 === norm2) return 1;
  
  // Check direct contains
  if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.9;
  
  // Check word overlap
  const words1 = norm1.split(/\s+/).filter(w => w.length > 2);
  const words2 = norm2.split(/\s+/).filter(w => w.length > 2);
  const commonWords = words1.filter(w => words2.includes(w));
  
  // Check for similar title patterns
  let patternMatch = false;
  for (const [main, alts] of Object.entries(SIMILAR_TITLES)) {
    const allVariants = [main, ...alts];
    const has1 = allVariants.some(v => norm1.includes(v));
    const has2 = allVariants.some(v => norm2.includes(v));
    if (has1 && has2) {
      patternMatch = true;
      break;
    }
  }
  
  if (patternMatch) return 0.8;
  if (commonWords.length >= 2) return 0.7;
  if (commonWords.length === 1 && commonWords[0].length > 4) return 0.5;
  
  return 0;
}

// Calculate years of experience from resume
function calculateYearsExperience(experiences) {
  if (!experiences?.length) return 0;
  
  let totalMonths = 0;
  experiences.forEach(exp => {
    const start = exp.start_date ? new Date(exp.start_date) : null;
    const end = exp.end_date && exp.end_date.toLowerCase() !== 'present' 
      ? new Date(exp.end_date) 
      : new Date();
    
    if (start && !isNaN(start.getTime())) {
      const months = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
      totalMonths += months;
    }
  });
  
  return Math.round(totalMonths / 12 * 10) / 10;
}

// Calculate experience relevance - ENHANCED PRECISION MODE
function calculateExperienceMatch(resumeExperience, jobTitle, jobDescription) {
  if (!resumeExperience?.length) return { score: 0, matches: [], yearsExperience: 0 };
  
  const jobKeywords = extractKeywords(`${jobTitle} ${jobDescription}`);
  const matches = [];
  let bestTitleSimilarity = 0;
  let totalKeywordRelevance = 0;
  
  resumeExperience.forEach((exp, idx) => {
    const expTitle = exp.title || '';
    const expText = `${exp.title || ''} ${exp.company || ''} ${exp.description || ''}`;
    const expKeywords = extractKeywords(expText);
    
    // Check title similarity
    const titleSim = titlesAreSimilar(expTitle, jobTitle);
    bestTitleSimilarity = Math.max(bestTitleSimilarity, titleSim);
    
    // Calculate keyword relevance
    const overlap = expKeywords.filter(k => jobKeywords.includes(k));
    const relevanceScore = jobKeywords.length > 0 
      ? (overlap.length / jobKeywords.length) * 100 
      : 0;
    
    // Weight recent experience higher
    const recencyWeight = Math.max(0.5, 1 - idx * 0.1);
    totalKeywordRelevance += relevanceScore * recencyWeight;
    
    if (relevanceScore > 10 || titleSim > 0.5) {
      matches.push({
        job_requirement: jobTitle,
        resume_experience: `${exp.title} at ${exp.company}`,
        relevance: titleSim > 0.7 ? 'High' : titleSim > 0.4 || relevanceScore > 30 ? 'Medium' : 'Low'
      });
    }
  });
  
  const yearsExperience = calculateYearsExperience(resumeExperience);
  
  // Calculate final score - title match is crucial
  const avgKeywordRelevance = totalKeywordRelevance / resumeExperience.length;
  let score = Math.round(
    bestTitleSimilarity * 60 + // 60% weight on title match
    Math.min(40, avgKeywordRelevance * 0.4) // 40% weight on keywords, capped
  );
  
  // Boost for significant experience
  if (yearsExperience >= 5 && bestTitleSimilarity > 0.5) score = Math.min(100, score + 10);
  if (yearsExperience >= 3 && bestTitleSimilarity > 0.5) score = Math.min(100, score + 5);
  
  return { score: Math.min(100, score), matches, yearsExperience };
}

// Main matching function
export async function calculateJobMatch(resume, job) {
  const parsedData = resume.parsed_data || {};
  
  // Calculate skill match
  const skillMatch = calculateSkillMatch(
    parsedData.skills || [],
    job.skills_required || []
  );
  
  // Calculate experience match
  const experienceMatch = calculateExperienceMatch(
    parsedData.experience || [],
    job.title,
    job.description || ''
  );
  
  // Calculate embedding similarity (simplified)
  const embeddingSimilarity = cosineSimilarity(
    resume.embeddings || [],
    job.embeddings || []
  );
  
  // STRICT: Calculate keyword matches - exact only
  const resumeText = `${parsedData.summary || ''} ${(parsedData.skills || []).join(' ')} ${(parsedData.experience || []).map(e => e.description || '').join(' ')}`;
  const resumeKeywords = extractKeywords(resumeText);
  const jobKeywords = extractKeywords(`${job.title} ${job.description || ''}`);
  
  // STRICT: Only exact keyword matches
  const keywordMatches = [...new Set(
    resumeKeywords.filter(k => jobKeywords.includes(k))
  )].slice(0, 15);
  
  // ENHANCED: Balanced weights with precision focus
  const weights = {
    skills: 0.50,      // Core technical match
    experience: 0.35,  // Role/title relevance
    embedding: 0.05,   // Semantic similarity (backup)
    keywords: 0.10     // Contextual relevance
  };
  
  // Calculate keyword score with diminishing returns
  const rawKeywordScore = (keywordMatches.length / Math.max(1, jobKeywords.length)) * 100;
  const keywordScore = Math.min(80, rawKeywordScore); // Cap to prevent keyword stuffing
  
  // Calculate base score
  let overallScore = Math.round(
    skillMatch.score * weights.skills +
    experienceMatch.score * weights.experience +
    embeddingSimilarity * 100 * weights.embedding +
    keywordScore * weights.keywords
  );
  
  // Apply penalties for low skill matches (deal-breaker)
  if (skillMatch.score < 20 && (job.skills_required?.length || 0) > 3) {
    overallScore = Math.round(overallScore * 0.6); // 40% penalty
  }
  
  // Apply penalties for no title match (significant concern)
  if (experienceMatch.score < 30) {
    overallScore = Math.round(overallScore * 0.85); // 15% penalty
  }
  
  return {
    resume_id: resume.id,
    job_id: job.id,
    overall_score: Math.min(100, overallScore),
    skills_score: skillMatch.score,
    experience_score: experienceMatch.score,
    embedding_similarity: embeddingSimilarity,
    matched_skills: skillMatch.matched,
    missing_skills: skillMatch.missing,
    experience_matches: experienceMatch.matches,
    keyword_matches: keywordMatches
  };
}

// Generate AI recommendation
export async function generateRecommendation(match, resume, job) {
  try {
    const parsedData = resume.parsed_data || {};
    
    const prompt = `Based on this job matching analysis, provide a brief 2-3 sentence recommendation for the candidate.

Job: ${job.title} at ${job.company}
Match Score: ${match.overall_score}%
Skills Match: ${match.skills_score}%
Experience Match: ${match.experience_score}%
Matched Skills: ${match.matched_skills?.join(', ') || 'None identified'}
Missing Skills: ${match.missing_skills?.join(', ') || 'None'}

Candidate Background:
- Current/Recent Title: ${parsedData.experience?.[0]?.title || 'Not specified'}
- Skills: ${(parsedData.skills || []).slice(0, 10).join(', ')}

Provide actionable advice on whether to apply and what to emphasize.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          recommendation: { type: 'string' }
        }
      }
    });
    
    return response.recommendation;
  } catch (err) {
    return `With a ${match.overall_score}% match score, this position ${match.overall_score >= 60 ? 'aligns well with your background' : 'may require some additional skill development'}. ${match.matched_skills?.length > 0 ? `Your strengths in ${match.matched_skills.slice(0, 3).join(', ')} are valuable for this role.` : ''} ${match.missing_skills?.length > 0 ? `Consider highlighting transferable skills related to ${match.missing_skills.slice(0, 2).join(' and ')}.` : ''}`;
  }
}

// Batch match jobs for a resume
export async function matchJobsForResume(resume, jobs) {
  const matches = [];
  
  for (const job of jobs) {
    const match = await calculateJobMatch(resume, job);
    const recommendation = await generateRecommendation(match, resume, job);
    
    matches.push({
      ...match,
      recommendation
    });
  }
  
  // Sort by overall score descending
  return matches.sort((a, b) => b.overall_score - a.overall_score);
}