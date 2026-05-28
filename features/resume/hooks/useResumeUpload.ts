'use client';

import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

interface UploadedResume {
	id: string;
	fileName: string;
	score: number | null;
	status: string;
}

interface UseResumeUploadReturn {
	upload: (file: File) => Promise<UploadedResume | null>;
	isUploading: boolean;
	isProcessing: boolean;
	progress: number;
}

export function useResumeUpload(): UseResumeUploadReturn {
	const [isUploading, setIsUploading] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [progress, setProgress] = useState(0);

	const upload = useCallback(async (file: File): Promise<UploadedResume | null> => {
		if (file.type !== 'application/pdf') {
			toast.error('Only PDF files are supported');
			return null;
		}

		if (file.size > 5 * 1024 * 1024) {
			toast.error('File size must be under 5MB');
			return null;
		}

		setIsUploading(true);
		setProgress(0);

		try {
			const formData = new FormData();
			formData.append('file', file);

			const { data } = await axios.post<UploadedResume>('/api/upload/resume', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
				onUploadProgress: (event) => {
					if (event.total) {
						setProgress(Math.round((event.loaded * 100) / event.total));
					}
				},
			});

			let currentResume = data;

			if (currentResume.status === 'processing') {
				setIsUploading(false); // Network upload is done
				setIsProcessing(true);
				toast.info('Resume uploaded. AI is parsing... this may take up to a minute.');

				while (currentResume.status === 'processing') {
					await new Promise((resolve) => setTimeout(resolve, 3000));
					const { data: pollData } = await axios.get<{ resume: UploadedResume }>(
						`/api/resumes/${currentResume.id}`
					);
					currentResume = pollData.resume;
				}
			}

			if (currentResume.status === 'failed') {
				throw new Error('AI parsing failed. Please try a different resume.');
			}

			toast.success('Resume uploaded and parsed successfully!');
			return currentResume;
		} catch (err) {
			const message = axios.isAxiosError(err)
				? (err.response?.data?.error ?? 'Upload failed')
				: err instanceof Error
					? err.message
					: 'Upload failed';
			toast.error(message);
			return null;
		} finally {
			setIsUploading(false);
			setIsProcessing(false);
			setProgress(0);
		}
	}, []);

	return { upload, isUploading, isProcessing, progress };
}
