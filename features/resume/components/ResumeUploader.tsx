'use client';

import { useState, useRef } from 'react';
import { useResumeUpload } from '../hooks/useResumeUpload';
import { UploadSimple, File as FileIcon, Check, X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ResumeUploaderProps {
	onSuccess?: (resumeId: string) => void;
}

export function ResumeUploader({ onSuccess }: ResumeUploaderProps) {
	const { upload, isUploading, progress } = useResumeUpload();
	const [isDragging, setIsDragging] = useState(false);
	const [uploadedFile, setUploadedFile] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	async function processFile(file: File) {
		const result = await upload(file);
		if (result) {
			setUploadedFile(file.name);
			onSuccess?.(result.id);
		}
	}

	function handleDrop(e: React.DragEvent) {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files[0];
		if (file) processFile(file);
	}

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file) processFile(file);
	}

	if (uploadedFile) {
		return (
			<div className="rounded-md border border-border/50 bg-accent/20 p-8 text-center flex flex-col items-center">
				<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background">
					<Check size={20} weight="bold" />
				</div>
				<p className="text-sm font-medium text-foreground">{uploadedFile}</p>
				<p className="mt-1 text-xs text-muted-foreground">Upload and analysis complete</p>
				<Button
					variant="ghost"
					size="sm"
					className="mt-4 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
					onClick={() => setUploadedFile(null)}
					id="btn-upload-another"
				>
					<X size={13} /> Upload another
				</Button>
			</div>
		);
	}

	return (
		<div
			onDragOver={(e) => {
				e.preventDefault();
				setIsDragging(true);
			}}
			onDragLeave={() => setIsDragging(false)}
			onDrop={handleDrop}
			onClick={() => !isUploading && fileInputRef.current?.click()}
			className={cn(
				'relative flex flex-col items-center justify-center rounded-md border border-dashed p-10 text-center transition-all duration-200 cursor-pointer',
				isDragging
					? 'border-foreground bg-accent/50 scale-[1.01]'
					: 'border-muted-foreground/30 bg-transparent hover:border-foreground/50 hover:bg-accent/20',
				isUploading && 'pointer-events-none opacity-80'
			)}
		>
			<input
				ref={fileInputRef}
				type="file"
				accept="application/pdf"
				className="hidden"
				onChange={handleFileChange}
				id="resume-file-input"
			/>

			{isUploading ? (
				<div className="w-full max-w-xs">
					<div className="mb-4 flex items-center justify-center">
						<div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
					</div>
					<p className="mb-2 text-[13px] font-medium text-foreground tracking-tight">
						{progress < 30
							? 'Uploading...'
							: progress < 70
								? 'Extracting text...'
								: 'Analyzing with AI...'}
					</p>
					<div className="h-1 w-full overflow-hidden rounded-full bg-border">
						<div
							className="h-full rounded-full bg-foreground transition-all duration-500"
							style={{ width: `${Math.max(10, progress)}%` }}
						/>
					</div>
					<p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
						Please wait
					</p>
				</div>
			) : (
				<>
					<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-foreground">
						<UploadSimple size={20} />
					</div>
					<p className="text-sm font-medium text-foreground tracking-tight">
						Drop your resume here, or{' '}
						<span className="underline underline-offset-4 font-semibold">browse</span>
					</p>
					<p className="mt-1 text-xs text-muted-foreground">PDF only, max 10MB</p>
					<div className="mt-4 flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-medium text-muted-foreground/70 border border-border/50 px-2 py-1 rounded-sm">
						<FileIcon size={12} />
						Instant AI parsing
					</div>
				</>
			)}
		</div>
	);
}
