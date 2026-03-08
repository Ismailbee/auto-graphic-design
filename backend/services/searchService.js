import { listDesigns } from './designsService.js';
import { listTemplates } from './templatesService.js';

export async function suggestSearchResults(query) {
  const term = (query ?? '').trim().toLowerCase();
  if (!term) {
    return [];
  }

  const [templates, designs] = await Promise.all([
    listTemplates(),
    listDesigns(),
  ]);

  const templateMatches = templates
    .filter((template) =>
      [template.name, template.category, ...(template.tags ?? [])]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    )
    .map((template) => ({
      id: template.id,
      type: 'template',
      title: template.name,
      description: template.category,
      tags: template.tags,
    }));

  const designMatches = designs
    .filter((design) =>
      [design.title, design.description, ...(design.tags ?? [])]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(term)),
    )
    .map((design) => ({
      id: design.id,
      type: 'design',
      title: design.title,
      description: design.description,
      tags: design.tags,
    }));

  return [...templateMatches, ...designMatches].slice(0, 25);
}
