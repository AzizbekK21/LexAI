import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import { messages } from "@shared/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export async function addHelpfulField() {
  try {
    await db.execute(sql`
      ALTER TABLE messages 
      ADD COLUMN IF NOT EXISTS helpful BOOLEAN DEFAULT FALSE;
    `);
    console.log("✅ Added helpful field to messages table");
  } catch (error) {
    console.error("Error adding helpful field:", error);
    throw error;
  }
}
