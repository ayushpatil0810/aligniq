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
  progress: number;
}

export function useResumeUpload(): UseResumeUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(async (file: File): Promise<UploadedResume | null> => {
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported');
      return null;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
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

      toast.success('Resume uploaded and analyzed successfully!');
      return data;
    } catch (err) {
      const message =
        axios.isAxiosError(err)
          ? err.response?.data?.error ?? 'Upload failed'
          : 'Upload failed';
      toast.error(message);
      return null;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, []);

  return { upload, isUploading, progress };
}
