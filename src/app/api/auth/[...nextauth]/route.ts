import { handlers } from "../../../../auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  if (!url.pathname.startsWith("/en")) {
    url.pathname = `/en${url.pathname}`;
  }
  const newReq = new NextRequest(url, req);
  return (handlers.GET as any)(newReq);
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  if (!url.pathname.startsWith("/en")) {
    url.pathname = `/en${url.pathname}`;
  }
  const newReq = new NextRequest(url, req);
  return (handlers.POST as any)(newReq);
}

export async function generateStaticParams() {
  return [];
}
