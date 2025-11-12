import { GoogleGenAI, Type } from "@google/genai";
import { AdventureTurn } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        story: {
            type: Type.STRING,
            description: "이야기의 다음 부분. 1-2 문단 길이로, 몰입감 있는 2인칭 시점 서술 스타일로 작성되어야 합니다. 장면, 감정, 사건을 묘사해주세요.",
        },
        imagePrompt: {
            type: Type.STRING,
            description: "현재 장면, 캐릭터, 분위기를 생생하게 포착하는 이미지 생성기를 위한 상세하고 설명적인 프롬프트. 시각적 요소에 집중해주세요.",
        },
        choices: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "플레이어가 선택할 수 있는 3개의 의미 있는 선택지 배열. 각 선택은 다른 결과로 이어져야 합니다.",
        },
        inventory: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "플레이어의 현재 인벤토리. 이야기 속 사건에 따라 아이템을 추가하거나 제거하세요. 변경 사항이 없으면 현재 인벤토리를 그대로 반환하세요.",
        },
        quest: {
            type: Type.STRING,
            description: "플레이어의 현재 주요 퀘스트 또는 목표. 이야기가 새로운 목표로 진행되면 업데이트하세요.",
        },
    },
    required: ["story", "imagePrompt", "choices", "inventory", "quest"],
};

const getSystemInstruction = (storyHistory: string[], currentInventory: string[], currentQuest: string): string => `
당신은 무한 텍스트 기반의 '선택형 어드벤처 게임'의 AI 던전 마스터입니다. 당신의 목표는 플레이어의 선택에 동적으로 반응하는 깊이 있고 일관성 있는 이야기를 만드는 것입니다.
사용자는 지금까지의 이야기, 현재 상태, 그리고 최근 선택을 제공합니다.
당신의 임무는 모험의 다음 차례를 생성하는 것입니다.

- 이야기는 이전 사건을 기반으로 계속 이어져야 합니다.
- 당신의 응답은 제공된 스키마를 엄격하게 준수하는 단일 JSON 객체여야 합니다. 추가적인 텍스트나 마크다운 서식을 추가하지 마세요.
- 작성하는 'story'는 2인칭 시점이어야 합니다 (예: "당신은 어두운 동굴로 걸어 들어갑니다...").
- 'imagePrompt'는 장면을 생성하기에 적합하도록 설명적이어야 합니다.
- 이야기에 큰 영향을 미칠 의미 있는 'choices'를 정확히 3개 제공하세요.
- 'story'의 새로운 사건에 따라 'inventory'와 'quest'를 업데이트하세요.

현재 상태:
- 퀘스트: ${currentQuest}
- 인벤토리: ${currentInventory.join(', ')}
- 지금까지의 이야기: ${storyHistory.join(' -> ')}
`;

export const generateAdventureTurn = async (
    storyHistory: string[],
    currentInventory: string[],
    currentQuest: string,
    playerChoice: string | null,
): Promise<AdventureTurn> => {
    
    const contents = playerChoice
        ? `플레이어가 "${playerChoice}"를 선택했습니다. 이야기를 계속하세요.`
        : "모험의 시작입니다. 새롭고 독창적인 판타지 이야기를 한국어로 시작하세요.";

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: contents }] }],
        config: {
            systemInstruction: getSystemInstruction(storyHistory, currentInventory, currentQuest),
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.9,
        },
    });
    
    try {
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        return parsedJson as AdventureTurn;
    } catch (e) {
        console.error("Failed to parse JSON response:", response.text);
        throw new Error("AI가 유효하지 않은 응답을 반환했습니다. 다시 시도해 주세요.");
    }
};

export const generateImage = async (prompt: string): Promise<string> => {
    // Add a consistent art style to every prompt
    const artisticPrompt = `A digital painting of: ${prompt}, in a vibrant, detailed, epic fantasy art style.`;

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: artisticPrompt,
        config: {
            numberOfImages: 1,
            aspectRatio: '16:9',
            outputMimeType: 'image/jpeg',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    
    throw new Error("이미지 생성에 실패했습니다.");
};