import dotenv from "dotenv";
import { saveApplication } from "./db.js";
import { sampleApplications } from "./sampleData.js";

dotenv.config();

const seed = async () => {
  for (const application of sampleApplications) {
    await saveApplication(application);
  }

  console.log(`Seeded ${sampleApplications.length} applications`);
};

seed().catch((error) => {
  console.error("Failed to seed sample data", error);
  process.exit(1);
});
