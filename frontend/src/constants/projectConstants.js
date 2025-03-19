/**
 * Constants related to project categorization
 * 
 * This file contains shared constants used for project filtering,
 * categorization, and display purposes across the application.
 */

// Cloud providers with their identifying keywords
// To be removed once data validation is in place - data should only be GCP,AWS,Azure or another cloud provider
export const CLOUD_PROVIDERS = {
  AWS: ["aws", "amazon", "ec2", "lambda", "fargate", "ecs", "eks"],
  GCP: ["gcp", "google cloud", "cloud run", "gke", "app engine"],
  Azure: ["azure", "microsoft"],
  Other: []
};

// Project stage categories
export const PROJECT_STAGES = ["Active Support", "Development", "Unsupported"];

// Development types
export const DEVELOPMENT_TYPES = ["In House", "Partner", "Outsourced"];

// Development type codes mapping
export const DEVELOPMENT_TYPE_CODES = {
  I: "In House",
  P: "Partner",
  O: "Outsourced"
};

// Hosting options
export const HOSTING_TYPES = ["Cloud", "Hybrid", "On-premises"];

// Architecture categories
export const ARCHITECTURE_CATEGORIES = ["AWS", "GCP", "Azure", "Other"];

// Color mappings for different categories
export const CATEGORY_COLOURS = {
  // Project stages
  "Active Support": "var(--color-adopt)",
  "Development": "var(--color-trial)",
  "Unsupported": "var(--color-hold)",
  
  // Development types
  "I": "var(--color-adopt)",
  "O": "var(--color-trial)",
  "P": "var(--color-assess)",
  
  // Hosting types
  "Cloud": "var(--color-adopt)",
  "On-premises": "var(--color-trial)",
  "Hybrid": "var(--color-assess)",
  
  // Architecture categories
  "AWS": "var(--color-adopt)",
  "GCP": "var(--color-trial)",
  "Azure": "var(--color-hold)",
  "Other": "var(--color-assess)",
}; 