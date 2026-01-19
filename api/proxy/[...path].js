import https from 'https'

export default async function handler(req, res) {
  try {
    const path = req.query.path ? "/" + req.query.path.join("/") : ""

    const targetUrl = new URL(path, "https://www.kgma.kg/ru/json/schedule").toString()

    // Игнорируем ошибки SSL
    const agent = new https.Agent({
      rejectUnauthorized: false
    })

    const resp = await fetch(targetUrl, { agent })
    const data = await resp.text()

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Content-Type", "application/json; charset=utf-8")
    res.status(resp.status).send(data)
  } catch (e) {
    console.error("Fetch failed:", e)
    res.status(500).json({ error: String(e) })
  }
}
