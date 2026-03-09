import { NextRequest, NextResponse } from 'next/server';
import { callClaudeForJson } from '@/lib/claude';
import { buildCvParserPrompt } from '@/lib/prompts/cvParser';
import {
  ensureSession,
  saveBaseProfile,
} from '@/lib/firebase';
import type { BaseProfile } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const sessionId = formData.get('sessionId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!sessionId) {
      return NextResponse.json(
        { error: 'No sessionId provided' },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    let cvText = '';

    if (fileName.endsWith('.pdf')) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      try {
        // Use require() to avoid Next.js ESM/pdf-parse compatibility issues
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse');
        const result = await pdfParse(buffer);
        cvText = result.text;
      } catch (pdfError) {
        console.error('pdf-parse error:', pdfError);
        return NextResponse.json(
          {
            error:
              'Could not read PDF. Please try a DOCX version, or make sure your PDF has selectable text (not a scanned image).',
          },
          { status: 400 }
        );
      }
    } else if (fileName.endsWith('.docx')) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      cvText = result.value;
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF or DOCX.' },
        { status: 400 }
      );
    }

    if (!cvText || cvText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Could not extract text from file. Is it a scanned PDF?' },
        { status: 400 }
      );
    }

    const prompt = buildCvParserPrompt(cvText);
    const baseProfile = await callClaudeForJson<BaseProfile>(prompt);

    // Ensure session exists and save profile
    await ensureSession(sessionId);
    await saveBaseProfile(sessionId, baseProfile, cvText);

    return NextResponse.json({ baseProfile, cvText });
  } catch (error) {
    console.error('Error parsing CV:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to parse CV: ${message}` },
      { status: 500 }
    );
  }
}
