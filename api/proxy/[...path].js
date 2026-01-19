// api/proxy/[...path].js
import fetch from 'node-fetch';
import https from 'https';

export default async function handler(req, res) {
  try {
    console.log("Incoming query:", req.query);

    // Путь после /api/proxy/ без ведущего слэша
    const path = req.query.path ? req.query.path.join("/") : "";
    console.log("Computed path:", path);

    // Формируем корректный URL через WHATWG URL
    // Добавляем слэш в base, чтобы path добавился корректно
    const baseUrl = new URL("https://www.kgma.kg/ru/json/schedule/");
    const targetUrl = new URL(path, baseUrl).toString();
    console.log("Target URL:", targetUrl);

    // Игнорируем ошибки SSL
    const agent = new https.Agent({ rejectUnauthorized: false });

    // Делаем fetch
    const resp = await fetch(targetUrl, { agent });
    console.log("Fetch status:", resp.status);

    const data = await resp.text();
    console.log("Response length:", data.length);

    // Отправляем клиенту
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(resp.status).send(data);

  } catch (e) {
    console.error("Fetch failed:", e);
    res.status(500).json({ error: String(e) });
  }
}
