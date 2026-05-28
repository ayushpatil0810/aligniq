import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { jobDescription } from '@/db/schema';
import { eq, and, ilike, or } from 'drizzle-orm';

export const runtime = 'nodejs';

// GET /api/jobs?category=frontend&level=mid&q=react
export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const category = searchParams.get('category');
		const level = searchParams.get('level');
		const query = searchParams.get('q');

		const conditions = [eq(jobDescription.isActive, true)];

		if (category && category !== 'all') {
			conditions.push(
				eq(
					jobDescription.category,
					category as
						| 'frontend'
						| 'backend'
						| 'fullstack'
						| 'mobile'
						| 'devops'
						| 'data'
						| 'ai'
						| 'design'
						| 'other'
				)
			);
		}

		if (level && level !== 'all') {
			conditions.push(
				eq(
					jobDescription.level,
					level as 'intern' | 'junior' | 'mid' | 'senior' | 'staff' | 'principal'
				)
			);
		}

		if (query) {
			conditions.push(
				or(
					ilike(jobDescription.title, `%${query}%`),
					ilike(jobDescription.company, `%${query}%`),
					ilike(jobDescription.description, `%${query}%`)
				)!
			);
		}

		const jobs = await db
			.select({
				id: jobDescription.id,
				title: jobDescription.title,
				company: jobDescription.company,
				category: jobDescription.category,
				level: jobDescription.level,
				requirements: jobDescription.requirements,
				createdAt: jobDescription.createdAt,
			})
			.from(jobDescription)
			.where(and(...conditions))
			.limit(50);

		return NextResponse.json({ jobs });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to fetch jobs';
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
