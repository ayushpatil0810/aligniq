import { createOpenAIClient, getProviderCompatibleOptions, extractJsonFromText, type AiConfigOptions } from '@/ai/client';
import env from '@/lib/utils/env';
import { ParsedResumeSchema, type ParsedResume } from '@/ai/schemas/resume-analysis';

const SYSTEM_PROMPT = `You are an expert technical recruiter and career advisor with 15+ years of experience.
Analyze the provided resume text and extract structured information.

Guidelines:
- Be precise about technical skills — distinguish between languages, frameworks, databases, tools
- Assess experience level based on job titles, project complexity, and years mentioned
- Identify gaps compared to what modern roles typically require
- Score the resume quality (clarity, ATS-friendliness, impact statements, quantification)
- Provide actionable, specific insights — not generic advice`;

export async function parseResume(
	resumeText: string,
	aiConfig?: AiConfigOptions & { modelName?: string | null }
): Promise<ParsedResume> {
	if (!resumeText || resumeText.trim().length < 50) {
		throw new Error('Resume text is too short to parse meaningfully');
	}

	const { response_format, systemPromptSuffix } = getProviderCompatibleOptions(ParsedResumeSchema, 'parsed_resume', aiConfig);

	const openai = createOpenAIClient(aiConfig);
	const response = await openai.chat.completions.create({
		model: aiConfig?.modelName || env.AI_MODEL_NAME,
		messages: [
			{ role: 'system', content: SYSTEM_PROMPT + systemPromptSuffix },
			{
				role: 'user',
				content: `Please parse this resume:\n\n${resumeText}`,
			},
		],
		response_format,
		temperature: 0.1,
	});

	const content = response.choices[0]?.message?.content;
	if (!content) {
		throw new Error('Failed to parse resume — AI returned no output');
	}

	try {
		const jsonString = extractJsonFromText(content);
		return ParsedResumeSchema.parse(JSON.parse(jsonString));
	} catch (err) {
		throw new Error('Failed to parse resume — AI returned invalid structure');
	}
}
