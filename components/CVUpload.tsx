'use client';

import { useState, useRef, DragEvent } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface CVUploadProps {
  onUploadSuccess: (baseProfile: unknown, cvText: string) => void;
  sessionId: string;
}

export function CVUpload({ onUploadSuccess, sessionId }: CVUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    'idle' | 'uploading' | 'analysing' | 'error'
  >('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) processFile(dropped);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
  }

  async function processFile(f: File) {
    const name = f.name.toLowerCase();
    if (!name.endsWith('.pdf') && !name.endsWith('.docx')) {
      setErrorMsg('Please upload a PDF or DOCX file.');
      setStatus('error');
      return;
    }

    setFile(f);
    setStatus('uploading');
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', f);
      formData.append('sessionId', sessionId);

      setStatus('analysing');
      const res = await fetch('/api/parse-cv', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }

      const data = await res.json();
      onUploadSuccess(data.baseProfile, data.cvText);
    } catch (err) {
      setStatus('error');
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to process CV'
      );
    }
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return (
    <div className="w-full max-w-lg">
      <div
        onClick={() => status === 'idle' && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}
          ${status !== 'idle' ? 'cursor-default' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="hidden"
        />

        {status === 'idle' && !file && (
          <>
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            </div>
            <p className="text-slate-700 font-medium mb-1">
              Drop your CV here
            </p>
            <p className="text-slate-400 text-sm">
              or click to browse · PDF or DOCX
            </p>
          </>
        )}

        {(status === 'uploading' || status === 'analysing') && (
          <div className="flex flex-col items-center gap-4">
            {file && (
              <div className="flex items-center gap-3 bg-slate-100 rounded-xl px-4 py-3 w-full">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
                </div>
              </div>
            )}
            <LoadingSpinner
              size="md"
              text={
                status === 'uploading'
                  ? 'Uploading...'
                  : 'Analysing your CV...'
              }
            />
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-red-600 font-medium">{errorMsg}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setStatus('idle');
                setFile(null);
                setErrorMsg('');
              }}
              className="text-sm text-blue-500 hover:text-blue-700 underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
