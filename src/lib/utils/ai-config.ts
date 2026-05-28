export interface AiConfig {
	apiKey?: string;
	baseUrl?: string;
	modelName?: string;
}

const STORAGE_KEY = 'aligniq_ai_config';

export function getAiConfig(): AiConfig {
	if (typeof window === 'undefined') return {};
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? JSON.parse(stored) : {};
	} catch (e) {
		return {};
	}
}

export function saveAiConfig(config: AiConfig) {
	if (typeof window === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function getAiHeaders(): Record<string, string> {
	const config = getAiConfig();
	const headers: Record<string, string> = {};
	
	if (config.apiKey) headers['x-ai-api-key'] = config.apiKey;
	if (config.baseUrl) headers['x-ai-base-url'] = config.baseUrl;
	if (config.modelName) headers['x-ai-model-name'] = config.modelName;
	
	return headers;
}
