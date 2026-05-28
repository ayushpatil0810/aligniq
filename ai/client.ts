import OpenAI from 'openai';

// Lazy singleton — initialized on first use, not at module load time
let _client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
	if (!_client) {
		const apiKey = process.env.OPENAI_API_KEY;
		if (!apiKey) {
			throw new Error('OPENAI_API_KEY environment variable is not set');
		}
		const baseURL = process.env.AI_BASE_URL || undefined;
		_client = new OpenAI({ apiKey, baseURL });
	}
	return _client;
}

// Convenience proxy — use this exactly like the regular openai client
export const openai = new Proxy({} as OpenAI, {
	get(_target, prop) {
		return getOpenAI()[prop as keyof OpenAI];
	},
});
