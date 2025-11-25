// src/utils/translate.ts
export async function aiTranslate(text: string) {
  const { apiToken } = await chrome.storage.local.get("apiToken");
  if (!apiToken) throw new Error("Missing API Token");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiToken}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // 或你要的模型
      messages: [
        { role: "system", content: "You are a translator." },
        { role: "user", content: `翻译成中文：${text}` }
      ]
    })
  });

  const data = await res.json();
  return data.choices[0].message.content;
}
