import dotenv from "dotenv";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand
} from "@aws-sdk/lib-dynamodb";
import { sampleApplications } from "./sampleData.js";

dotenv.config();

const useMockData = process.env.USE_MOCK_DATA === "true";
const tableName = process.env.APPLICATIONS_TABLE || "Applications";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      : undefined
});

const documentClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true
  }
});

const mockStore = new Map(sampleApplications.map((app) => [app.app_id, app]));

const sortByCreatedAtDesc = (items) =>
  [...items].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

export const dbConfig = {
  useMockData,
  tableName
};

export const getAllApplications = async () => {
  if (useMockData) {
    return sortByCreatedAtDesc([...mockStore.values()]);
  }

  const response = await documentClient.send(
    new ScanCommand({
      TableName: tableName
    })
  );

  return sortByCreatedAtDesc(response.Items || []);
};

export const getApplicationById = async (appId) => {
  if (useMockData) {
    return mockStore.get(appId) || null;
  }

  const response = await documentClient.send(
    new GetCommand({
      TableName: tableName,
      Key: { app_id: appId }
    })
  );

  return response.Item || null;
};

export const saveApplication = async (application) => {
  if (useMockData) {
    mockStore.set(application.app_id, application);
    return application;
  }

  await documentClient.send(
    new PutCommand({
      TableName: tableName,
      Item: application
    })
  );

  return application;
};

export const removeApplication = async (appId) => {
  if (useMockData) {
    const existing = mockStore.get(appId) || null;
    mockStore.delete(appId);
    return existing;
  }

  const existing = await getApplicationById(appId);

  await documentClient.send(
    new DeleteCommand({
      TableName: tableName,
      Key: { app_id: appId }
    })
  );

  return existing;
};
