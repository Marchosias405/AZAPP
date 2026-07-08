import type { LocalQuestion } from "@/lib/exam/types";

export const LOCAL_MOCK_QUESTIONS: LocalQuestion[] = [
  {
    id: "local-q1-shared-responsibility",
    domain: "Describe cloud concepts",
    topic: "Shared responsibility model",
    difficulty: "beginner",
    questionType: "single-answer",
    selectCount: 1,
    questionText:
      "In the shared responsibility model, which responsibility usually stays with the customer in every cloud model?",
    options: [
      {
        id: "A",
        text: "Managing the physical datacenter building",
      },
      {
        id: "B",
        text: "Protecting account identities and access",
      },
      {
        id: "C",
        text: "Replacing failed physical servers",
      },
      {
        id: "D",
        text: "Maintaining Azure region power and cooling",
      },
    ],
    correctAnswerIds: ["B"],
    explanation:
      "The customer is always responsible for identities, access, data, and devices. Microsoft handles more of the physical infrastructure in cloud services.",
    memoryHook:
      "Your cloud account is like your house key. Azure owns the building, but you still guard the key.",
    sourceBasis:
      "AZ-900 cloud concepts: shared responsibility model and cloud service models.",
    tags: ["shared responsibility", "identity", "cloud concepts"],
  },
  {
    id: "local-q2-consumption-model",
    domain: "Describe cloud concepts",
    topic: "Consumption-based model",
    difficulty: "beginner",
    questionType: "choose-2",
    selectCount: 2,
    questionText:
      "Which two statements describe benefits of a consumption-based cloud pricing model?",
    options: [
      {
        id: "A",
        text: "You must buy physical servers before using cloud resources.",
      },
      {
        id: "B",
        text: "You can pay only for resources you actually use.",
      },
      {
        id: "C",
        text: "You can reduce upfront hardware spending.",
      },
      {
        id: "D",
        text: "You are always charged the same fixed amount every month.",
      },
    ],
    correctAnswerIds: ["B", "C"],
    explanation:
      "Consumption-based pricing means usage affects cost. It helps avoid large upfront hardware purchases and lets you pay based on what you use.",
    memoryHook:
      "Cloud billing is like ordering bubble tea toppings: pay for what you add, not the whole shop.",
    sourceBasis:
      "AZ-900 cloud concepts: consumption-based pricing and cloud cost benefits.",
    tags: ["pricing", "consumption model", "cloud concepts"],
  },
  {
    id: "local-q3-availability-zones",
    domain: "Describe Azure architecture and services",
    topic: "Availability zones",
    difficulty: "standard",
    questionType: "single-answer",
    selectCount: 1,
    questionText: "What is the main purpose of Azure availability zones?",
    options: [
      {
        id: "A",
        text: "To group billing invoices by department",
      },
      {
        id: "B",
        text: "To protect applications from datacenter-level failures within a region",
      },
      {
        id: "C",
        text: "To replace subscriptions in the Azure hierarchy",
      },
      {
        id: "D",
        text: "To create private DNS names for virtual machines",
      },
    ],
    correctAnswerIds: ["B"],
    explanation:
      "Availability zones are physically separate datacenter locations inside an Azure region. They help protect workloads from datacenter-level failures.",
    memoryHook:
      "Availability zones are like three separate classrooms in one school. If one room floods, class can continue elsewhere.",
    sourceBasis:
      "AZ-900 Azure architecture: regions, datacenters, and availability zones.",
    tags: ["availability zones", "regions", "reliability"],
  },
  {
    id: "local-q4-resource-groups",
    domain: "Describe Azure architecture and services",
    topic: "Resource groups",
    difficulty: "beginner",
    questionType: "single-answer",
    selectCount: 1,
    questionText: "What is an Azure resource group mainly used for?",
    options: [
      {
        id: "A",
        text: "Organizing related Azure resources for management",
      },
      {
        id: "B",
        text: "Replacing Microsoft Entra ID authentication",
      },
      {
        id: "C",
        text: "Providing physical isolation between datacenters",
      },
      {
        id: "D",
        text: "Guaranteeing free Azure services",
      },
    ],
    correctAnswerIds: ["A"],
    explanation:
      "A resource group is a logical container used to manage related Azure resources together.",
    memoryHook:
      "A resource group is like a backpack for one project. Put the project’s stuff in one bag.",
    sourceBasis:
      "AZ-900 Azure architecture: resources, resource groups, subscriptions, and hierarchy.",
    tags: ["resource groups", "resource hierarchy", "management"],
  },
  {
    id: "local-q5-rbac-policy-locks",
    domain: "Describe Azure management and governance",
    topic: "Azure RBAC, Policy, and resource locks",
    difficulty: "standard",
    questionType: "common-confusion",
    selectCount: 1,
    questionText:
      "Which Azure feature controls what actions a user is allowed to perform on Azure resources?",
    options: [
      {
        id: "A",
        text: "Azure Policy",
      },
      {
        id: "B",
        text: "Azure RBAC",
      },
      {
        id: "C",
        text: "Resource locks",
      },
      {
        id: "D",
        text: "Azure Advisor",
      },
    ],
    correctAnswerIds: ["B"],
    explanation:
      "Azure RBAC controls access by assigning roles to users, groups, or identities. Azure Policy enforces rules on resources, and locks help prevent deletion or changes.",
    memoryHook:
      "RBAC is the bouncer. Policy is the rulebook. Locks are the padlock.",
    sourceBasis:
      "AZ-900 governance: Azure RBAC, Azure Policy, resource locks, and Azure Advisor.",
    tags: ["rbac", "policy", "locks", "governance"],
  },
  {
    id: "local-q6-monitor-service-health",
    domain: "Describe Azure management and governance",
    topic: "Azure Monitor and Azure Service Health",
    difficulty: "standard",
    questionType: "choose-3",
    selectCount: 3,
    questionText:
      "Which three Azure services or tools are commonly used for monitoring, health, and recommendations?",
    options: [
      {
        id: "A",
        text: "Azure Monitor",
      },
      {
        id: "B",
        text: "Azure Service Health",
      },
      {
        id: "C",
        text: "Azure Advisor",
      },
      {
        id: "D",
        text: "Azure Data Box",
      },
      {
        id: "E",
        text: "Azure Storage Explorer",
      },
    ],
    correctAnswerIds: ["A", "B", "C"],
    explanation:
      "Azure Monitor helps collect and analyze monitoring data. Azure Service Health shows Azure service issues and planned maintenance. Azure Advisor gives recommendations to improve Azure resources.",
    memoryHook:
      "Monitor watches your app, Service Health watches Azure, Advisor gives advice like a cloud guidance counselor.",
    sourceBasis:
      "AZ-900 monitoring and support: Azure Monitor, Azure Service Health, and Azure Advisor.",
    tags: ["service health", "monitoring", "advisor", "governance"],
  },
];

export function getLocalQuestionByIndex(index: number) {
  return LOCAL_MOCK_QUESTIONS[index];
}

export function getTotalLocalQuestionCount() {
  return LOCAL_MOCK_QUESTIONS.length;
}