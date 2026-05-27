import { openai } from '@/ai/client';
import env from '@/lib/utils/env';
import { MatchAnalysisSchema, type MatchAnalysis } from '@/ai/schemas/match-analysis';
import type { ParsedResume } from '@/ai/schemas/resume-analysis';
import type { JobDescription } from '@/db/schema';
import { zodResponseFormat } from 'openai/helpers/zod';

const SYSTEM_PROMPT = `You are a senior technical hiring manager and AI-powered placement engine.

Your task is to perform a deep semantic analysis between a candidate's resume and a job description.

Critical principles:
- Do NOT do simple keyword matching. Evaluate conceptual depth, transferable skills, and real-world applicability.
- A candidate who knows React deeply but not Vue may still be a strong match for a Vue role.
- Consider experience level expectations — a junior applying for senior is a bigger gap than missing one tool.
- Be honest but constructive. Scores should reflect true fit, not optimism.
- Missing skills should be prioritized by how critical they are to day-one job performance.`;

interface MatchInput {
  parsedResume: ParsedResume;
  jobDescription: JobDescription;
}

export async function analyzeMatch({ parsedResume, jobDescription }: MatchInput): Promise<MatchAnalysis> {
  const resumeSummary = JSON.stringify({
    technicalSkills: parsedResume.technicalSkills,
    softSkills: parsedResume.softSkills,
    technologies: parsedResume.technologies,
    experienceLevel: parsedResume.experienceLevel,
    yearsOfExperience: parsedResume.yearsOfExperience,
    projects: parsedResume.projects.slice(0, 5),
  });

  const jobSummary = JSON.stringify({
    title: jobDescription.title,
    company: jobDescription.company,
    level: jobDescription.level,
    category: jobDescription.category,
    requirements: jobDescription.requirements,
    descriptionExcerpt: jobDescription.description.slice(0, 3000),
  });

  const response = await openai.chat.completions.create({
    model: env.AI_MODEL_NAME,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Perform a comprehensive semantic match analysis.

CANDIDATE RESUME DATA:
${resumeSummary}

JOB DESCRIPTION:
${jobSummary}

Provide a detailed, honest analysis. Focus on contextual relevance, not keyword overlap.`,
      },
    ],
    response_format: zodResponseFormat(MatchAnalysisSchema, 'match_analysis'),
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Match analysis failed — AI returned no output');
  }

  try {
    return MatchAnalysisSchema.parse(JSON.parse(content));
  } catch {
    throw new Error('Match analysis failed — AI returned invalid structure');
  }
}
