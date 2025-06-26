/**
 * Constants related to project categorization
 *
 * This file contains shared constants used for project filtering,
 * categorization, and display purposes across the application.
 */

// Cloud providers with their identifying keywords
// To be removed once data validation is in place - data should only be GCP,AWS,Azure or another cloud provider
export const CLOUD_PROVIDERS = {
  AWS: ['aws', 'amazon', 'ec2', 'lambda', 'fargate', 'ecs', 'eks'],
  GCP: ['gcp', 'google cloud', 'cloud run', 'gke', 'app engine'],
  Azure: ['azure', 'microsoft'],
  Other: [],
};

// Project stage categories
export const PROJECT_STAGES = ['Active Support', 'Development', 'Unsupported'];

// Development types
export const DEVELOPMENT_TYPES = ['In House', 'Partner', 'Outsourced'];

// Development type codes mapping
export const DEVELOPMENT_TYPE_CODES = {
  I: 'In House',
  P: 'Partner',
  O: 'Outsourced',
};

// Hosting options
export const HOSTING_TYPES = ['Cloud', 'Hybrid', 'On-premises'];

// Architecture categories
export const ARCHITECTURE_CATEGORIES = ['AWS', 'GCP', 'Azure', 'Other'];

// Color mappings for different categories
export const CATEGORY_COLOURS = {
  // Project stages
  'Active Support': 'hsl(var(--chart-1))',
  Development: 'hsl(var(--chart-2))',
  Unsupported: 'hsl(var(--chart-3))',

  // Development types
  I: 'hsl(var(--chart-3))',
  O: 'hsl(var(--chart-4))',
  P: 'hsl(var(--chart-5))',

  // Hosting types
  Cloud: 'hsl(var(--chart-2))',
  'On-premises': 'hsl(var(--chart-3))',
  Hybrid: 'hsl(var(--chart-4))',

  // Architecture categories
  AWS: 'hsl(var(--chart-1))',
  GCP: 'hsl(var(--chart-2))',
  Azure: 'hsl(var(--chart-3))',
  Other: 'hsl(var(--chart-4))',
};
