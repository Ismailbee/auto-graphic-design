import { OllamaClient, type OllamaMessage } from './ollama.client'
import { extractFirstJsonBlock, safeJsonParse } from './json.util'

export interface AIServiceConfig {
  /** Default model used if not provided per-call. */
  model?: string
  /** Default timeout for requests. */
  timeoutMs?: number
}

export interface AIJsonCallOptions {
  model?: string
  temperature?: number
  timeoutMs?: number
}

export interface IntentResult {
  intent: string
  confidence: number
  reasoning?: string
  entities?: Record<string, unknown>
}

export type ExtractFieldType = 'string' | 'number' | 'boolean' | 'date' | 'enum'

export interface ExtractField {
  key: string
  type: ExtractFieldType
  description: string
  required?: boolean
  enumValues?: string[]
}

function buildJsonOnlySystemPrompt(task: string): string {
  return [
    'You are a precise information extraction engine.',
    'Return ONLY valid JSON. No prose. No markdown. No code fences.',
    'If a field is unknown, return null (do not guess).',
    task
  ].join('\n')
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.max(0, Math.min(1, value))
}

export class AIService {
  private readonly client: OllamaClient
  private readonly config: Required<AIServiceConfig>

  constructor(client?: OllamaClient, config: AIServiceConfig = {}) {
    const envModel = (import.meta as any).env?.VITE_OLLAMA_MODEL as string | undefined
    const envTimeout = (import.meta as any).env?.VITE_OLLAMA_TIMEOUT_MS as string | undefined

    this.client = client ?? new OllamaClient()
    this.config = {
      model: config.model ?? envModel ?? 'qwen2.5:0.5b',
      timeoutMs: config.timeoutMs ?? (envTimeout ? Number(envTimeout) : 60_000)
    }
  }

  async chatText(params: {
    system?: string
    user: string
    model?: string
    temperature?: number
    timeoutMs?: number
    maxTokens?: number
  }): Promise<string> {
    const messages: OllamaMessage[] = []
    if (params.system) messages.push({ role: 'system', content: params.system })
    messages.push({ role: 'user', content: params.user })

    const resp = await this.client.chat(
      {
        model: params.model ?? this.config.model,
        messages,
        stream: false,
        options: {
          temperature: params.temperature ?? 0.3,  // Lower = faster, more deterministic
          num_predict: params.maxTokens ?? 150,    // Limit output tokens for speed
          top_k: 20,                                // Faster sampling
          top_p: 0.9,                               // Nucleus sampling
          repeat_penalty: 1.1                       // Reduce repetition
        }
      },
      { timeoutMs: params.timeoutMs ?? this.config.timeoutMs }
    )

    return resp.message?.content ?? ''
  }

  /**
   * Strongly encourages JSON-only output and parses it.
   * If the model adds extra text, attempts to extract the first JSON block.
   */
  async json<T>(params: {
    task: string
    user: string
    exampleJson?: unknown
    options?: AIJsonCallOptions
  }): Promise<T> {
    const system = buildJsonOnlySystemPrompt(params.task)
    const user = [
      params.user,
      params.exampleJson ? `\n\nExample JSON shape (not data):\n${JSON.stringify(params.exampleJson, null, 2)}` : ''
    ].join('')

    const text = await this.chatText({
      system,
      user,
      model: params.options?.model,
      temperature: params.options?.temperature,
      timeoutMs: params.options?.timeoutMs
    })

    const direct = safeJsonParse<T>(text)
    if (direct.ok) return direct.value

    const extracted = extractFirstJsonBlock(text)
    if (extracted) {
      const parsed = safeJsonParse<T>(extracted)
      if (parsed.ok) return parsed.value
    }

    throw new Error(`AI JSON parse failed: ${direct.ok ? '' : direct.error}`)
  }

  /**
   * General intent detection.
   * Provide `intents` to constrain the model; otherwise it can propose a label.
   */
  async detectIntent(params: {
    prompt: string
    intents?: string[]
    context?: string
    options?: AIJsonCallOptions
  }): Promise<IntentResult> {
    const allowed = params.intents?.length ? params.intents : null

    const task = [
      'Task: Determine the user intent and extract any relevant entities.',
      allowed ? `Allowed intents: ${allowed.join(', ')}` : 'If no allowed intents are provided, use a short snake_case label.',
      'Return JSON with keys: intent (string), confidence (0..1), reasoning (string), entities (object).'
    ].join('\n')

    const result = await this.json<IntentResult>({
      task,
      user: [
        params.context ? `Context:\n${params.context}\n\n` : '',
        `User prompt:\n${params.prompt}`
      ].join(''),
      exampleJson: { intent: allowed?.[0] ?? 'some_intent', confidence: 0.7, reasoning: '...', entities: { any: 'value' } },
      options: params.options
    })

    return {
      intent: String((result as any).intent ?? ''),
      confidence: clamp01(Number((result as any).confidence ?? 0)),
      reasoning: (result as any).reasoning,
      entities: (result as any).entities
    }
  }

  /**
   * Extracts a set of named fields from a prompt.
   * Good replacement for regex/manual parsing when inputs are messy.
   */
  async extractFields<T extends Record<string, unknown>>(params: {
    prompt: string
    fields: ExtractField[]
    context?: string
    options?: AIJsonCallOptions
  }): Promise<T> {
    const fieldSpec = params.fields
      .map(f => {
        const extras = f.type === 'enum' && f.enumValues?.length ? ` enum=[${f.enumValues.join(', ')}]` : ''
        const req = f.required ? ' required' : ''
        return `- ${f.key}: ${f.type}${req}${extras} — ${f.description}`
      })
      .join('\n')

    const task = [
      'Task: Extract the following fields from the user prompt.',
      'Rules: If a field is missing, return null. Do not guess. Prefer clean values (no extra words).',
      'Fields:',
      fieldSpec
    ].join('\n')

    const example: Record<string, unknown> = {}
    for (const f of params.fields) example[f.key] = null

    return await this.json<T>({
      task,
      user: [
        params.context ? `Context:\n${params.context}\n\n` : '',
        `User prompt:\n${params.prompt}`
      ].join(''),
      exampleJson: example,
      options: params.options
    })
  }
}

export const ai = new AIService()
