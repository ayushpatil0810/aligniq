'use client';

import { useState, useRef } from 'react';
import { useResumeUpload } from '../hooks/useResumeUpload';
import { UploadSimple, File as FileIcon, CheckCircle, X } from '@phosphor-icons/react';
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
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
        <div className="mb-3 flex items-center justify-center">
          <CheckCircle size={32} weight="duotone" className="text-emerald-500" />
        </div>
        <p className="text-sm font-medium text-foreground">{uploadedFile}</p>
        <p className="mt-1 text-xs text-muted-foreground">Uploaded and analyzed successfully</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 gap-1.5 text-muted-foreground hover:text-foreground"
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
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !isUploading && fileInputRef.current?.click()}
      className={cn(
        'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-all duration-200 cursor-pointer',
        isDragging
          ? 'border-primary bg-primary/5 scale-[1.01]'
          : 'border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/30',
        isUploading && 'pointer-events-none',
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
          <div className="mb-3 flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-border border-t-primary" />
          </div>
          <p className="mb-2 text-sm font-medium text-foreground">
            {progress < 30 ? 'Uploading...' : progress < 70 ? 'Extracting text...' : 'Analyzing with AI...'}
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.max(10, progress)}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">This may take 30-60 seconds</p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <UploadSimple size={24} weight="duotone" className="text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Drop your resume here, or{' '}
            <span className="text-primary">browse</span>
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">PDF only · Max 10MB</p>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground/70">
            <FileIcon size={12} />
            AI-powered parsing · Instant analysis
          </div>
        </>
      )}
    </div>
  );
}
