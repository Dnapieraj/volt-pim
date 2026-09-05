import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { getProducts } from "@/lib/catalog";
import { buildCatalogExport, type ExportFormat } from "@/lib/export-catalog";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const format: ExportFormat =
    request.nextUrl.searchParams.get("format") === "csv" ? "csv" : "xlsx";
  const products = await getProducts();
  const file = buildCatalogExport(products, format);

  return new NextResponse(new Uint8Array(file.body), {
    headers: {
      "Content-Type": file.contentType,
      "Content-Disposition": `attachment; filename="${file.filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
