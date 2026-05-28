import { z } from 'zod';

export const MatchedSkillSchema = z.object({
	skill: z.string(),
	proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
	relevance: z.enum(['core', 'secondary', 'nice-to-have']),
});

export const MissingSkillSchema = z.object({
	skill: z.string(),
	priority: z.enum(['high', 'medium', 'low']),
	learningTimeWeeks: z.number().describe('Estimated weeks to learn this skill adequately'),
	reason: z.string().describe('Why this skill matters for the role'),
});

export const MatchAnalysisSchema = z.object({
	matchScore: z.number().min(0).max(100).describe('Overall semantic match score'),
	skillsMatched: z.array(MatchedSkillSchema),
	skillsMissing: z.array(MissingSkillSchema),
	strengths: z.array(z.string()).describe('3-5 candidate strengths for this role'),
	weaknesses: z.array(z.string()).describe('3-5 areas where candidate is weaker'),
	insights: z.string().describe('Narrative analysis paragraph for the candidate'),
	readinessLevel: z.enum(['not-ready', 'developing', 'ready', 'strong']),
	placementProbability: z.number().min(0).max(100).describe('Estimated placement probability %'),
});

export type MatchAnalysis = z.infer<typeof MatchAnalysisSchema>;
