import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    // Naver sends parameters in the query string or body.
    // Documentation suggests query string even for POST, but let's check both.
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const clientId = searchParams.get("clientId");
    const encryptUniqueId = searchParams.get("encryptUniqueId");
    const timestamp = searchParams.get("timestamp"); // Milliseconds?
    const signature = searchParams.get("signature");

    // Also check body if needed (x-www-form-urlencoded)
    // const body = await req.formData();

    if (!clientId || !encryptUniqueId || !timestamp || !signature) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    if (clientId !== process.env.AUTH_NAVER_ID) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    // Signature Verification (Disclaimer: Specific Construction needs verification from Naver Docs)
    // Common Pattern: HmacSHA256(clientId + "_" + timestamp, clientSecret) in Base64Url or Base64
    // We will log this for now.

    console.log(
      `[Naver Disconnect] Received request for user (encrypted): ${encryptUniqueId}`
    );

    // TODO: Decrypt encryptUniqueId to find the user in DB and delete/unlink.
    // The decryption algorithm requires referencing Naver's official guide "5.4.2 Encryption of User Unique ID".

    // Validate timestamp (prevent replay attacks)
    // const now = Date.now();
    // if (Math.abs(now - parseInt(timestamp)) > 300000) { ... }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Naver Disconnect] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Sometimes callbacks are checked via GET
  return POST(req);
}
