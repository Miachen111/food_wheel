import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'

const GEMINI_API_KEY = (Deno.env.get('GEMINI_API_KEY') || '').trim()
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'
const MODEL = 'models/gemini-3.6-flash'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    const { action, contents, generationConfig } = await req.json()

    if (!action || !contents) {
      return new Response(
        JSON.stringify({ error: '缺少必要參數 (action, contents)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Forward request to Gemini API
    const geminiResponse = await fetch(
      `${BASE_URL}/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: generationConfig || {},
        }),
      }
    )

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('[gemini-proxy] Gemini API error:', errorText)
      return new Response(
        JSON.stringify({ error: `Gemini API 錯誤 (${geminiResponse.status})` }),
        { status: geminiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await geminiResponse.json()

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[gemini-proxy] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || '伺服器錯誤' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
