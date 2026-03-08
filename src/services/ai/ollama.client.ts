export type OllamaRole = 'system' | 'user' | 'assistant' | 'tool'

export interface OllamaMessage {
  role: OllamaRole
  content: string
}

export interface OllamaChatRequest {
  model: string
  messages: OllamaMessage[]
  stream?: boolean
  options?: Record<string, unknown>
}

export interface OllamaChatResponse {
  model?: string
  created_at?: string
  message?: OllamaMessage
  done?: boolean
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  prompt_eval_duration?: number
  eval_count?: number
  eval_duration?: number
}

export interface OllamaClientOptions {
  baseUrl?: string
  defaultTimeoutMs?: number
}

function stripTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '')
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const resp = await fetch(input, {
      ...init,
      signal: init.signal ?? controller.signal
    })
    return resp
  } finally {
    clearTimeout(timeout)
  }
}

export class OllamaClient {
  private readonly baseUrl: string
  private readonly defaultTimeoutMs: number

  constructor(options: OllamaClientOptions = {}) {
    const envBase = (import.meta as any).env?.VITE_OLLAMA_BASE_URL as string | undefined
    this.baseUrl = stripTrailingSlashes(options.baseUrl ?? envBase ?? 'http://127.0.0.1:11434')
    this.defaultTimeoutMs = options.defaultTimeoutMs ?? 60_000
  }

  async chat(req: OllamaChatRequest, opts?: { timeoutMs?: number; signal?: AbortSignal }): Promise<OllamaChatResponse> {
    const url = `${this.baseUrl}/api/chat`

    const resp = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stream: false,
          ...req
        }),
        signal: opts?.signal
      },
      opts?.timeoutMs ?? this.defaultTimeoutMs
    )

    if (!resp.ok) {
      const text = await resp.text().catch(() => '')
      throw new Error(`Ollama /api/chat failed: ${resp.status} ${text}`)
    }

    return (await resp.json()) as OllamaChatResponse
  }
}
