    import { isNativePlatform } from '@/config/environment'
import { ai } from '@/services/ai'

export interface WeddingEntitiesResult {
  heading: string | null
  names: {
    name1: string | null
    name2: string | null
    method?: string
  }
  text_without_heading?: string
}
export async function extractWeddingEntities(text: string): Promise<WeddingEntitiesResult | null> {
  // Localhost Ollama is typically unavailable on native mobile.
  if (isNativePlatform()) return null

  if (!text?.trim()) {
    return { heading: null, names: { name1: null, name2: null, method: 'ollama' } }
  }

  try {
    const result = await ai.extractFields<{
      heading: string | null
      name1: string | null
      name2: string | null
      text_without_heading: string | null
    }>({
      prompt: text,
      fields: [
        {
          key: 'heading',
          type: 'string',
          description: 'Short title/heading if the user included one (e.g., "Congratulations" / "Wedding Day"), otherwise null.'
        },
        {
          key: 'name1',
          type: 'string',
          description: 'First person name, if present, otherwise null.'
        },
        {
          key: 'name2',
          type: 'string',
          description: 'Second person name, if present, otherwise null.'
        },
        {
          key: 'text_without_heading',
          type: 'string',
          description: 'The prompt text with any heading removed, otherwise null.'
        }
      ]
    })

    return {
      heading: result.heading ?? null,
      names: {
        name1: result.name1 ?? null,
        name2: result.name2 ?? null,
        method: 'ollama'
      },
      text_without_heading: result.text_without_heading ?? undefined
    }
  } catch {
    return null
  }
}
