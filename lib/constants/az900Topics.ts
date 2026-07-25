export const AZ900_DOMAINS = [
  "Describe cloud concepts",
  "Describe Azure architecture and services",
  "Describe Azure management and governance",
] as const;

export const QUESTION_DIFFICULTIES = [
  "beginner",
  "standard",
  "challenging",
] as const;

export const QUESTION_TYPES = [
  "single-answer",
  "choose-2",
  "choose-3",
  "scenario",
  "common-confusion",
] as const;

const CLOUD_CONCEPT_TOPICS = [
  "Cloud computing",
  "Shared responsibility model",
  "Public cloud",
  "Private cloud",
  "Hybrid cloud",
  "Consumption-based model",
  "Cloud pricing models",
  "Serverless",
  "High availability",
  "Scalability",
  "Reliability",
  "Predictability",
  "Security and governance",
  "Manageability",
  "IaaS",
  "PaaS",
  "SaaS",
] as const;

const AZURE_ARCHITECTURE_AND_SERVICES_TOPICS = [
  "Azure regions",
  "Region pairs",
  "Sovereign regions",
  "Availability zones",
  "Datacenters",
  "Resources",
  "Resource groups",
  "Subscriptions",
  "Management groups",
  "Resource hierarchy",
  "Virtual machines",
  "Containers",
  "Azure Functions",
  "VM Scale Sets",
  "Availability sets",
  "Azure Virtual Desktop",
  "Web apps",
  "Virtual networks",
  "Subnets",
  "Peering",
  "Azure DNS",
  "VPN Gateway",
  "ExpressRoute",
  "Public and private endpoints",
  "Azure Storage services",
  "Storage tiers",
  "Storage redundancy options",
  "Storage account types",
  "AzCopy",
  "Azure Storage Explorer",
  "Azure File Sync",
  "Azure Migrate",
  "Azure Data Box",
  "Microsoft Entra ID",
  "Microsoft Entra Domain Services",
  "Single sign-on",
  "Multifactor authentication",
  "Passwordless authentication",
  "External identities",
  "Conditional Access",
  "Azure RBAC",
  "Zero Trust",
  "Defense in depth",
  "Microsoft Defender for Cloud",
] as const;

const AZURE_MANAGEMENT_AND_GOVERNANCE_TOPICS = [
  "Azure cost factors",
  "Pricing calculator",
  "Cost Management",
  "Tags",
  "Microsoft Purview",
  "Azure Policy",
  "Resource locks",
  "Azure portal",
  "Azure Cloud Shell",
  "Azure CLI",
  "Azure PowerShell",
  "Azure Arc",
  "Infrastructure as Code",
  "Azure Resource Manager",
  "ARM templates",
  "Azure Advisor",
  "Azure Service Health",
  "Azure Monitor",
  "Log Analytics",
  "Azure Monitor alerts",
  "Application Insights",

  // Combined topics already used by local questions.
  "Azure RBAC, Policy, and resource locks",
  "Azure Monitor and Azure Service Health",
] as const;

export const AZ900_TOPICS_BY_DOMAIN = {
  "Describe cloud concepts": CLOUD_CONCEPT_TOPICS,
  "Describe Azure architecture and services":
    AZURE_ARCHITECTURE_AND_SERVICES_TOPICS,
  "Describe Azure management and governance":
    AZURE_MANAGEMENT_AND_GOVERNANCE_TOPICS,
} as const satisfies Record<
  (typeof AZ900_DOMAINS)[number],
  readonly string[]
>;

export const AZ900_ALLOWED_TOPICS = [
  ...CLOUD_CONCEPT_TOPICS,
  ...AZURE_ARCHITECTURE_AND_SERVICES_TOPICS,
  ...AZURE_MANAGEMENT_AND_GOVERNANCE_TOPICS,
] as const;