// 파일 경로: api/classify.js
export default async function handler(req, res) {
  // CORS (같은 도메인 호출이라도 안전하게 둠)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  try {
    // body 파싱 (문자열/JSON 모두 대응)
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {}
    }
    const image = body && body.image;
    if (!image) return res.status(400).json({ error: 'no image' });

    const api = `https://classify.roboflow.com/${process.env.DATASET}/${process.env.VERSION}?api_key=${process.env.ROBOFLOW_API_KEY}`;

    const rf = await fetch(api, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: image // 순수 base64 문자열
    });

    const text = await rf.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    return res.status(rf.status).send(text);
  } catch (e) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ error: e.message || 'proxy error' });
  }
}
