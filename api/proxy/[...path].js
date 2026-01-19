export default async function handler(req, res) {
  try {
    // путь после /proxy
    const path = req.query.path
      ? "/" + req.query.path.join("/")
      : ""

    // целевой URL
    const targetUrl = `https://www.kgma.kg/ru/json/schedule${path}`

    // запрос к оригинальному серверу
    const resp = await fetch(targetUrl)

    const data = await resp.text()

    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Content-Type", "application/json; charset=utf-8")

    res.status(resp.status).send(data)
  } catch (e) {
    res.status(500).json({
      error: String(e),
    })
  }
}
