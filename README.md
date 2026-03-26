# Intelligent Cloud Application Catalog System

A production-ready, hackathon-friendly full-stack project for managing cloud applications with a React dashboard, Express REST API, AWS Lambda support, and AWS DynamoDB integration.

## Folder Structure

```text
cloud-app-catalog/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── applicationController.js
│   │   ├── routes/
│   │   │   └── applicationRoutes.js
│   │   ├── db.js
│   │   ├── app.js
│   │   ├── lambda.js
│   │   ├── localServer.js
│   │   ├── sampleData.js
│   │   └── seedSampleData.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.production
└── README.md
```

## Backend Setup

1. Open the `backend` folder.
2. Install dependencies:

```bash
npm install
```

3. Update `backend/.env`:

```env
USE_MOCK_DATA=false
APPLICATIONS_TABLE=Applications
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=YOUR_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET
PORT=4000
```

4. Start the API:

```bash
npm start
```

For AWS Lambda deployment, the handler file is:

```text
src/lambda.handler
```

### API Endpoints

- `GET /getApps`
- `POST /addApp`
- `PUT /updateApp`
- `DELETE /deleteApp`
- `GET /search?name=`
- `GET /filter?category=`
- `GET /recommend?app_id=`
- `GET /analytics`

### Sample Data

Included in `backend/src/sampleData.js`:

- AWS Lambda
- Azure Blob
- ChatGPT API

Seed DynamoDB manually with the sample objects or run:

```bash
npm run seed
```

If you want to demo the app before connecting AWS, temporarily set:

```env
USE_MOCK_DATA=true
```

## Frontend Setup

1. Open the `frontend` folder.
2. Install dependencies:

```bash
npm install
```

3. For local development, create a `.env` file in `frontend` with:

```env
VITE_API_BASE_URL=http://localhost:4000
```

4. Start the app:

```bash
npm run dev
```

## AWS DynamoDB Deployment

### Step 1: Create the DynamoDB Table

1. Open AWS Console.
2. Go to DynamoDB.
3. Create a table named `Applications`.
4. Set the partition key to `app_id` with type `String`.
5. Keep default capacity settings unless you want custom scaling.

### Step 2: Add Sample Data

Add these sample items manually or use the seed script after setting backend credentials:

```json
[
  {
    "app_id": "app-aws-lambda",
    "name": "AWS Lambda",
    "version": "2.3.0",
    "category": "Compute",
    "usage_count": 94,
    "dependencies": ["CloudWatch", "IAM"],
    "created_at": "2026-03-20T09:30:00.000Z",
    "status": "active"
  },
  {
    "app_id": "app-azure-blob",
    "name": "Azure Blob",
    "version": "5.1.2",
    "category": "Storage",
    "usage_count": 67,
    "dependencies": ["Azure AD", "Azure Monitor"],
    "created_at": "2026-03-22T11:15:00.000Z",
    "status": "pending"
  },
  {
    "app_id": "app-chatgpt-api",
    "name": "ChatGPT API",
    "version": "1.8.4",
    "category": "AI",
    "usage_count": 121,
    "dependencies": ["OpenAI Platform", "Webhook Service"],
    "created_at": "2026-03-24T07:45:00.000Z",
    "status": "active"
  }
]
```

## Backend Deployment on AWS Lambda

Use AWS Lambda + API Gateway for the backend.

### Step 1: Prepare the Backend

1. Open the `backend` folder.
2. Install dependencies:

```bash
npm install
```

3. Confirm your Lambda entrypoint:

```text
src/lambda.handler
```

### Step 2: Create the Lambda Function

1. Open the AWS Console.
2. Go to Lambda.
3. Create a new function.
4. Choose:
   `Author from scratch`
5. Runtime:
   `Node.js 20.x` or the latest supported Node.js runtime
6. Function name:
   `cloud-app-catalog-api`

### Step 3: Upload the Backend

Package the `backend` folder contents as a ZIP.

Important:
- Zip the contents of `backend`, not the parent folder.
- The ZIP should contain `package.json`, `node_modules`, and `src/` at the root.

Then upload that ZIP to Lambda.

### Step 4: Configure the Lambda Handler

Set the handler to:

```text
src/lambda.handler
```

### Step 5: Add Lambda Environment Variables

In the Lambda configuration, add:

```env
USE_MOCK_DATA=false
APPLICATIONS_TABLE=Applications
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=YOUR_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET
```

If you attach an IAM role with DynamoDB permissions, you should avoid hardcoding AWS keys and can omit:

```env
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

### Step 6: Attach Permissions

Give the Lambda execution role DynamoDB permissions for the `Applications` table.

Minimum required actions:
- `dynamodb:Scan`
- `dynamodb:GetItem`
- `dynamodb:PutItem`
- `dynamodb:DeleteItem`

### Step 7: Create API Gateway

1. Open API Gateway.
2. Create an `HTTP API`.
3. Integrate it with the Lambda function `cloud-app-catalog-api`.
4. Add routes for:
   `GET /health`
   `GET /getApps`
   `POST /addApp`
   `PUT /updateApp`
   `DELETE /deleteApp`
   `GET /search`
   `GET /filter`
   `GET /recommend`
   `GET /analytics`
5. Enable CORS in API Gateway if needed for your Vercel frontend domain.

### Step 8: Test the Backend

After deployment, test:

```text
https://YOUR_API_GATEWAY_URL/getApps
https://YOUR_API_GATEWAY_URL/analytics
```

## Frontend Deployment on Vercel

1. Push the `frontend` folder to GitHub.
2. Import the project in Vercel.
3. Set the root directory to `frontend`.
4. Add:

```env
VITE_API_BASE_URL=https://YOUR_API_GATEWAY_URL
```

5. Deploy.

## Final Test Checklist

- Add application
- Update application
- Delete application
- Search by name
- Filter by category
- Load recommendations
- View analytics charts

## Notes

- The backend uses AWS SDK v3 with `DynamoDBClient` and `DynamoDBDocumentClient`.
- The backend supports both local Express development and AWS Lambda deployment through `serverless-http`.
- The frontend uses plain CSS for a colorful dashboard-style UI and `recharts` for analytics.
- The code is intentionally simple and hackathon-ready while still structured for deployment.
