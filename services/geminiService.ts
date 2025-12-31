import { GoogleGenAI, Type } from "@google/genai";
import { MenuItem } from "../types";

// Ensure API Key is available
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const getMenuRecommendation = async (
  userQuery: string,
  menuItems: MenuItem[]
): Promise<{ text: string; recommendedIds: string[] }> => {
  if (!apiKey) {
    return {
      text: "抱歉，我目前無法連接到 AI 服務 (缺少 API Key)。但我可以推薦您試試我們的主廚特製紅燒肉！",
      recommendedIds: ['r1']
    };
  }

  const menuContext = JSON.stringify(menuItems.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    category: item.category,
    spiciness: item.spiciness,
    isVegetarian: item.isVegetarian
  })));

  const systemInstruction = `
    你是一位專業、親切的中餐廳服務生。
    你的任務是根據客人的需求，從以下菜單中推薦餐點。
    
    菜單數據 (JSON):
    ${menuContext}

    規則：
    1. 只能推薦菜單上有的菜。
    2. 回答要簡短、誘人，像一位專業的服務生。
    3. 如果客人提到口味(如辣、清淡、素食)，請精確篩選。
    4. 回傳格式必須符合 Schema 要求。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyText: {
              type: Type.STRING,
              description: "給客人的親切回覆，包含推薦理由。",
            },
            recommendedItemIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "推薦餐點的 ID 列表。",
            },
          },
          required: ["replyText", "recommendedItemIds"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from Gemini");

    const result = JSON.parse(jsonText);
    return {
      text: result.replyText,
      recommendedIds: result.recommendedItemIds || [],
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "抱歉，我的大腦剛才打結了。不過我也推薦您試試我們的招牌宮保雞丁！",
      recommendedIds: ['m1']
    };
  }
};