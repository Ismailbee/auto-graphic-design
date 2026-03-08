import { ref } from 'vue';
import axios from 'axios';

export function useDeepSeek() {
  const isAnalyzing = ref(false);
  const error = ref<string | null>(null);

  const analyzeText = async (text: string, context?: string, systemPrompt?: string): Promise<string> => {
    isAnalyzing.value = true;
    error.value = null;

    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

    if (!apiKey) {
      isAnalyzing.value = false;
      return "DeepSeek API key not configured. Using raw OCR text.";
    }

    const defaultSystemPrompt = "You are a helpful AI assistant for a design application. Your goal is to help users extract information from text, refine it, or generate design ideas.";

    try {
      const response = await axios.post(
        'https://api.deepseek.com/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: systemPrompt || defaultSystemPrompt
            },
            {
              role: 'user',
              content: context ? `Context: ${context}\n\nText to analyze: ${text}` : text
            }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );

      if (response.data && response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content.trim();
      } else {
        throw new Error("Invalid response format from DeepSeek API");
      }

    } catch (err: any) {
      console.error('DeepSeek API Error:', err);
      error.value = err.response?.data?.error?.message || err.message || "An error occurred during analysis.";
      return `Error analyzing text: ${error.value}`;
    } finally {
      isAnalyzing.value = false;
    }
  };

  return {
    analyzeText,
    isAnalyzing,
    error
  };
}
