import { Client } from "pg";

const CONNECTION_STRING =
  "postgresql://postgres.okmfbttsndraqogrrszh:Tkjeon3670!@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1";

async function testConnection() {
  console.log("🔌 Testing connection to Transaction Pooler...");
  console.log(`URL: ${CONNECTION_STRING.replace(/:([^:@]+)@/, ":****@")}`);

  const client = new Client({
    connectionString: CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }, // Relax SSL for testing
  });

  try {
    await client.connect();
    console.log("✅ Connection Successful!");

    const res = await client.query("SELECT NOW()");
    console.log("Query Results:", res.rows[0]);

    await client.end();
  } catch (err: any) {
    console.error("❌ Connection Failed:", err.message);
    if (err.code) console.error("Error Code:", err.code);
    if (err.detail) console.error("Detail:", err.detail);
  }
}

testConnection();
