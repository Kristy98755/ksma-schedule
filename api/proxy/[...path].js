// api/proxy/[...path].js
import fetch from 'node-fetch';
import https from 'https';

export default async function handler(req, res) {
  try {
    console.log("Incoming query:", req.query);

    // Путь после /api/proxy/ без ведущего слэша
    const path = req.query.path ? req.query.path.join("/") : "";
    console.log("Computed path:", path);

    // Формируем полный URL
    const targetUrl = `https://www.kgma.kg/ru/json/schedule/${path}`;
    console.log("Target URL:", targetUrl);

    // Игнорируем SSL ошибки
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
