// api/proxy/[...path].js
import fetch from 'node-fetch';
import https from 'https';

export default async function handler(req, res) {
  try {
    // Путь после /api/proxy/
    const path = req.query.path ? "/" + req.query.path.join("/") : "";

    // Формируем URL через WHATWG URL
    const targetUrl = new URL(path, "https://www.kgma.kg/ru/json/schedule").toString();

    // https.Agent с игнорированием ошибок SSL
    const agent = new https.Agent({ rejectUnauthorized: false });

    // Делаем fetch через node-fetch
    const resp = await fetch(targetUrl, { agent });
    const data = await resp.text();

    // Отправляем с CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(resp.status).send(data);
  } catch (e) {
    console.error("Fetch failed:", e);
    res.status(500).json({ error: String(e) });
  }
}
