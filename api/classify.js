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

    // Workflow API 사용
    const api = `https://serverless.roboflow.com/tomato-qio6k/workflows/detect-and-classify`;

    const rf = await fetch(api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ROBOFLOW_API_KEY || 'R0L0pGImpsJ0oIk36xUo'}`
      },
      body: JSON.stringify({
        images: { image: image }
      })
    });

    const result = await rf.json();

    // Workflow API 응답을 기존 형식으로 변환
    let formattedResult;
    if (result.outputs && result.outputs.length > 0) {
      const predictions = result.outputs[0].predictions || [];
      formattedResult = {
        predictions: predictions.map(p => ({
          class: p.class || p.class_name,
          confidence: p.confidence
        })),
        top: predictions[0] ? {
          class: predictions[0].class || predictions[0].class_name,
          confidence: predictions[0].confidence
        } : null
      };
    } else {
      formattedResult = { predictions: [], top: null };
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    return res.status(rf.status).json(formattedResult);
  } catch (e) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ error: e.message || 'proxy error' });
  }
}
