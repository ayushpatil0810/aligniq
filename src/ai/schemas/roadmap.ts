import { z } from 'zod';

export const RoadmapTopicSchema = z.object({
	name: z.string(),
	resources: z.array(z.string()).describe('Free learning resources: articles, docs, videos'),
	estimatedHours: z.number().describe('Total hours to complete this topic'),
});

export const RoadmapWeekSchema = z.object({
	week: z.number().min(1).max(4),
	title: z.string().describe('Theme/focus for this week'),
	goals: z.array(z.string()).describe('3-4 specific learning goals'),
	topics: z.array(RoadmapTopicSchema).describe('2-4 topics to cover this week'),
	dailyPractice: z.string().describe('Short daily practice recommendation (15-30 min)'),
	milestone: z.string().describe('End of week milestone/deliverable'),
});

export const RoadmapSchema = z.object({
	weeks: z.array(RoadmapWeekSchema).length(4),
	overallGoal: z.string().describe('What the candidate will achieve in 4 weeks'),
	totalEstimatedHours: z.number(),
	prioritySkills: z.array(z.string()).describe('Top 3-5 skills to focus on first'),
});

export type RoadmapWeek = z.infer<typeof RoadmapWeekSchema>;
export type RoadmapData = z.infer<typeof RoadmapSchema>;
