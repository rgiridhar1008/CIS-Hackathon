# Intelligent Cloud Application Catalog System

A full-stack serverless application for managing, discovering, and analyzing cloud applications through a unified dashboard.

This project is built using React for the frontend and AWS services (Lambda, API Gateway, DynamoDB) for the backend, providing a scalable and production-ready architecture.

---
## Live Demo

https://cis-hackathon.vercel.app/

---

## Overview

The system allows users to maintain a catalog of cloud applications, perform search and filtering operations, view analytics, and receive recommendations based on application categories.

---

## Features

* Create, update, and delete application records
* Search applications by name
* Filter applications by category
* Category-based recommendation engine
* Real-time analytics including usage metrics and distribution
* Serverless backend architecture
* Responsive frontend interface

---

## Architecture

Frontend (Vercel)
→ API Gateway
→ AWS Lambda
→ DynamoDB

---

## Technology Stack

### Frontend

* React (Vite)
* JavaScript
* CSS

### Backend

* Node.js (AWS Lambda)
* API Gateway
* DynamoDB

---

## Project Structure

```text
cloud-application-catalog/
│
├── frontend/        # React application
├── backend/         # Lambda functions and API logic
├── README.md
└── .gitignore
```

---

## Environment Configuration

Create a `.env` file in the frontend directory with the following variable:

```env
VITE_API_BASE_URL=https://your-api-gateway-url/dev
```

---

## Local Setup

### Clone the Repository

```bash
git clone https://github.com/rgiridhar1008/CIS-Hackathon.git
cd CIS-Hackathon
```

---

### Install Dependencies

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Backend (optional local execution)

```bash
cd backend
npm install
npm run start
```

---

## Deployment

### Frontend Deployment (Vercel)

* Import the GitHub repository into Vercel
* Set Root Directory to `frontend`
* Configure environment variable:

  ```
  VITE_API_BASE_URL=https://your-api-gateway-url/dev
  ```
* Deploy the project

---

### Backend Deployment (AWS)

* Deploy the Lambda function
* Connect Lambda with API Gateway
* Enable CORS in API Gateway
* Configure DynamoDB table
* Assign appropriate IAM permissions

---

## API Endpoints

| Method | Endpoint   | Description               |
| ------ | ---------- | ------------------------- |
| GET    | /getApps   | Retrieve all applications |
| POST   | /addApp    | Add a new application     |
| PUT    | /updateApp | Update an application     |
| DELETE | /deleteApp | Delete an application     |
| GET    | /search    | Search by name            |
| GET    | /filter    | Filter by category        |
| GET    | /recommend | Get recommendations       |
| GET    | /analytics | Retrieve analytics data   |

---

## Security Considerations

* Environment variables are not committed to version control
* AWS credentials are managed securely through IAM
* Sensitive configuration is excluded using `.gitignore`

---

## Future Enhancements

* Advanced recommendation system using machine learning
* Improved data visualization using charts
* Authentication and user management
* Role-based access control

---
