// Preserve existing crawler links while using one canonical native sitemap.
export function GET() {
  return Response.redirect('https://dash10studio.com/sitemap.xml', 308)
}
