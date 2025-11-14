
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { FruitTree, ChatMessage } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const treeInfoSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Nome comum da árvore frutífera em Português." },
    scientificName: { type: Type.STRING, description: "Nome científico (Latim) da árvore." },
    description: { type: Type.STRING, description: "Uma breve descrição da árvore e seus frutos, em um parágrafo." },
    care: {
      type: Type.OBJECT,
      properties: {
        sunlight: { type: Type.STRING, description: "Requisitos de luz solar, ex: 'Sol pleno (6-8 horas por dia)'." },
        watering: { type: Type.STRING, description: "Necessidades e cronograma de rega." },
        soil: { type: Type.STRING, description: "Tipo de solo ideal e pH." }
      },
      required: ["sunlight", "watering", "soil"]
    },
    pruningHarvest: { type: Type.STRING, description: "Orientações sobre quando e como podar, e quando colher os frutos." },
    pests: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Nome comum da praga." },
          description: { type: Type.STRING, description: "Breve descrição da praga e danos potenciais." }
        },
        required: ["name", "description"]
      }
    }
  },
  required: ["name", "scientificName", "description", "care", "pruningHarvest", "pests"]
};

let chat: Chat | null = null;

export const getTreeInfo = async (treeName: string): Promise<FruitTree> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Forneça informações detalhadas sobre a árvore frutífera: ${treeName}. Responda em Português do Brasil.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: treeInfoSchema,
      }
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as FruitTree;
  } catch (error) {
    console.error("Error fetching tree info from Gemini:", error);
    throw new Error("Não foi possível encontrar informações para esta árvore. Tente novamente.");
  }
};

export const startChat = (treeContext?: string) => {
    const history = treeContext ? [
        { role: 'user', parts: [{text: `Quero conversar sobre minha ${treeContext}.`}] },
        { role: 'model', parts: [{text: `Olá! Que ótimo. Sou um jardineiro experiente e estou aqui para ajudar com sua ${treeContext}. O que você gostaria de saber?`}] }
    ] : [];

    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'Você é um sábio e experiente jardineiro. Você dá conselhos amigáveis, práticos e fáceis de entender sobre o cultivo de árvores frutíferas. Seu tom é encorajador e experiente. Responda sempre em Português do Brasil.',
        },
        history: history
    });
}

export const sendMessageToGardener = async (message: string): Promise<string> => {
    if (!chat) {
        startChat();
    }
    if (!chat) {
      throw new Error("Chat not initialized");
    }

    try {
      const response = await chat.sendMessage({ message });
      return response.text;
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      throw new Error("Ocorreu um erro ao conversar com o jardineiro. Por favor, tente novamente.");
    }
}
