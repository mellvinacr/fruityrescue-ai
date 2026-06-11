export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  // IP EC2 backend kita. Bisa juga di-override via env ACTUAL_BACKEND_URL di Cloudflare
  const backendUrl = context.env.ACTUAL_BACKEND_URL || "http://52.77.218.147:8000";
  
  // Buang prefix "/api" dari request frontend
  const targetPath = url.pathname.replace(/^\/api/, '');
  const targetUrl = new URL(targetPath + url.search, backendUrl);

  const request = new Request(targetUrl, context.request);

  try {
    const response = await fetch(request);
    
    // Opsional: kita bisa memodifikasi response headers di sini jika perlu
    return response;
  } catch (err) {
    return new Response(JSON.stringify({ detail: "Proxy Error", error: err.message }), { 
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
}
