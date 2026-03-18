import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, deepSearch = false, hasImage = false } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_API_KEY || 'AIzaSyA09P38shDRn5iTfuxkj0qKs77fec1DnTU'
    
    // First, let's test if the API key is valid by listing available models
    try {
      const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
      if (!modelsResponse.ok) {
        console.error('Models API Error:', await modelsResponse.text())
        return NextResponse.json({ error: 'Invalid API key or API not enabled' }, { status: 401 })
      }
    } catch (error) {
      console.error('API Key validation failed:', error)
    }
    
    // Enhanced prompt for deep search
    let enhancedMessage = message
    if (deepSearch) {
      enhancedMessage = `Please provide a comprehensive and detailed response to this question with deep research and analysis: ${message}. Include relevant context, examples, and current information.`
    }
    
    if (hasImage) {
      enhancedMessage = `Please analyze the uploaded image in detail and respond to: ${message}. Describe what you see in the image and provide relevant insights.`
    }
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: enhancedMessage
          }]
        }],
        generationConfig: {
          temperature: deepSearch ? 0.3 : 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: deepSearch ? 2048 : 1024,
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API Error Status:', response.status)
      console.error('Gemini API Error Response:', errorText)
      return NextResponse.json(
        { error: `Failed to generate response from AI service: ${response.status}` }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const aiResponse = data.candidates[0].content.parts[0].text
      return NextResponse.json({ response: aiResponse })
    } else {
      return NextResponse.json(
        { error: 'No valid response from AI service' }, 
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
