// Health check - static page since this is a static export
export const dynamic = "force-static";

export function GET() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
