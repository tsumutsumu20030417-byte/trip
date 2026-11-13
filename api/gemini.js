// api/gemini.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "APIキーが設定されていません。環境変数 GEMINI_API_KEY を設定してください。" });
  }

  try {
    const { prompt, systemInstruction, responseMimeType, responseSchema } = req.body || {};

    const models = [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ];

    let lastError = null;

    for (const model of models) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const generationConfig = {
        ...(responseMimeType && { responseMimeType }),
        ...(responseSchema && { responseSchema }),
      };

      const payload = {
        contents: [{ parts: [{ text: String(prompt || "") }] }],
        ...(systemInstruction && {
          systemInstruction: { parts: [{ text: String(systemInstruction) }] },
        }),
        ...(Object.keys(generationConfig).length > 0 && {
          generationConfig,
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

      let data;
      try {
        data = await response.json();
      } catch {
        data = { error: "Invalid JSON response from Gemini API" };
      }

      if (response.ok) {
        return res.status(200).json(data);
      }
      lastError = data;
    }

    return res.status(502).json({ error: "Gemini APIの呼び出しに失敗しました", details: lastError });
  } catch (error) {
    return res.status(500).json({ error: error?.message || "Unexpected server error" });
  }
}