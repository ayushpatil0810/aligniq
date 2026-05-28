'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function DeleteResumeButton({ id }: { id: string }) {
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();

	const handleDelete = async () => {
		if (
			!window.confirm(
				'Are you sure you want to delete this resume? This will also delete any related analyses and roadmaps.'
			)
		) {
			return;
		}

		setIsDeleting(true);
		try {
			const res = await fetch(`/api/resumes/${id}`, {
				method: 'DELETE',
			});

			if (!res.ok) {
				throw new Error('Failed to delete resume');
			}

			toast.success('Resume deleted successfully');
			router.refresh();
		} catch (error) {
			toast.error('Failed to delete resume');
			console.error(error);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
			onClick={handleDelete}
			disabled={isDeleting}
			title="Delete resume"
		>
			<Trash size={15} weight="duotone" className={isDeleting ? 'animate-pulse' : ''} />
		</Button>
	);
}
