import fetch from 'node-fetch';
import https from 'https';

export default async function handler(req, res) {
  try {
    // Получаем полный путь после /api/proxy/
    const urlParts = req.url.split("/").slice(3); // ["groups", "get"] при /api/proxy/groups/get
    console.log("URL parts:", urlParts);

    const path = urlParts.join("/");
    console.log("Computed path:", path);

    // WHATWG URL
    const baseUrl = new URL("https://www.kgma.kg/ru/json/schedule/");
    const targetUrl = new URL(path, baseUrl).toString();
    console.log("Target URL:", targetUrl);

    // SSL игнорируем
    const agent = new https.Agent({ rejectUnauthorized: false });

    const resp = await fetch(targetUrl, { agent });
    console.log("Fetch status:", resp.status);

    const data = await resp.text();
    console.log("Response length:", data.length);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(resp.status).send(data);

  } catch (e) {
    console.error("Fetch failed:", e);
    res.status(500).json({ error: String(e) });
  }
}
