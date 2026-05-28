import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { ZodType } from 'zod';

export interface AiConfigOptions {
	apiKey?: string | null;
	baseUrl?: string | null;
}

export function createOpenAIClient(config?: AiConfigOptions): OpenAI {
	// Use provided config, fallback to env variables
	const apiKey = config?.apiKey || process.env.OPENAI_API_KEY;
	const baseURL = config?.baseUrl || undefined; // If undefined, OpenAI uses default

	if (!apiKey) {
		throw new Error(
			'AI API Key is missing. Please set OPENAI_API_KEY environment variable or provide one in the AI Settings.'
		);
	}

	return new OpenAI({
		apiKey,
		baseURL,
	});
}

// Fallback convenience client using default env vars
let _defaultClient: OpenAI | null = null;
export function getDefaultOpenAI(): OpenAI {
	if (!_defaultClient) {
		_defaultClient = createOpenAIClient();
	}
	return _defaultClient;
}

// Retain proxy for backwards compatibility if needed, though pipelines should instantiate explicitly
export const openai = new Proxy({} as OpenAI, {
	get(target, prop) {
		return getDefaultOpenAI()[prop as keyof OpenAI];
	},
});

export function getProviderCompatibleOptions(
	schema: ZodType<any>,
	name: string,
	aiConfig?: AiConfigOptions
) {
	const isOpenAI = !aiConfig?.baseUrl || aiConfig.baseUrl.includes('openai.com');
	
	const zrf = zodResponseFormat(schema, name);
	
	if (isOpenAI) {
		return {
			response_format: zrf,
			systemPromptSuffix: ''
		};
	}
	
	// For Non-OpenAI providers, fallback to json_object and provide the schema in the prompt
	return {
		response_format: { type: 'json_object' as const },
		systemPromptSuffix: `\n\nIMPORTANT: You must output ONLY valid JSON matching the following JSON Schema:\n${JSON.stringify(zrf.json_schema.schema, null, 2)}`
	};
}

export function extractJsonFromText(text: string): string {
	const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
	return match ? match[1] : text;
}
