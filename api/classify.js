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

    // 데모 응답 (실제 API 연결 전 테스트용)
    const diseases = [
      "Bacterial_spot", "Early_blight", "Late_blight",
      "Leaf_Mold", "Septoria_leaf_spot", "Spider_mites",
      "Target_Spot", "Yellow_Leaf_Curl_Virus", "Mosaic_virus", "Healthy"
    ];

    // 랜덤 결과 생성
    const randomResults = diseases
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((disease, index) => ({
        class: disease,
        confidence: Math.max(0.95 - (index * 0.15), 0.1)
      }));

    const mockResponse = {
      predictions: randomResults,
      top: randomResults[0]
    };

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(mockResponse);
  } catch (e) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ error: e.message || 'proxy error' });
  }
}
