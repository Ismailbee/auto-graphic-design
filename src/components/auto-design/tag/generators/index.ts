/**
 * Tag Generators Index
 * Export all tag template generators
 */

export { generateTag1, TAG1_CONFIG, type Tag1Config } from './tag1Generator'
export { generateTag2, TAG2_CONFIG, type Tag2Config } from './tag2Generator'
export { generateTag3, TAG3_CONFIG, type Tag3Config } from './tag3Generator'
export { generateTag4, TAG4_CONFIG, type Tag4Config } from './tag4Generator'
export { generateTag5, TAG5_CONFIG, type Tag5Config } from './tag5Generator'
export { generateTag6, TAG6_CONFIG, type Tag6Config } from './tag6Generator'
export { generateTag7, TAG7_CONFIG, type Tag7Config } from './tag7Generator'
export { generateTag8, TAG8_CONFIG, type Tag8Config, hasMoreBackgrounds, getRemainingBackgroundCount, getTotalBackgroundCount, resetUsedBackgrounds } from './tag8Generator'

import type { TagTemplateType } from '../utils/tagTemplateUtils'
import type { TagFormData, ExtractedTagInfo } from '../types'
import { isYearTheme, shouldUseYearConcept, overlayYearConcept } from '../utils/yearConceptUtils'
import { generateTag1, TAG1_CONFIG } from './tag1Generator'
import { generateTag2, TAG2_CONFIG } from './tag2Generator'
import { generateTag3, TAG3_CONFIG } from './tag3Generator'
import { generateTag4, TAG4_CONFIG } from './tag4Generator'
import { generateTag5, TAG5_CONFIG } from './tag5Generator'
import { generateTag6, TAG6_CONFIG } from './tag6Generator'
import { generateTag7, TAG7_CONFIG } from './tag7Generator'
import { generateTag8, TAG8_CONFIG, hasMoreBackgrounds, getRemainingBackgroundCount, getTotalBackgroundCount, resetUsedBackgrounds } from './tag8Generator'

/**
 * Template configuration map
 */
export const TEMPLATE_CONFIGS = {
  'tag.svg': TAG1_CONFIG,
  'tag2.svg': TAG2_CONFIG,
  'tag3.svg': TAG3_CONFIG,
  'tag4.svg': TAG4_CONFIG,
  'tag5.svg': TAG5_CONFIG,
  'tag6.svg': TAG6_CONFIG,
  'tag7.svg': TAG7_CONFIG,
  'tag8.svg': TAG8_CONFIG
} as const

/**
 * Get display name for a template
 */
export function getTemplateDisplayName(templateName: TagTemplateType): string {
  return TEMPLATE_CONFIGS[templateName]?.displayName || templateName
}

/**
 * Generate preview for any template
 */
export async function generateTagPreview(
  templateName: TagTemplateType,
  svg: SVGSVGElement,
  formData: TagFormData,
  extractedInfo: ExtractedTagInfo,
  hasUserImage: boolean,
  userImageSrc: string | null
): Promise<void> {
  switch (templateName) {
    case 'tag.svg':
      await generateTag1(svg, formData, extractedInfo, hasUserImage, userImageSrc)
      break
    case 'tag2.svg':
      await generateTag2(svg, formData, extractedInfo, hasUserImage, userImageSrc)
      break
    case 'tag3.svg':
      await generateTag3(svg, formData, extractedInfo, hasUserImage, userImageSrc)
      break
    case 'tag4.svg':
      await generateTag4(svg, formData, extractedInfo, hasUserImage, userImageSrc)
      break
    case 'tag5.svg':
      await generateTag5(svg, formData, extractedInfo, hasUserImage, userImageSrc)
      break
    case 'tag6.svg':
      await generateTag6(svg, formData, extractedInfo, hasUserImage, userImageSrc)
      break
    case 'tag7.svg':
      await generateTag7(svg, formData, extractedInfo, hasUserImage, userImageSrc)
      break
    case 'tag8.svg':
      await generateTag8(svg, formData, extractedInfo, hasUserImage, userImageSrc)
      break
    default:
      console.warn(`Unknown template: ${templateName}, using default tag.svg`)
      await generateTag1(svg, formData, extractedInfo, hasUserImage, userImageSrc)
  }

  // ── Year Concept Overlay ─────────────────────────────────────────────────
  // When the theme is a year (e.g., "2026", "2028"), optionally overlay a
  // decorative year concept SVG from the 202-concept folder instead of plain text.
  // This doesn't happen every time — shouldUseYearConcept() adds randomness
  // so that some tags show the year as normal text for variety.
  const year = isYearTheme(formData.theme || '')
  if (year && shouldUseYearConcept()) {
    console.log(`🎆 Theme "${formData.theme}" detected as year ${year} — attempting concept overlay…`)
    const success = await overlayYearConcept(svg, year, templateName)
    if (success) {
      console.log(`✅ Year concept overlay applied for ${year}`)
    } else {
      console.log(`ℹ️ Year concept overlay skipped — keeping normal theme text`)
    }
  }
}
