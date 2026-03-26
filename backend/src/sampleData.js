export const sampleApplications = [
  {
    app_id: "app-aws-lambda",
    name: "AWS Lambda",
    version: "2.3.0",
    category: "Compute",
    usage_count: 94,
    dependencies: ["CloudWatch", "IAM"],
    created_at: "2026-03-20T09:30:00.000Z",
    status: "active"
  },
  {
    app_id: "app-azure-blob",
    name: "Azure Blob",
    version: "5.1.2",
    category: "Storage",
    usage_count: 67,
    dependencies: ["Azure AD", "Azure Monitor"],
    created_at: "2026-03-22T11:15:00.000Z",
    status: "pending"
  },
  {
    app_id: "app-chatgpt-api",
    name: "ChatGPT API",
    version: "1.8.4",
    category: "AI",
    usage_count: 121,
    dependencies: ["OpenAI Platform", "Webhook Service"],
    created_at: "2026-03-24T07:45:00.000Z",
    status: "active"
  }
];
