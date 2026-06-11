export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  // Ambil backend URL
  let backendUrlStr = context.env.ACTUAL_BACKEND_URL || "http://52.77.218.147:8000";
  
  // Cloudflare Workers tidak mengizinkan fetch ke raw IP (Error 1003).
  // Kita harus me-resolve IP menjadi domain. Gunakan sslip.io / nip.io
  // Contoh: http://52.77.218.147:8000 -> http://52-77-218-147.nip.io:8000
  const ipRegex = /http(s)?:\/\/([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)(:[0-9]+)?/;
  const match = backendUrlStr.match(ipRegex);
  if (match) {
    const scheme = match[1] ? "https" : "http";
    const ipDash = `${match[2]}-${match[3]}-${match[4]}-${match[5]}`;
    const port = match[6] || "";
    backendUrlStr = `${scheme}://${ipDash}.nip.io${port}`;
  }

  const targetPath = url.pathname.replace(/^\/api/, '');
  const targetUrl = new URL(targetPath + url.search, backendUrlStr);

  const request = new Request(targetUrl, context.request);

  try {
    const response = await fetch(request);
    return response;
  } catch (err) {
    return new Response(JSON.stringify({ detail: "Proxy Error", error: err.message }), { 
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
}
