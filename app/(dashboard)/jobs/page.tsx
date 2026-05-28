import { db } from '@/server/db';
import { jobDescription } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { PageHeader } from '@/components/shared/PageHeader';
import { JobFilter } from '@/features/jobs/components/JobFilter';

export default async function JobsPage() {
	const jobs = await db
		.select()
		.from(jobDescription)
		.where(eq(jobDescription.isActive, true))
		.limit(100);

	return (
		<div className="space-y-6 animate-fade-in">
			<PageHeader
				title="Job Library"
				description={`${jobs.length} job descriptions across Frontend, Backend, Full-Stack, DevOps, AI, and more.`}
			/>
			<JobFilter jobs={jobs} />
		</div>
	);
}
