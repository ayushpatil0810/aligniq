import { openai } from '@/ai/client';
import env from '@/lib/utils/env';
import { ParsedResumeSchema, type ParsedResume } from '@/ai/schemas/resume-analysis';
import { zodResponseFormat } from 'openai/helpers/zod';

const SYSTEM_PROMPT = `You are an expert technical recruiter and career advisor with 15+ years of experience.
Analyze the provided resume text and extract structured information.

Guidelines:
- Be precise about technical skills — distinguish between languages, frameworks, databases, tools
- Assess experience level based on job titles, project complexity, and years mentioned
- Identify gaps compared to what modern roles typically require
- Score the resume quality (clarity, ATS-friendliness, impact statements, quantification)
- Provide actionable, specific insights — not generic advice`;

export async function parseResume(resumeText: string): Promise<ParsedResume> {
	if (!resumeText || resumeText.trim().length < 50) {
		throw new Error('Resume text is too short to parse meaningfully');
	}

	const response = await openai.chat.completions.create({
		model: env.AI_MODEL_NAME,
		messages: [
			{ role: 'system', content: SYSTEM_PROMPT },
			{
				role: 'user',
				content: `Parse the following resume and extract all structured information:\n\n${resumeText.slice(0, 12000)}`,
			},
		],
		response_format: zodResponseFormat(ParsedResumeSchema, 'parsed_resume'),
		temperature: 0.1,
	});

	const content = response.choices[0]?.message?.content;
	if (!content) {
		throw new Error('Failed to parse resume — AI returned no output');
	}

	try {
		return ParsedResumeSchema.parse(JSON.parse(content));
	} catch {
		throw new Error('Failed to parse resume — AI returned invalid structure');
	}
}
