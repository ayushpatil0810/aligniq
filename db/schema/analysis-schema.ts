import { relations } from 'drizzle-orm';
import { pgTable, pgEnum, text, timestamp, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';
import { resume } from './resume-schema';
import { jobDescription } from './job-schema';

export const analysisStatusEnum = pgEnum('analysis_status', [
	'pending',
	'processing',
	'done',
	'failed',
]);

export const readinessLevelEnum = pgEnum('readiness_level', [
	'not-ready',
	'developing',
	'ready',
	'strong',
]);

export const analysisResult = pgTable(
	'analysis_result',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		resumeId: text('resume_id')
			.notNull()
			.references(() => resume.id, { onDelete: 'cascade' }),
		jobId: text('job_id')
			.notNull()
			.references(() => jobDescription.id, { onDelete: 'cascade' }),
		matchScore: integer('match_score'),
		skillsMatched:
			jsonb('skills_matched').$type<
				Array<{ skill: string; proficiencyLevel: string; relevance: string }>
			>(),
		skillsMissing:
			jsonb('skills_missing').$type<
				Array<{ skill: string; priority: 'high' | 'medium' | 'low'; learningTimeWeeks: number }>
			>(),
		strengths: jsonb('strengths').$type<string[]>(),
		weaknesses: jsonb('weaknesses').$type<string[]>(),
		insights: text('insights'),
		readinessLevel: readinessLevelEnum('readiness_level'),
		status: analysisStatusEnum('status').default('pending').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index('analysis_userId_idx').on(table.userId),
		index('analysis_resumeId_idx').on(table.resumeId),
		index('analysis_jobId_idx').on(table.jobId),
		index('analysis_status_idx').on(table.status),
	]
);

// Relations are defined separately to avoid circular imports
export const analysisResultRelations = relations(analysisResult, ({ one }) => ({
	user: one(user, {
		fields: [analysisResult.userId],
		references: [user.id],
	}),
	resume: one(resume, {
		fields: [analysisResult.resumeId],
		references: [resume.id],
	}),
	job: one(jobDescription, {
		fields: [analysisResult.jobId],
		references: [jobDescription.id],
	}),
}));

export type AnalysisResult = typeof analysisResult.$inferSelect;
export type NewAnalysisResult = typeof analysisResult.$inferInsert;
