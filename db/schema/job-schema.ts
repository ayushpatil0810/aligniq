import { relations } from 'drizzle-orm';
import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  boolean,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { analysisResult } from './analysis-schema';

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
    company: text('company').notNull(),
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
  ],
);

export const jobDescriptionRelations = relations(jobDescription, ({ many }) => ({
  analyses: many(analysisResult),
}));

export type JobDescription = typeof jobDescription.$inferSelect;
export type NewJobDescription = typeof jobDescription.$inferInsert;
