import { requireAuth } from '@/server/auth';
import { db } from '@/server/db';
import { interviewQuestion } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { InterviewClient } from '@/features/interview/components/InterviewClient';
import type { InterviewQuestion } from '@/ai/schemas/interview';

export default async function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
	const session = await requireAuth();
	const { id } = await params;

	const [found] = await db
		.select()
		.from(interviewQuestion)
		.where(and(eq(interviewQuestion.id, id), eq(interviewQuestion.userId, session.user.id)));

	if (!found) notFound();

	const questions = found.questions as InterviewQuestion[];

	return (
		<div className="space-y-6 animate-fade-in">
			<PageHeader
				title="Interview Prep"
				description={`${questions.length} questions across Technical, Behavioral, Gap-Focused, and Role-Specific categories.`}
			/>
			<InterviewClient questions={questions} />
		</div>
	);
}
