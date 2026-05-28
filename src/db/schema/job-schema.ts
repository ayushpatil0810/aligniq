import { relations } from 'drizzle-orm';
import { pgTable, pgEnum, text, timestamp, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import { analysisResult } from './analysis-schema';
import { user } from './auth-schema';

export const jobCategoryEnum = pgEnum('job_category', [
	'frontend',
	'backend',
	'fullstack',
	'mobile',
	'devops',
	'data',
	'ai',
	'design',
	'other',
]);

export const jobLevelEnum = pgEnum('job_level', [
	'intern',
	'junior',
	'mid',
	'senior',
	'staff',
	'principal',
]);

export const jobDescription = pgTable(
	'job_description',
	{
		id: text('id').primaryKey(),
		title: text('title').notNull(),
		category: jobCategoryEnum('category').notNull(),
		level: jobLevelEnum('level').notNull(),
		description: text('description').notNull(),
		requirements: jsonb('requirements').notNull().$type<{
			technicalSkills: string[];
			softSkills: string[];
			experienceYears: number;
			education: string;
			niceToHave: string[];
		}>(),
		isActive: boolean('is_active').default(true).notNull(),
		isCustom: boolean('is_custom').default(false).notNull(),
		userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index('job_category_idx').on(table.category),
		index('job_level_idx').on(table.level),
		index('job_active_idx').on(table.isActive),
		index('job_iscustom_idx').on(table.isCustom),
		index('job_userid_idx').on(table.userId),
	]
);

export const jobDescriptionRelations = relations(jobDescription, ({ many, one }) => ({
	analyses: many(analysisResult),
	user: one(user, {
		fields: [jobDescription.userId],
		references: [user.id],
	}),
}));

export type JobDescription = typeof jobDescription.$inferSelect;
export type NewJobDescription = typeof jobDescription.$inferInsert;
