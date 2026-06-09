import OpenAI from 'openai'
import { AnalyseResponse, DetectedPiece } from '@/types'

let _openai: OpenAI | null = null
function getClient() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

const SYSTEM_PROMPT = `You are a graffiti analysis assistant. Analyse the provided image and identify all graffiti pieces, tags, throw-ups, stickers, stencils, or murals visible.

For each piece found, return a JSON object with this exact structure:
{
  "pieces": [
    {
      "piece_index": 0,
      "suggested_name": "WRITERNAME or null if unreadable",
      "confidence": 0.0 to 1.0,
      "bounding_box": {
        "x": 0.0,
        "y": 0.0,
        "width": 0.0,
        "height": 0.0
      }
    }
  ]
}

IMPORTANT rules:
- bounding_box values must be normalized (0.0–1.0) relative to image dimensions
- x and y are the top-left corner of the box
- suggested_name should be the writer's tag/name if legible, null if the lettering is too stylised to read
- confidence reflects how confident you are in the name reading (not the detection)
- If no graffiti is found, return {"pieces": []}
- Return only valid JSON, no other text`

export async function analysePhoto(
  imageBase64: string,
  mimeType: string
): Promise<{ detection_id: string; pieces: DetectedPiece[] }> {
  const detection_id = `det_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

  const response = await getClient().chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
              detail: 'high',
            },
          },
          { type: 'text', text: 'Analyse this image for graffiti pieces.' },
        ],
      },
    ],
    max_tokens: 1000,
  })

  const raw = response.choices[0]?.message?.content ?? '{}'
  let parsed: { pieces?: DetectedPiece[] }

  try {
    parsed = JSON.parse(raw)
  } catch {
    parsed = { pieces: [] }
  }

  const pieces: DetectedPiece[] = (parsed.pieces ?? []).map((p, i) => ({
    piece_index: i,
    suggested_name: p.suggested_name ?? null,
    confidence: typeof p.confidence === 'number' ? p.confidence : null,
    bounding_box: p.bounding_box ?? { x: 0, y: 0, width: 1, height: 1 },
  }))

  return { detection_id, pieces }
}
