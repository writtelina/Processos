import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const improveTextWithAI = async (currentText: string, context: string): Promise<string> => {
  if (!apiKey) {
    console.warn("API Key is missing. Returning original text.");
    return currentText;
  }

  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      Você é um assistente especializado em redação técnica formal para a Embrapa (Empresa Brasileira de Pesquisa Agropecuária).
      
      Tarefa: Reescreva e melhore o seguinte texto para torná-lo mais formal, claro e conciso, mantendo o sentido original.
      Contexto da seção: ${context}
      
      Texto original:
      "${currentText}"
      
      Retorne apenas o texto reescrito, sem aspas e sem comentários adicionais.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text?.trim() || currentText;
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    return currentText;
  }
};

export const generateTopicContent = async (topicTitle: string): Promise<string> => {
    if (!apiKey) return "";

    try {
        const model = "gemini-2.5-flash";
        const prompt = `
          Escreva um parágrafo genérico de preenchimento (lorem ipsum em português mas com sentido técnico) para um relatório da Embrapa.
          O título do tópico é: "${topicTitle}".
          O texto deve parecer profissional e técnico.
          Retorne apenas o texto do parágrafo.
        `;
    
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
        });
    
        return response.text?.trim() || "";
      } catch (error) {
        console.error("Error generating content:", error);
        return "";
      }
}
