// /api/review.js — Vercel Serverless Function
// Proxies resume analysis requests to the Claude API so the API key stays server-side.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { resumeText, pdfBase64, jobDescription } = req.body

  if (!resumeText && !pdfBase64) {
    return res.status(400).json({ error: 'No resume provided' })
  }

  const instructions = `You are an expert resume reviewer. Analyze the resume and return ONLY valid JSON. No markdown, no backticks, no text before or after.

{"score":<0-100>,"summary":"<2 sentences>","issues":[{"icon":"<emoji>","title":"<title>","description":"<advice>","severity":"<critical|warning|tip>"}],"suggestions":[{"original":"<exact resume text>","suggestion":"<improved version>"}],"strengths":["<str1>","<str2>","<str3>"]}

Rules: Brutally honest. 3-6 issues by severity. 2-4 line rewrites from ACTUAL resume text. Score: 90+ exceptional, 70-89 good, 50-69 needs work, <50 major revision. Focus on impact metrics, action verbs, ATS keywords, specificity.`

  const jdNote = jobDescription ? `\n\nJOB DESCRIPTION TO MATCH AGAINST:\n${jobDescription}` : ''

  let messages
  if (pdfBase64) {
    messages = [{
      role: 'user',
      content: [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
        { type: 'text', text: instructions + jdNote },
      ],
    }]
  } else {
    messages = [{ role: 'user', content: `${instructions}\n\nRESUME:\n${resumeText}${jdNote}` }]
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages,
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error('Claude API error:', response.status, errBody)
      return res.status(502).json({ error: 'AI service error' })
    }

    const data = await response.json()
    const text = data.content?.map(b => b.type === 'text' ? b.text : '').join('') || ''

    if (!text) return res.status(502).json({ error: 'Empty response from AI' })

    const clean = text.replace(/```json|```/g, '').trim()
    const jsonStart = clean.indexOf('{')
    const jsonEnd = clean.lastIndexOf('}')
    if (jsonStart === -1) return res.status(502).json({ error: 'Invalid AI response' })

    const parsed = JSON.parse(clean.substring(jsonStart, jsonEnd + 1))
    return res.status(200).json(parsed)
  } catch (err) {
    console.error('Review error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
