import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { jobDescription } from '../db/schema/job-schema';
import { nanoid } from 'nanoid';

const db = drizzle(neon(process.env.DATABASE_URL!));

const jobs = [
	// Frontend
	{
		id: nanoid(),
		title: 'Senior Frontend Engineer',
		company: 'Vercel',
		category: 'frontend' as const,
		level: 'senior' as const,
		description: `We're looking for a Senior Frontend Engineer to help us build the future of web development. You'll work on next-generation developer tooling and the platform that powers millions of websites.\n\nYou'll be working closely with our product and design teams to craft exceptional user experiences. We value engineers who care deeply about both performance and developer experience.`,
		requirements: {
			technicalSkills: [
				'React',
				'TypeScript',
				'Next.js',
				'CSS-in-JS',
				'Webpack',
				'Web Performance',
				'A11y',
				'GraphQL',
			],
			softSkills: ['Communication', 'Self-direction', 'Problem solving', 'Design sensibility'],
			experienceYears: 5,
			education: 'CS degree or equivalent experience',
			niceToHave: ['Rust', 'Edge computing', 'Turborepo', 'WASM'],
		},
		isActive: true,
	},
	{
		id: nanoid(),
		title: 'React Developer',
		company: 'Linear',
		category: 'frontend' as const,
		level: 'mid' as const,
		description: `Linear is hiring a React developer to help build our product management software used by thousands of engineering teams. You'll work on a highly interactive, performance-critical web application.\n\nWe focus on craftsmanship and details. You should care deeply about UX and have strong opinions about software quality.`,
		requirements: {
			technicalSkills: [
				'React',
				'TypeScript',
				'CSS',
				'Performance optimization',
				'WebSockets',
				'IndexedDB',
			],
			softSkills: ['Attention to detail', 'Product thinking', 'Ownership'],
			experienceYears: 3,
			education: 'Any technical background',
			niceToHave: ['Electron', 'Offline-first apps', 'Canvas/WebGL'],
		},
		isActive: true,
	},
	{
		id: nanoid(),
		title: 'Junior Frontend Developer',
		company: 'Notion',
		category: 'frontend' as const,
		level: 'junior' as const,
		description: `Join Notion's frontend team as a Junior Developer. You'll work alongside experienced engineers on our web editor, building features that millions of people use daily.\n\nThis is a great role for someone early in their career who wants to grow quickly in a collaborative environment.`,
		requirements: {
			technicalSkills: ['JavaScript', 'React', 'HTML', 'CSS', 'Git'],
			softSkills: ['Eagerness to learn', 'Communication', 'Attention to detail'],
			experienceYears: 1,
			education: 'Any',
			niceToHave: ['TypeScript', 'Testing (Jest)', 'Figma'],
		},
		isActive: true,
	},
	// Backend
	{
		id: nanoid(),
		title: 'Senior Backend Engineer',
		company: 'Stripe',
		category: 'backend' as const,
		level: 'senior' as const,
		description: `Stripe is looking for a Senior Backend Engineer to join our platform team. You'll work on systems that process billions of dollars in payments, requiring extreme reliability, security, and scale.\n\nYou'll design and implement APIs consumed by millions of developers worldwide.`,
		requirements: {
			technicalSkills: [
				'Ruby',
				'Go',
				'PostgreSQL',
				'Redis',
				'Kafka',
				'gRPC',
				'Distributed systems',
				'API design',
			],
			softSkills: ['Systems thinking', 'Security mindset', 'Technical leadership'],
			experienceYears: 6,
			education: 'CS degree preferred',
			niceToHave: ['Payment systems', 'PCI compliance', 'SOC 2'],
		},
		isActive: true,
	},
	{
		id: nanoid(),
		title: 'Node.js Backend Developer',
		company: 'Supabase',
		category: 'backend' as const,
		level: 'mid' as const,
		description: `Join the Supabase team building the open-source Firebase alternative. You'll work on our backend APIs, database tooling, and real-time infrastructure.\n\nWe're a fully remote team passionate about open source and developer experience.`,
		requirements: {
			technicalSkills: [
				'Node.js',
				'TypeScript',
				'PostgreSQL',
				'REST APIs',
				'WebSockets',
				'Docker',
				'Kubernetes',
			],
			softSkills: ['Open source mindset', 'Documentation', 'Remote collaboration'],
			experienceYears: 3,
			education: 'Any technical background',
			niceToHave: ['Rust', 'PostgREST', 'Elixir', 'Deno'],
		},
		isActive: true,
	},
	{
		id: nanoid(),
		title: 'Backend Engineer (Python)',
		company: 'OpenAI',
		category: 'backend' as const,
		level: 'senior' as const,
		description: `OpenAI is looking for a Backend Engineer to work on our API platform and developer ecosystem. You'll build the infrastructure that serves AI capabilities to millions of developers.\n\nThis is a mission-critical role at the forefront of AI deployment.`,
		requirements: {
			technicalSkills: [
				'Python',
				'FastAPI',
				'PostgreSQL',
				'Redis',
				'Kubernetes',
				'gRPC',
				'Load balancing',
				'API rate limiting',
			],
			softSkills: ['Mission alignment', 'Autonomy', 'Technical rigor'],
			experienceYears: 5,
			education: 'CS degree strongly preferred',
			niceToHave: ['CUDA', 'ML infrastructure', 'Triton', 'vLLM'],
		},
		isActive: true,
	},
	// Full Stack
	{
		id: nanoid(),
		title: 'Full Stack Engineer',
		company: 'PlanetScale',
		category: 'fullstack' as const,
		level: 'mid' as const,
		description: `PlanetScale is hiring a Full Stack Engineer to build our database platform UI and API. You'll work across the entire stack from database query optimizations to beautiful frontend experiences.\n\nWe're a small, impactful team where you'll have ownership over significant features.`,
		requirements: {
			technicalSkills: ['React', 'TypeScript', 'Go', 'MySQL', 'Vitess', 'REST APIs', 'Docker'],
			softSkills: ['Full ownership', 'Product empathy', 'Cross-functional collaboration'],
			experienceYears: 3,
			education: 'Any',
			niceToHave: ['Database internals', 'Kubernetes', 'Schema migrations'],
		},
		isActive: true,
	},
	{
		id: nanoid(),
		title: 'Full Stack Developer (Next.js)',
		company: 'Prisma',
		category: 'fullstack' as const,
		level: 'senior' as const,
		description: `Join Prisma to build developer tooling used by hundreds of thousands of engineers. You'll work on our web platform, documentation site, and internal tools using Next.js and TypeScript.\n\nWe value clean code, great documentation, and exceptional developer experience.`,
		requirements: {
			technicalSkills: [
				'Next.js',
				'TypeScript',
				'React',
				'PostgreSQL',
				'Prisma ORM',
				'tRPC',
				'Tailwind CSS',
			],
			softSkills: ['Developer empathy', 'Documentation skills', 'Design sense'],
			experienceYears: 5,
			education: 'Any',
			niceToHave: ['Rust', 'Database engines', 'GraphQL', 'Edge computing'],
		},
		isActive: true,
	},
	{
		id: nanoid(),
		title: 'Junior Full Stack Developer',
		company: 'Raycast',
		category: 'fullstack' as const,
		level: 'junior' as const,
		description: `Raycast is looking for a junior full stack developer to help us build extensions, APIs, and web features for our productivity platform. You'll get hands-on experience with modern TypeScript, React, and Node.js.\n\nGreat opportunity to grow fast in a focused, design-driven team.`,
		requirements: {
			technicalSkills: ['TypeScript', 'React', 'Node.js', 'REST APIs', 'SQL basics', 'Git'],
			softSkills: ['Design sensibility', 'Curiosity', 'Attention to detail'],
			experienceYears: 1,
			education: 'Any',
			niceToHave: ['Swift', 'macOS development', 'GraphQL'],
		},
		isActive: true,
	},
	// DevOps
	{
		id: nanoid(),
		title: 'Senior DevOps Engineer',
		company: 'Cloudflare',
		category: 'devops' as const,
		level: 'senior' as const,
		description: `Cloudflare's infrastructure team is hiring a Senior DevOps Engineer to manage our global network serving over 20% of all internet traffic. You'll work on deployment pipelines, observability, and reliability at unprecedented scale.\n\nExtreme reliability and security are core to everything we build.`,
		requirements: {
			technicalSkills: [
				'Kubernetes',
				'Terraform',
				'Go',
				'Prometheus',
				'Grafana',
				'Linux',
				'BGP',
				'Nginx',
				'CI/CD',
			],
			softSkills: ['Incident response', 'On-call culture', 'Documentation'],
			experienceYears: 6,
			education: 'CS or Systems Engineering preferred',
			niceToHave: ['DPDK', 'eBPF', 'Rust', 'Custom silicon'],
		},
		isActive: true,
	},
	{
		id: nanoid(),
		title: 'Platform Engineer',
		company: 'GitHub',
		category: 'devops' as const,
		level: 'mid' as const,
		description: `GitHub is looking for a Platform Engineer to help scale our developer platform to tens of millions of users. You'll work on internal tooling, CI/CD systems, and developer productivity.\n\nYou'll have a direct impact on how millions of developers build software.`,
		requirements: {
			technicalSkills: [
				'Docker',
				'Kubernetes',
				'AWS',
				'Terraform',
				'Python',
				'GitHub Actions',
				'Helm',
				'Observability',
			],
			softSkills: ['Developer empathy', 'Systems thinking', 'Documentation'],
			experienceYears: 4,
			education: 'Any technical background',
			niceToHave: ['Ruby', 'MySQL at scale', 'Chaos engineering'],
		},
		isActive: true,
	},
	// AI / ML
	{
		id: nanoid(),
		title: 'AI Engineer',
		company: 'Anthropic',
		category: 'ai' as const,
		level: 'senior' as const,
		description: `Anthropic is hiring an AI Engineer to work on building and deploying large language model capabilities. You'll bridge the gap between ML research and production systems.\n\nWe're a safety-focused AI company working on some of the most important problems in technology.`,
		requirements: {
			technicalSkills: [
				'Python',
				'PyTorch',
				'CUDA',
				'Distributed training',
				'MLOps',
				'Kubernetes',
				'REST APIs',
				'LLM fine-tuning',
			],
			softSkills: ['Research mindset', 'Safety consciousness', 'Clear communication'],
			experienceYears: 5,
			education: 'PhD or equivalent research experience preferred',
			niceToHave: ['JAX', 'Triton', 'RLHF', 'Constitutional AI'],
		},
		isActive: true,
	},
	{
		id: nanoid(),
		title: 'ML Engineer',
		company: 'Hugging Face',
		category: 'ai' as const,
		level: 'mid' as const,
		description: `Join Hugging Face's engineering team to build the AI community's most loved tools and infrastructure. You'll work on model training pipelines, inference optimization, and the open-source ecosystem.\n\nWe're building the GitHub for machine learning.`,
		requirements: {
			technicalSkills: [
				'Python',
				'PyTorch',
				'Transformers',
				'Datasets',
				'FastAPI',
				'Docker',
				'AWS/GCP',
				'Model optimization',
			],
			softSkills: ['Open source culture', 'Community engagement', 'Documentation'],
			experienceYears: 3,
			education: 'ML or CS background required',
			niceToHave: ['Rust', 'ONNX', 'TensorRT', 'Safetensors'],
		},
		isActive: true,
	},
	// Data
	{
		id: nanoid(),
		title: 'Senior Data Engineer',
		company: 'Figma',
		category: 'data' as const,
		level: 'senior' as const,
		description: `Figma's data team is hiring a Senior Data Engineer to build the infrastructure that powers product analytics, A/B testing, and business intelligence for our growing platform.\n\nYou'll work with petabytes of data and partner closely with product teams to enable data-driven decisions.`,
		requirements: {
			technicalSkills: [
				'Python',
				'Apache Spark',
				'dbt',
				'Airflow',
				'BigQuery',
				'Kafka',
				'SQL',
				'Data modeling',
			],
			softSkills: ['Business acumen', 'Stakeholder management', 'Documentation'],
			experienceYears: 5,
			education: 'CS or Data Engineering',
			niceToHave: ['Rust', 'Flink', 'ML pipelines', 'Looker'],
		},
		isActive: true,
	},
	// Mobile
	{
		id: nanoid(),
		title: 'iOS Engineer',
		company: 'Arc Browser',
		category: 'mobile' as const,
		level: 'senior' as const,
		description: `The Browser Company is building Arc — a reimagined browser for power users. We're looking for an exceptional iOS Engineer to bring Arc to iPhone and iPad.\n\nYou'll work on a truly novel product where design and engineering are inseparable. Taste matters here as much as technical skill.`,
		requirements: {
			technicalSkills: [
				'Swift',
				'SwiftUI',
				'UIKit',
				'Combine',
				'XCTest',
				'Core Data',
				'WebKit',
				'Performance profiling',
			],
			softSkills: ['Design sensibility', 'Craft', 'Product ownership'],
			experienceYears: 5,
			education: 'Any',
			niceToHave: ['Chromium', 'Browser internals', 'Metal', 'App Clips'],
		},
		isActive: true,
	},
	{
		id: nanoid(),
		title: 'React Native Developer',
		company: 'Expo',
		category: 'mobile' as const,
		level: 'mid' as const,
		description: `Expo is looking for a React Native Developer to work on our SDK, developer tools, and documentation. You'll help thousands of developers build better mobile apps.\n\nThis is a unique opportunity to work on developer tools used by the React Native community.`,
		requirements: {
			technicalSkills: [
				'React Native',
				'TypeScript',
				'Expo SDK',
				'iOS',
				'Android',
				'Native modules',
				'EAS',
			],
			softSkills: ['Developer empathy', 'Open source mindset', 'Teaching ability'],
			experienceYears: 3,
			education: 'Any',
			niceToHave: ['Swift', 'Kotlin', 'Bare workflow', 'Hermes engine'],
		},
		isActive: true,
	},
];

async function seed() {
	console.log('🌱 Seeding job descriptions...');

	try {
		// Clear existing
		// await db.delete(jobDescription);

		for (const job of jobs) {
			await db.insert(jobDescription).values(job).onConflictDoNothing();
			console.log(`  ✓ ${job.title} at ${job.company}`);
		}

		console.log(`\n✅ Seeded ${jobs.length} job descriptions successfully!`);
	} catch (err) {
		console.error('❌ Seed failed:', err);
		process.exit(1);
	}
}

seed();
