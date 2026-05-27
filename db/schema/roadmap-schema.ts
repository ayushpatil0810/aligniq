import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { user } from './auth-schema';
import { analysisResult } from './analysis-schema';

export const roadmap = pgTable(
  'roadmap',
  {
    id: text('id').primaryKey(),
    analysisId: text('analysis_id')
      .notNull()
      .references(() => analysisResult.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    weeks: jsonb('weeks').notNull().$type<
      Array<{
        week: number;
        title: string;
        goals: string[];
        topics: Array<{
          name: string;
          resources: string[];
          estimatedHours: number;
        }>;
        dailyPractice: string;
        milestone: string;
      }>
    >(),
    currentWeek: integer('current_week').default(1).notNull(),
    progress: integer('progress').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('roadmap_userId_idx').on(table.userId),
    index('roadmap_analysisId_idx').on(table.analysisId),
  ],
);

export const interviewQuestion = pgTable(
  'interview_question',
  {
    id: text('id').primaryKey(),
    analysisId: text('analysis_id')
      .notNull()
      .references(() => analysisResult.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    questions: jsonb('questions').notNull().$type<
      Array<{
        id: string;
        question: string;
        category: 'technical' | 'behavioral' | 'gap-focused' | 'company-specific';
        difficulty: 'easy' | 'medium' | 'hard';
        hint: string;
        sampleAnswer: string;
      }>
    >(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('interview_userId_idx').on(table.userId),
    index('interview_analysisId_idx').on(table.analysisId),
  ],
);

export const roadmapRelations = relations(roadmap, ({ one }) => ({
  user: one(user, { fields: [roadmap.userId], references: [user.id] }),
  analysis: one(analysisResult, { fields: [roadmap.analysisId], references: [analysisResult.id] }),
}));

export const interviewQuestionRelations = relations(interviewQuestion, ({ one }) => ({
  user: one(user, { fields: [interviewQuestion.userId], references: [user.id] }),
  analysis: one(analysisResult, { fields: [interviewQuestion.analysisId], references: [analysisResult.id] }),
}));

export type Roadmap = typeof roadmap.$inferSelect;
export type NewRoadmap = typeof roadmap.$inferInsert;
export type InterviewQuestion = typeof interviewQuestion.$inferSelect;
export type NewInterviewQuestion = typeof interviewQuestion.$inferInsert;
