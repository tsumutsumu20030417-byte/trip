// api/gemini.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "APIキーが設定されていません" });
  }

  try {
    const { prompt, systemInstruction, responseMimeType } = req.body;
    // 2026年最新の高速モデルから順にフォールバック
    const models = ["gemini-3.8-flash", "gemini-3.5-flash-lite", "gemini-2.5-flash"];
    let lastError = null;

    for (const model of models) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        ...(systemInstruction && {
          systemInstruction: { parts: [{ text: systemInstruction }] },
        }),
        ...(responseMimeType && {
          generationConfig: { responseMimeType },
        }),
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        return res.status(200).json(data);
      }
      lastError = data;
    }

    return res.status(502).json({ error: "Gemini APIの呼び出しに失敗しました", details: lastError });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}