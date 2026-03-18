import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_API_KEY || 'AIzaSyA09P38shDRn5iTfuxkj0qKs77fec1DnTU'
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Test API Error:', errorText)
      return NextResponse.json({ 
        error: 'API key test failed',
        status: response.status,
        details: errorText
      }, { status: response.status })
    }
    
    const data = await response.json()
    return NextResponse.json({ 
      success: true,
      models: data.models?.map((model: { name: string }) => model.name) || [],
      message: 'API key is working'
    })
    
  } catch (error) {
    console.error('Test route error:', error)
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
