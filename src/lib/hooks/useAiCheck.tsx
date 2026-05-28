import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAiConfig } from '@/lib/utils/ai-config';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function useAiCheck() {
	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();

	const checkAiKey = (): boolean => {
		const config = getAiConfig();
		if (!config.apiKey) {
			setIsOpen(true);
			return false;
		}
		return true;
	};

	const AiKeyModal = () => (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>AI API Key Required</AlertDialogTitle>
					<AlertDialogDescription>
						You need to configure your AI API keys before you can use this feature. You can bring your own key from OpenAI, Anthropic, Gemini, or other compatible providers.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => setIsOpen(false)}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => {
							setIsOpen(false);
							router.push('/settings');
						}}
					>
						Go to Settings
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);

	return { checkAiKey, AiKeyModal };
}
