import { relations } from 'drizzle-orm';
import { pgTable, pgEnum, text, timestamp, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';
import { analysisResult } from './analysis-schema';

export const resumeStatusEnum = pgEnum('resume_status', [
	'pending',
	'processing',
	'done',
	'failed',
]);

export const resume = pgTable(
	'resume',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		fileName: text('file_name').notNull(),
		fileUrl: text('file_url').notNull(),
		storagePath: text('storage_path').notNull(),
		rawText: text('raw_text'),
		parsedData: jsonb('parsed_data'),
		score: integer('score'),
		status: resumeStatusEnum('status').default('pending').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index('resume_userId_idx').on(table.userId),
		index('resume_status_idx').on(table.status),
	]
);

export const resumeRelations = relations(resume, ({ one, many }) => ({
	user: one(user, {
		fields: [resume.userId],
		references: [user.id],
	}),
	analyses: many(analysisResult),
}));

export type Resume = typeof resume.$inferSelect;
export type NewResume = typeof resume.$inferInsert;
