import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json()
    
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // In production, this would send an email or save to database
    console.log('Contact form submission:', { name, email, message })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Thank you for reaching out! I will get back to you soon.' 
    })
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
