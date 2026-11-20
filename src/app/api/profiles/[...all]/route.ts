import type { NextRequest } from "next/server";
import { proxyToExpress } from "@/lib/proxy";

export const dynamic = "force-dynamic";

export const GET = (req: NextRequest) => proxyToExpress(req);
export const POST = (req: NextRequest) => proxyToExpress(req);
export const PUT = (req: NextRequest) => proxyToExpress(req);
export const PATCH = (req: NextRequest) => proxyToExpress(req);
export const DELETE = (req: NextRequest) => proxyToExpress(req);
export const OPTIONS = (req: NextRequest) => proxyToExpress(req);
export const HEAD = (req: NextRequest) => proxyToExpress(req);
