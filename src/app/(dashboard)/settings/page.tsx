'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getAiConfig, saveAiConfig, type AiConfig } from '@/lib/utils/ai-config';
import { ShieldCheck, Info, Globe } from '@phosphor-icons/react';
import { clsx } from 'clsx';

const PROVIDERS = [
	{
		id: 'openai',
		name: 'OpenAI',
		url: 'https://api.openai.com/v1',
		logo: 'https://www.svgrepo.com/show/306500/openai.svg',
	},
	{
		id: 'gemini',
		name: 'Google Gemini',
		url: 'https://generativelanguage.googleapis.com/v1beta/openai/',
		logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Google_Gemini_icon_2025.svg/3840px-Google_Gemini_icon_2025.svg.png',
	},
	{
		id: 'anthropic',
		name: 'Anthropic',
		url: 'https://api.anthropic.com/v1/',
		logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Claude-ai-icon.svg/3840px-Claude-ai-icon.svg.png',
	},
	{
		id: 'other',
		name: 'Other',
		url: '',
		logo: null,
	},
];

export default function AiSettingsPage() {
	const [config, setConfig] = useState<AiConfig>({
		apiKey: '',
		baseUrl: '',
		modelName: '',
	});
	const [selectedProvider, setSelectedProvider] = useState<string>('other');
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		const savedConfig = getAiConfig();
		setConfig(savedConfig);

		const matchedProvider = PROVIDERS.find((p) => p.url && savedConfig.baseUrl === p.url);
		if (matchedProvider) {
			setSelectedProvider(matchedProvider.id);
		} else if (!savedConfig.baseUrl || savedConfig.baseUrl === 'https://api.openai.com/v1') {
			setSelectedProvider('openai');
			if (!savedConfig.baseUrl) {
				setConfig((prev) => ({ ...prev, baseUrl: 'https://api.openai.com/v1' }));
			}
		} else {
			setSelectedProvider('other');
		}

		setIsMounted(true);
	}, []);

	// Handle Base URL changes to auto-detect provider
	const handleBaseUrlChange = (newUrl: string) => {
		setConfig({ ...config, baseUrl: newUrl });
		const matchedProvider = PROVIDERS.find((p) => p.url && newUrl === p.url);
		if (matchedProvider) {
			setSelectedProvider(matchedProvider.id);
		} else {
			setSelectedProvider('other');
		}
	};

	const handleSave = () => {
		saveAiConfig(config);
		toast.success('AI settings saved successfully');
	};

	if (!isMounted) return null;

	return (
		<div className="space-y-6 animate-fade-in w-full">
			<PageHeader
				title="AI Settings"
				description="Bring your own key (BYOK) to customize your AI experience."
			/>

			<div className="rounded-xl border border-border bg-card p-6 space-y-5">
				<div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
					<Info size={20} className="text-primary mt-0.5 shrink-0" />
					<div className="space-y-1">
						<p className="font-medium">Supported Providers</p>
						<p className="text-muted-foreground text-xs leading-relaxed">
							You can use any OpenAI-compatible endpoint. This includes OpenAI, Anthropic (via proxies), Google Gemini, DeepSeek, Nvidia NIM, Groq, and local models (LM Studio, Ollama).
						</p>
					</div>
				</div>

				<div className="space-y-3">
					<Label>AI Provider</Label>
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
						{PROVIDERS.map((provider) => (
							<button
								key={provider.id}
								onClick={() => {
									setSelectedProvider(provider.id);
									if (provider.url) {
										setConfig({ ...config, baseUrl: provider.url });
									}
								}}
								className={clsx(
									'flex flex-col items-center justify-center p-3 rounded-lg border text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
									selectedProvider === provider.id
										? 'border-primary bg-primary/10 text-primary'
										: 'border-border hover:border-primary/50 bg-card text-muted-foreground'
								)}
							>
								{provider.logo ? (
									<img
										src={provider.logo}
										alt={provider.name}
										className="w-6 h-6 mb-2 object-contain dark:brightness-110"
									/>
								) : (
									<Globe size={24} className="mb-2" />
								)}
								<span className="font-medium text-[11px] sm:text-xs">
									{provider.name}
								</span>
							</button>
						))}
					</div>
				</div>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="apiKey">API Key</Label>
						<Input
							id="apiKey"
							type="password"
							placeholder="sk-..."
							value={config.apiKey || ''}
							onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
						/>
						<p className="text-[11px] text-muted-foreground">Stored securely in your browser's local storage.</p>
					</div>



					{selectedProvider === 'other' && (
						<div className="space-y-2 animate-fade-in">
							<Label htmlFor="baseUrl">Custom Base URL</Label>
							<Input
								id="baseUrl"
								type="url"
								placeholder="https://api.openai.com/v1"
								value={config.baseUrl || ''}
								onChange={(e) => handleBaseUrlChange(e.target.value)}
							/>
							<p className="text-[11px] text-muted-foreground">
								Enter your custom OpenAI-compatible endpoint URL.
							</p>
						</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="modelName">Model Name (Optional)</Label>
						<Input
							id="modelName"
							type="text"
							placeholder="gpt-4o, claude-3-5-sonnet, etc."
							value={config.modelName || ''}
							onChange={(e) => setConfig({ ...config, modelName: e.target.value })}
						/>
						<p className="text-[11px] text-muted-foreground">Override the default model used for analysis and generation.</p>
					</div>

					<Button onClick={handleSave} className="w-full sm:w-auto mt-2">
						<ShieldCheck size={16} className="mr-2" />
						Save Settings
					</Button>
				</div>
			</div>
		</div>
	);
}
