import { createOpenAIClient, getProviderCompatibleOptions, extractJsonFromText, type AiConfigOptions } from '@/ai/client';
import env from '@/lib/utils/env';
import { RoadmapSchema, type RoadmapData } from '@/ai/schemas/roadmap';
import type { MatchAnalysis } from '@/ai/schemas/match-analysis';
import type { JobDescription } from '@/db/schema';


const SYSTEM_PROMPT = `You are a world-class learning coach and curriculum designer specializing in tech careers.

Create a realistic, actionable 4-week learning roadmap based on the candidate's skill gaps.

Guidelines:
- Week 1: Foundation fixes — most critical missing concepts
- Week 2: Core skill building — primary technologies needed
- Week 3: Project-based learning — apply skills in context
- Week 4: Interview readiness — practice, mock projects, polish

Keep it achievable: assume 2-3 hours/day of dedicated learning time.
Recommend only FREE or widely-available resources (MDN, official docs, YouTube, freeCodeCamp, etc.)
Daily practice should be small (15-30 min) and habit-forming.
Each milestone should be a concrete, testable outcome.`;

interface RoadmapInput {
	analysis: MatchAnalysis;
	jobDescription: JobDescription;
	aiConfig?: AiConfigOptions & { modelName?: string | null };
}

export async function generateRoadmap({
	analysis,
	jobDescription,
	aiConfig,
}: RoadmapInput): Promise<RoadmapData> {
	const openai = createOpenAIClient(aiConfig);
	const context = JSON.stringify({
		jobTitle: jobDescription.title,
		level: jobDescription.level,
		skillsMissing: analysis.skillsMissing,
		weaknesses: analysis.weaknesses,
		readinessLevel: analysis.readinessLevel,
		matchScore: analysis.matchScore,
	});

	const { response_format, systemPromptSuffix } = getProviderCompatibleOptions(
		RoadmapSchema,
		'learning_roadmap',
		aiConfig
	);

	const response = await openai.chat.completions.create({
		model: aiConfig?.modelName || env.AI_MODEL_NAME,
		messages: [
			{ role: 'system', content: SYSTEM_PROMPT + systemPromptSuffix },
			{
				role: 'user',
				content: `Create a personalized 4-week study roadmap for this candidate.

Context:
${context}

Make it specific, realistic, and targeted at closing the identified gaps for the ${jobDescription.title} role.`,
			},
		],
		response_format,
		temperature: 0.3,
	});

	const content = response.choices[0]?.message?.content;
	if (!content) {
		throw new Error('Roadmap generation failed — AI returned no output');
	}

	try {
		const jsonString = extractJsonFromText(content);
		return RoadmapSchema.parse(JSON.parse(jsonString));
	} catch (err) {
		throw new Error('Roadmap generation failed — AI returned invalid structure');
	}
}
