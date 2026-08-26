const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/gemini-proxy`;

interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

interface GeminiMessage {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

async function callGeminiProxy(
  action: string,
  contents: GeminiMessage[],
  generationConfig: Record<string, unknown>
): Promise<unknown> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase 設定缺失，請確認環境變數');
  }

  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ action, contents, generationConfig }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '未知錯誤' }));
    throw new Error(error.error || `API 錯誤 (${response.status})`);
  }

  return response.json();
}

/**
 * 分析食物照片/描述，回傳熱量估算
 */
export async function analyzeCalories(
  imageBase64: string | null,
  description: string
): Promise<string> {
  const parts: GeminiPart[] = [];

  parts.push({
    text: `你是一位專業的營養師 AI 助手。請分析以下食物並估算熱量。

回覆必須是嚴格的 JSON 格式（不要加 markdown code block），結構如下：
{
  "totalCalories": 數字,
  "items": [
    { "name": "食物名稱", "calories": 數字, "protein": 數字, "carbs": 數字, "fat": 數字 }
  ],
  "summary": "一段簡短的營養建議（繁體中文）"
}

注意：
- calories 單位是 kcal
- protein, carbs, fat 單位是 g
- 請根據台灣常見份量估算
- 如果有照片，以照片為主要分析依據
- 如果只有文字描述，根據描述估算
- summary 請用繁體中文，給出實用的飲食建議`,
  });

  if (imageBase64) {
    const matches = imageBase64.match(/^data:(.+?);base64,(.+)$/);
    if (matches && matches[1] && matches[2]) {
      parts.push({
        inlineData: {
          mimeType: matches[1],
          data: matches[2],
        },
      });
    }
  }

  if (description.trim()) {
    parts.push({ text: `食物描述：${description}` });
  } else if (!imageBase64) {
    throw new Error('請提供照片或文字描述');
  }

  const data = await callGeminiProxy(
    'analyzeCalories',
    [{ role: 'user', parts }],
    { temperature: 0.3, maxOutputTokens: 4096, responseMimeType: 'application/json' }
  ) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };

  console.log('[geminiService] Calorie raw response:', JSON.stringify(data, null, 2));

  const parts_response = data.candidates?.[0]?.content?.parts;
  if (!parts_response || parts_response.length === 0) {
    throw new Error('Gemini 未回傳有效結果');
  }

  const text = parts_response.map((p) => p.text || '').join('');

  if (!text) {
    throw new Error('Gemini 未回傳有效結果');
  }

  return text;
}

/**
 * AI 聊天 - 支援多輪對話
 */
export async function chat(
  messages: GeminiMessage[],
  userMessage: string
): Promise<string> {
  const systemPrompt: GeminiPart = {
    text: `你是「美食小幫手」，一個親切的 AI 助手，專門幫助使用者處理跟美食、餐廳、路線規劃相關的問題。

你的能力包括：
- 推薦餐廳或美食
- 分析從 A 地到 B 地還是 C 地比較好（考慮距離、交通、美食選擇等）
- 回答營養和飲食相關問題
- 幫助規劃美食行程

回答風格：
- 使用繁體中文
- 簡潔明瞭，不要太冗長
- 適時使用 emoji 讓對話更生動
- 給出具體可行的建議`,
  };

  const contents: GeminiMessage[] = [];

  if (messages.length === 0) {
    contents.push({
      role: 'user',
      parts: [systemPrompt, { text: userMessage }],
    });
  } else {
    const firstMsg = messages[0]!;
    contents.push({
      role: 'user',
      parts: [systemPrompt, ...firstMsg.parts],
    });

    for (let i = 1; i < messages.length; i++) {
      contents.push(messages[i]!);
    }

    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });
  }

  const data = await callGeminiProxy(
    'chat',
    contents,
    { temperature: 0.7, maxOutputTokens: 2048 }
  ) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Gemini 未回傳有效結果');
  }

  return text;
}

export type { GeminiMessage };
