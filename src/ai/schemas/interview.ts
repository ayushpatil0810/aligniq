import { z } from 'zod';

export const InterviewQuestionSchema = z.object({
	id: z.string(),
	question: z.string(),
	category: z.enum(['technical', 'behavioral', 'gap-focused', 'role-specific']),
	difficulty: z.enum(['easy', 'medium', 'hard']),
	hint: z.string().describe('A subtle hint to guide the answer'),
	sampleAnswer: z.string().describe('A strong sample answer outline'),
});

export const InterviewSetSchema = z.object({
	questions: z.array(InterviewQuestionSchema).min(12).max(20),
	preparationTips: z.array(z.string()).describe('3-5 role-specific interview tips'),
	focusAreas: z.array(z.string()).describe('Top 3 areas the interviewer will probe based on gaps'),
});

export type InterviewQuestion = z.infer<typeof InterviewQuestionSchema>;
export type InterviewSet = z.infer<typeof InterviewSetSchema>;
