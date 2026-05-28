import { z } from 'zod';

export const ResumeProjectSchema = z.object({
	name: z.string(),
	description: z.string(),
	technologies: z.array(z.string()),
});

export const ParsedResumeSchema = z.object({
	technicalSkills: z
		.array(z.string())
		.describe('Programming languages, frameworks, tools, platforms'),
	softSkills: z.array(z.string()).describe('Communication, leadership, teamwork etc.'),
	projects: z.array(ResumeProjectSchema).describe('Notable projects with tech used'),
	technologies: z.array(z.string()).describe('All technologies mentioned'),
	experienceLevel: z
		.enum(['intern', 'junior', 'mid', 'senior', 'staff'])
		.describe('Assessed experience level'),
	yearsOfExperience: z.number().describe('Estimated years of relevant experience'),
	educationSummary: z.string().describe('Highest education and field'),
	missingConcepts: z
		.array(z.string())
		.describe('Common concepts typically expected but not found in resume'),
	score: z.number().min(0).max(100).describe('Resume quality score 0-100'),
	insights: z.array(z.string()).describe('3-5 actionable insights to improve this resume'),
});

export type ParsedResume = z.infer<typeof ParsedResumeSchema>;
