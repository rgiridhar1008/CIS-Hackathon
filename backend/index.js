const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "ap-south-1" });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE = "Applications";

exports.handler = async (event) => {
  try {
    const path = event.rawPath || event.path;
    const method = event.requestContext?.http?.method;

    // ===== CORS =====
    if (method === "OPTIONS") {
      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: ""
      };
    }

    // ===== GET ALL =====
    if (path.endsWith("/getApps") && method === "GET") {
      const data = await docClient.send(new ScanCommand({ TableName: TABLE }));

      return response({
        success: true,
        count: (data.Items || []).length,
        data: data.Items || []
      });
    }

    // ===== ADD =====
    if (path.endsWith("/addApp") && method === "POST") {
      const body = JSON.parse(event.body);

      if (!body.app_id || body.app_id.trim() === "") {
        body.app_id = "app-" + Date.now();
      }

      if (!body.usage_count) body.usage_count = 0;
      if (!body.created_at) body.created_at = new Date().toISOString();

      await docClient.send(
        new PutCommand({
          TableName: TABLE,
          Item: body
        })
      );

      return response({
        success: true,
        message: "App added",
        app_id: body.app_id
      });
    }

    // ===== UPDATE =====
    if (path.endsWith("/updateApp") && method === "PUT") {
      const body = JSON.parse(event.body);

      await docClient.send(
        new UpdateCommand({
          TableName: TABLE,
          Key: { app_id: body.app_id },
          UpdateExpression:
            "set #name=:n, version=:v, category=:c, usage_count=:u",
          ExpressionAttributeNames: {
            "#name": "name"
          },
          ExpressionAttributeValues: {
            ":n": body.name,
            ":v": body.version,
            ":c": body.category,
            ":u": body.usage_count
          }
        })
      );

      return response({
        success: true,
        message: "App updated"
      });
    }

    // ===== DELETE =====
    if (path.endsWith("/deleteApp") && method === "DELETE") {
      const body = JSON.parse(event.body);

      await docClient.send(
        new DeleteCommand({
          TableName: TABLE,
          Key: { app_id: body.app_id }
        })
      );

      return response({
        success: true,
        message: "App deleted"
      });
    }

    // ===== SEARCH =====
    if (path.includes("/search") && method === "GET") {
      const name = event.queryStringParameters?.name?.toLowerCase() || "";

      const data = await docClient.send(new ScanCommand({ TableName: TABLE }));

      const result = (data.Items || []).filter(app =>
        app.name?.toLowerCase().includes(name)
      );

      return response({
        success: true,
        count: result.length,
        data: result
      });
    }

    // ===== FILTER =====
    if (path.includes("/filter") && method === "GET") {
      const category = event.queryStringParameters?.category;

      const data = await docClient.send(new ScanCommand({ TableName: TABLE }));

      const result = (data.Items || []).filter(
        app => app.category === category
      );

      return response({
        success: true,
        count: result.length,
        data: result
      });
    }

    // ===== RECOMMEND =====
    if (path.includes("/recommend") && method === "GET") {
      const app_id = event.queryStringParameters?.app_id;

      const data = await docClient.send(new ScanCommand({ TableName: TABLE }));
      const items = data.Items || [];

      const selected = items.find(a => a.app_id === app_id);

      if (!selected) {
        return response({
          success: true,
          count: 0,
          data: []
        });
      }

      const result = items
        .filter(
          a => a.category === selected.category && a.app_id !== app_id
        )
        .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));

      return response({
        success: true,
        based_on: selected,
        count: result.length,
        data: result
      });
    }

    // ===== ANALYTICS =====
    if (path.endsWith("/analytics") && method === "GET") {
      const data = await docClient.send(new ScanCommand({ TableName: TABLE }));
      const items = data.Items || [];

      const totalApps = items.length;

      const totalUsage = items.reduce(
        (sum, a) => sum + (a.usage_count || 0),
        0
      );

      const mostUsed = [...items].sort(
        (a, b) => (b.usage_count || 0) - (a.usage_count || 0)
      );

      const categoryDist = {};
      items.forEach(app => {
        categoryDist[app.category] =
          (categoryDist[app.category] || 0) + 1;
      });

      return response({
        success: true,
        data: {
          total_apps: totalApps,
          total_usage: totalUsage,
          most_used_apps: mostUsed.slice(0, 5),
          category_distribution: Object.entries(categoryDist).map(
            ([name, value]) => ({
              name,
              value
            })
          ),
          status_breakdown: []
        }
      });
    }

    return response({
      success: true,
      message: "API working"
    });

  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};

// ===== COMMON =====
function corsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*"
  };
}

function response(data) {
  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify(data)
  };
}