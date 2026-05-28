/**
 * PDF Extraction Service
 * Extracts text from PDF buffers using pdf-parse v2.
 */

import { PDFParse } from 'pdf-parse';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
	const parser = new PDFParse({ data: buffer });
	try {
		const result = await parser.getText();
		return result.text.trim();
	} finally {
		await parser.destroy();
	}
}
