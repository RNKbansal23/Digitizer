import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini SDK
// Check if API key is provided
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: Request) {
  if (!genAI) {
    return NextResponse.json(
      { success: false, error: 'GEMINI_API_KEY environment variable is not set.' },
      { status: 500 }
    );
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // For text-only input, use the current gemini-3.6-flash model
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    const systemPrompt = `You are a helpful and professional school assistant.
A teacher has provided a short phrase or topic: "${prompt}".
Please expand this into a polite, concise, and clear WhatsApp message for parents.
Do not include any placeholders for signatures (like "[Teacher Name]" or "[School]") because the system will automatically attach the teacher's signature to the end of the message.
Just write the main body of the message. Keep it friendly and informative.`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ success: true, message: text.trim() });
  } catch (error: any) {
    console.error('Error generating announcement with Gemini:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate announcement' },
      { status: 500 }
    );
  }
}
