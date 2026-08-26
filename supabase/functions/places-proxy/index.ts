import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'

const GOOGLE_MAPS_API_KEY = (Deno.env.get('GOOGLE_MAPS_API_KEY') || '').trim()

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('GOOGLE_MAPS_API_KEY not configured')
    }

    const { action, params } = await req.json()

    if (!action) {
      return new Response(
        JSON.stringify({ error: '缺少必要參數 (action)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let result: Response

    switch (action) {
      case 'autocomplete': {
        const body: Record<string, unknown> = {
          input: params.input,
          includedPrimaryTypes: ['restaurant', 'food', 'cafe', 'meal_takeaway', 'meal_delivery'],
          languageCode: 'zh-TW',
        }

        if (params.locationBias) {
          body.locationBias = {
            circle: {
              center: {
                latitude: params.locationBias.latitude,
                longitude: params.locationBias.longitude,
              },
              radius: 5000.0,
            },
          }
        }

        result = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
          },
          body: JSON.stringify(body),
        })
        break
      }

      case 'details': {
        result = await fetch(
          `https://places.googleapis.com/v1/places/${params.placeId}?languageCode=zh-TW`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
              'X-Goog-FieldMask':
                'displayName,formattedAddress,rating,id,photos,priceLevel,currentOpeningHours,userRatingCount,googleMapsUri,types,location,addressComponents',
            },
          }
        )
        break
      }

      case 'photo': {
        const photoUrl = `https://places.googleapis.com/v1/${params.photoName}/media?maxWidthPx=${params.maxWidth || 400}&key=${GOOGLE_MAPS_API_KEY}`
        result = await fetch(photoUrl)

        if (!result.ok) {
          return new Response(
            JSON.stringify({ error: `Photo fetch error (${result.status})` }),
            { status: result.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Return the photo binary with proper content type
        const photoBody = await result.arrayBuffer()
        const contentType = result.headers.get('content-type') || 'image/jpeg'
        return new Response(photoBody, {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400',
          },
        })
      }

      default:
        return new Response(
          JSON.stringify({ error: `未知的 action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    if (!result.ok) {
      const errorText = await result.text()
      console.error(`[places-proxy] ${action} error:`, errorText)
      return new Response(
        JSON.stringify({ error: `Google Places API 錯誤 (${result.status})` }),
        { status: result.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await result.json()
    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[places-proxy] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || '伺服器錯誤' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
