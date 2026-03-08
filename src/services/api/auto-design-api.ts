// src/services/auto-design-api.ts
import type { 
  GenerateDesignRequest, 
  GenerateDesignResponse,
  GetProjectsResponse,
  AutoDesignProject 
} from '@/types/auto-design'

const BASE_URL = import.meta.env.VITE_AUTO_DESIGN_API_URL || 'http://localhost:3002/api/auto-design'

/**
 * Generate a new design
 */
export async function generateDesign(request: GenerateDesignRequest): Promise<GenerateDesignResponse> {
  try {
    const response = await fetch(`${BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to generate design')
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    console.error('Generate design error:', error)
    throw error
  }
}

/**
 * Render design (final high-quality version)
 */
export async function renderDesign(projectId: string): Promise<{ success: boolean; project: AutoDesignProject }> {
  try {
    const response = await fetch(`${BASE_URL}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ projectId })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to render design')
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    console.error('Render design error:', error)
    throw error
  }
}

/**
 * Get user's design projects
 */
export async function getProjects(
  userId: string,
  options?: {
    limit?: number
    offset?: number
    category?: string
    status?: string
  }
): Promise<GetProjectsResponse> {
  try {
    const params = new URLSearchParams({
      userId,
      limit: String(options?.limit || 20),
      offset: String(options?.offset || 0),
      ...(options?.category && { category: options.category }),
      ...(options?.status && { status: options.status })
    })

    const response = await fetch(`${BASE_URL}/projects?${params}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch projects')
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    console.error('Get projects error:', error)
    throw error
  }
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${BASE_URL}/projects/${projectId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete project')
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    console.error('Delete project error:', error)
    throw error
  }
}

/**
 * Retouch design (modify existing design)
 */
export async function retouchDesign(
  projectId: string,
  changes: {
    text?: Record<string, string>
    colors?: { primary: string; secondary: string }
    removeBackground?: boolean
  }
): Promise<{ success: boolean; project: AutoDesignProject }> {
  try {
    const response = await fetch(`${BASE_URL}/retouch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ projectId, changes })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to retouch design')
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    console.error('Retouch design error:', error)
    throw error
  }
}

/**
 * Create more variations of a design
 */
export async function createMoreVariations(
  projectId: string,
  count: number = 3
): Promise<{ success: boolean; projects: AutoDesignProject[] }> {
  try {
    const response = await fetch(`${BASE_URL}/create-more`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ projectId, count })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create variations')
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    console.error('Create variations error:', error)
    throw error
  }
}

/**
 * Download design
 */
export async function downloadDesign(
  projectId: string,
  format: 'png' | 'jpeg' | 'pdf' = 'png'
): Promise<Blob> {
  try {
    const response = await fetch(`${BASE_URL}/download/${projectId}?format=${format}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to download design')
    }

    const blob = await response.blob()
    return blob
  } catch (error: any) {
    console.error('Download design error:', error)
    throw error
  }
}

/**
 * Upload file to server
 */
export async function uploadFile(file: File, type: 'logo' | 'image' | 'background'): Promise<{ url: string }> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to upload file')
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    console.error('Upload file error:', error)
    throw error
  }
}

