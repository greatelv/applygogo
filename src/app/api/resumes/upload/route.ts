import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabaseServer } from "@/lib/supabase";
// import pdf from "pdf-parse"; // Causing ESM issues

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // const session = { user: { id: "dev-test-user" } }; // Mock session

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // 1. Upload to Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    // Sanitize filename
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${session.user.id}/${Date.now()}_${safeName}`;
    const bucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "applygogo";

    const { error: uploadError } = await supabaseServer.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file to storage. Ensure bucket exists." },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabaseServer.storage.from(bucketName).getPublicUrl(fileName);

    // 2. Validate PDF Text Extraction
    let extractedText = "";
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfLib = require("pdf-parse");
      // Check for named export commonly found in this fork
      const PDFParse = pdfLib.default || pdfLib.PDFParse || pdfLib;

      const parser = new PDFParse({ data: buffer });
      const pdfData = await parser.getText();
      extractedText = pdfData.text;
    } catch (parseError: any) {
      console.error("PDF Parse Error:", parseError);
      return NextResponse.json(
        { error: `Invalid or corrupt PDF file: ${parseError.message}` },
        { status: 400 }
      );
    }

    // 3. Create Resume Record
    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        title: file.name,
        originalFileUrl: publicUrl,
        rawText: extractedText,
        status: "IDLE",
        currentStep: "UPLOAD",
      },
    });

    return NextResponse.json(resume);
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
