// api/chat.js — Vercel Serverless Function
// يستقبل السؤال من المتصفح ويرسله لـ Claude API بشكل آمن
// الـ API Key مخفي في Environment Variable على Vercel

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { question, context, mode } = req.body;
  if (!question && mode !== "summary") return res.status(400).json({ error: "Missing question" });

  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: "API key not configured" });

  // System prompts مختلفة حسب النوع
  const systemPrompts = {
    chat: `أنت "سِراج"، مستشار مهني سعودي ذكي مختص بسوق العمل السعودي ورؤية 2030.

قواعدك:
- أجب بالعربي السعودي (عامية مفهومة) بإيجاز (3-5 جمل)
- كن ودوداً ومحفزاً وعملياً
- ركّز على السوق السعودي تحديداً (أرامكو، STC، SDAIA، NEOM، القطاع المالي، الحكومي)
- اقترح خطوات عملية قابلة للتنفيذ
- إذا سُئلت عن الراتب، أعطِ نطاق واقعي بالريال
- إذا سُئلت سؤال مقابلة، اعطِ سؤال تقني حقيقي مناسب للوظيفة
- لا تكرر ما يعرفه المستخدم، أضف قيمة جديدة`,

    summary: `أنت سِراج، مستشار مهني سعودي. اكتب ملخص تنفيذي قصير (3-4 جمل) بالعربي عن جاهزية هذا الشخص لسوق العمل السعودي.

كن محفزاً وعملياً. اذكر:
1. مستوى الجاهزية العام
2. أهم فجوة يجب سدها أولاً
3. نصيحة عملية واحدة مخصصة للقطاع المختار
4. ربط بسيط برؤية 2030 أو مبادرة سعودية محددة`
  };

  const systemPrompt = systemPrompts[mode] || systemPrompts.chat;

  let userMessage;
  if (mode === "summary") {
    userMessage = `بيانات المستخدم: ${JSON.stringify(context)}`;
  } else {
    userMessage = `السؤال: ${question}\n\nسياق المستخدم: ${JSON.stringify(context)}`;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Claude API error:", err);
      return res.status(502).json({ error: "AI service unavailable" });
    }

    const data = await response.json();
    const reply = data.content?.map(c => c.text || "").join("") || "";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Serverless function error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
}
