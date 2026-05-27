import { openai } from '@/ai/client';
import env from '@/lib/utils/env';
import { InterviewSetSchema, type InterviewSet } from '@/ai/schemas/interview';
import type { MatchAnalysis } from '@/ai/schemas/match-analysis';
import type { ParsedResume } from '@/ai/schemas/resume-analysis';
import type { JobDescription } from '@/db/schema';
import { zodResponseFormat } from 'openai/helpers/zod';

const SYSTEM_PROMPT = `You are a senior technical interviewer with experience at FAANG and top startups.

Generate realistic, challenging interview questions tailored to the candidate's specific profile.

Question categories:
- TECHNICAL: Role-specific technical depth questions
- BEHAVIORAL: Situational/STAR-method questions targeting the candidate's experience
- GAP-FOCUSED: Questions that will probe the candidate's identified skill gaps
- COMPANY-SPECIFIC: Questions specific to this company's known culture and tech stack

Guidelines:
- Don't make questions generic — make them specific to this candidate's background
- Gap-focused questions should be honest but not cruel — give the candidate a path to answer
- Sample answers should be outlines, not scripts — encourage authentic responses
- Mix difficulty levels appropriately for the seniority level`;

interface InterviewInput {
  parsedResume: ParsedResume;
  analysis: MatchAnalysis;
  jobDescription: JobDescription;
}

export async function generateInterviewQuestions({
  parsedResume,
  analysis,
  jobDescription,
}: InterviewInput): Promise<InterviewSet> {
  const context = JSON.stringify({
    jobTitle: jobDescription.title,
    company: jobDescription.company,
    level: jobDescription.level,
    candidateSkills: parsedResume.technicalSkills,
    candidateProjects: parsedResume.projects.slice(0, 3),
    skillsMissing: analysis.skillsMissing.slice(0, 8),
    weaknesses: analysis.weaknesses,
    strengths: analysis.strengths,
    matchScore: analysis.matchScore,
  });

  const response = await openai.chat.completions.create({
    model: env.AI_MODEL_NAME,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Generate 15-18 interview questions for this candidate applying for ${jobDescription.title} at ${jobDescription.company}.

Candidate & Job Context:
${context}

Include questions across all 4 categories. Make gap-focused questions particularly insightful.`,
      },
    ],
    response_format: zodResponseFormat(InterviewSetSchema, 'interview_set'),
    temperature: 0.4,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Interview generation failed — AI returned no output');
  }

  try {
    return InterviewSetSchema.parse(JSON.parse(content));
  } catch {
    throw new Error('Interview generation failed — AI returned invalid structure');
  }
}
