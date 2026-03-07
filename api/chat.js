// api/chat.js — Vercel Serverless Function

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question, context, mode } = req.body || {};

  if (!question && mode !== "summary" && mode !== "analysis_review") {
    return res.status(400).json({ error: "Missing question" });
  }

  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: "API key not configured" });
  }

  const systemPrompts = {
    chat: `أنت "سِراج"، مستشار مهني سعودي ذكي مختص بسوق العمل السعودي ورؤية 2030.

قواعدك:
- أجب بالعربي السعودي بشكل واضح ومختصر
- كن عملياً ومحددًا
- ركّز على السوق السعودي
- لا تعطِ كلاماً عاماً
- إذا كانت البيانات ناقصة، قل ذلك بوضوح`,

    summary: `أنت سِراج، مستشار مهني سعودي.
اكتب ملخصًا قصيرًا جدًا بالعربية عن جاهزية هذا الشخص.
اذكر:
1) مستوى الجاهزية
2) أهم فجوة
3) نصيحة عملية واحدة
4) ربط بسيط بالسوق السعودي`,

    analysis_review: `أنت محرك مراجعة جاهزية مهنية سعودي داخل منتج اسمه سِراج.

مهمتك:
- راجع نتيجة جاهزية أولية محسوبة مسبقاً
- لا تتجاهل النتيجة الأولية، بل حسّنها فقط
- لا تبالغ
- كن محافظاً في التعديل
- عدّل score فقط ضمن هامش من -8 إلى +8 كحد أقصى
- أعد ترتيب أهم الفجوات إن لزم
- استنتج fit assessment مهني واضح
- أخرج JSON فقط بدون أي شرح إضافي

القواعد:
- إذا كانت البيانات قليلة، اجعل confidence منخفضة
- لا تخترع مهارات غير موجودة إلا إذا كانت inferred بشكل منطقي من الأدوات/التخصص
- اجعل الأولويات عملية
- ركّز على الوظيفة المحددة والقطاع السعودي

أخرج JSON بهذا الشكل فقط:
{
  "adjustedScore": 0,
  "topStrengths": ["", ""],
  "topGaps": ["", "", ""],
  "fitAssessment": "",
  "priorityAction": "",
  "confidenceNote": "",
  "marketInsight": ""
}`
  };

  const systemPrompt = systemPrompts[mode] || systemPrompts.chat;

  let userMessage = "";
  if (mode === "summary") {
    userMessage = `بيانات المستخدم:\n${JSON.stringify(context, null, 2)}`;
  } else if (mode === "analysis_review") {
    userMessage = `راجع هذا التحليل الأولي وأعد JSON فقط:\n${JSON.stringify(context, null, 2)}`;
  } else {
    userMessage = `السؤال: ${question}\n\nسياق المستخدم:\n${JSON.stringify(context, null, 2)}`;
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
        max_tokens: mode === "analysis_review" ? 700 : 500,
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

    if (mode === "analysis_review") {
      try {
        const jsonStart = reply.indexOf("{");
        const jsonEnd = reply.lastIndexOf("}");
        const rawJson = jsonStart >= 0 && jsonEnd >= 0 ? reply.slice(jsonStart, jsonEnd + 1) : reply;
        const parsed = JSON.parse(rawJson);
        return res.status(200).json({ review: parsed });
      } catch (e) {
        console.error("Failed to parse analysis_review JSON:", reply);
        return res.status(200).json({
          review: {
            adjustedScore: null,
            topStrengths: [],
            topGaps: [],
            fitAssessment: "",
            priorityAction: "",
            confidenceNote: "",
            marketInsight: ""
          }
        });
      }
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Serverless function error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
}
