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

    // 데모 모드: API 키가 없으면 샘플 응답 반환
    if (!process.env.ROBOFLOW_API_KEY || process.env.ROBOFLOW_API_KEY === 'demo') {
      // 랜덤하게 병해 시뮬레이션
      const diseases = [
        { class: "Tomato_Bacterial_spot", confidence: 0.89 },
        { class: "Tomato_Early_blight", confidence: 0.92 },
        { class: "Tomato_Late_blight", confidence: 0.87 },
        { class: "Tomato_Leaf_Mold", confidence: 0.85 },
        { class: "Tomato_Septoria_leaf_spot", confidence: 0.91 },
        { class: "Tomato_healthy", confidence: 0.95 }
      ];

      const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];
      const demoResponse = {
        predictions: [
          randomDisease,
          { class: "Other", confidence: 0.05 },
          { class: "Unknown", confidence: 0.03 }
        ],
        top: randomDisease
      };

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json(demoResponse);
    }

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
