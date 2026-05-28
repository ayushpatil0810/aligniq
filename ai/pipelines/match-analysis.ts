import { createOpenAIClient, getProviderCompatibleOptions, extractJsonFromText, type AiConfigOptions } from '@/ai/client';
import env from '@/lib/utils/env';
import { MatchAnalysisSchema, type MatchAnalysis } from '@/ai/schemas/match-analysis';
import type { ParsedResume } from '@/ai/schemas/resume-analysis';
import type { JobDescription } from '@/db/schema';

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
	aiConfig?: AiConfigOptions & { modelName?: string | null };
}

export async function analyzeMatch({
	parsedResume,
	jobDescription,
	aiConfig,
}: MatchInput): Promise<MatchAnalysis> {
	const openai = createOpenAIClient(aiConfig);
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
		description: jobDescription.description,
		category: jobDescription.category,
		requirements: jobDescription.requirements,
		descriptionExcerpt: jobDescription.description.slice(0, 3000),
	});

	const { response_format, systemPromptSuffix } = getProviderCompatibleOptions(MatchAnalysisSchema, 'match_analysis', aiConfig);

	const response = await openai.chat.completions.create({
		model: aiConfig?.modelName || env.AI_MODEL_NAME,
		messages: [
			{ role: 'system', content: SYSTEM_PROMPT + systemPromptSuffix },
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
		response_format,
		temperature: 0.2,
	});

	const content = response.choices[0]?.message?.content;
	if (!content) {
		throw new Error('Match analysis failed — AI returned no output');
	}

	try {
		const jsonString = extractJsonFromText(content);
		return MatchAnalysisSchema.parse(JSON.parse(jsonString));
	} catch (err) {
		throw new Error('Match analysis failed — AI returned invalid structure');
	}
}
