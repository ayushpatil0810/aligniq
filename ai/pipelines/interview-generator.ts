import { createOpenAIClient, getProviderCompatibleOptions, extractJsonFromText, type AiConfigOptions } from '@/ai/client';
import env from '@/lib/utils/env';
import { InterviewSetSchema, type InterviewSet } from '@/ai/schemas/interview';
import type { MatchAnalysis } from '@/ai/schemas/match-analysis';
import type { ParsedResume } from '@/ai/schemas/resume-analysis';
import type { JobDescription } from '@/db/schema';

const SYSTEM_PROMPT = `You are a senior technical interviewer with experience at FAANG and top startups.

Generate realistic, challenging interview questions tailored to the candidate's specific profile.

Question categories:
- TECHNICAL: Role-specific technical depth questions
- BEHAVIORAL: Situational/STAR-method questions targeting the candidate's experience
- GAP-FOCUSED: Questions that will probe the candidate's identified skill gaps
- ROLE-SPECIFIC: Questions specific to this role's requirements and best practices

Guidelines:
- Don't make questions generic — make them specific to this candidate's background
- Gap-focused questions should be honest but not cruel — give the candidate a path to answer
- Sample answers should be outlines, not scripts — encourage authentic responses
- Mix difficulty levels appropriately for the seniority level`;

interface InterviewInput {
	parsedResume: ParsedResume;
	aiConfig?: AiConfigOptions & { modelName?: string | null };
	analysis: MatchAnalysis;
	jobDescription: JobDescription;
}

export async function generateInterviewQuestions({
	parsedResume,
	aiConfig,
	analysis,
	jobDescription,
}: InterviewInput): Promise<InterviewSet> {
	const openai = createOpenAIClient(aiConfig);
	const context = JSON.stringify({
		jobTitle: jobDescription.title,
		description: jobDescription.description,
		candidateSkills: parsedResume.technicalSkills,
		candidateProjects: parsedResume.projects.slice(0, 3),
		skillsMissing: analysis.skillsMissing.slice(0, 8),
		weaknesses: analysis.weaknesses,
		strengths: analysis.strengths,
		matchScore: analysis.matchScore,
	});

	const { response_format, systemPromptSuffix } = getProviderCompatibleOptions(
		InterviewSetSchema,
		'interview_questions',
		aiConfig
	);

	const response = await openai.chat.completions.create({
		model: aiConfig?.modelName || env.AI_MODEL_NAME,
		messages: [
			{ role: 'system', content: SYSTEM_PROMPT + systemPromptSuffix },
			{
				role: 'user',
				content: `Generate 15-18 interview questions for this candidate applying for ${jobDescription.title}.

Candidate & Job Context:
${context}

Include questions across all 4 categories. Make gap-focused questions particularly insightful.`,
			},
		],
		response_format,
		temperature: 0.4,
	});

	const content = response.choices[0]?.message?.content;
	if (!content) {
		throw new Error('Interview generation failed — AI returned no output');
	}

	try {
		const jsonString = extractJsonFromText(content);
		return InterviewSetSchema.parse(JSON.parse(jsonString));
	} catch (err) {
		throw new Error('Interview generation failed — AI returned invalid structure');
	}
}
