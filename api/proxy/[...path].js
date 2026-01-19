// api/proxy/[...path].js
export default async function handler(req, res) {
  try {
    // Получаем путь после /api/proxy/
    const path = req.query.path ? "/" + req.query.path.join("/") : ""

    // Формируем полный URL через WHATWG URL
    const targetUrl = new URL(path, "https://www.kgma.kg/ru/json/schedule").toString()

    // Делаем fetch
    const resp = await fetch(targetUrl)
    const data = await resp.text()

    // Отправляем с CORS
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Content-Type", "application/json; charset=utf-8")
    res.status(resp.status).send(data)
  } catch (e) {
    console.error("Fetch failed:", e)
    res.status(500).json({ error: String(e) })
  }
}
