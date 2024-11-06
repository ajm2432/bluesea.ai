import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { pdfBase64, query } = await req.json();

  try {
    // Validate required fields
    if (!pdfBase64 || !query) {
      throw new Error('Missing required fields: pdfBase64 or query');
    }

    // Check if the base64 string includes the data URL prefix (optional)
    const base64Data = pdfBase64.startsWith('data:') 
      ? pdfBase64.split(',')[1] // Remove the data URL prefix if present
      : pdfBase64;

    if (!base64Data) {
      throw new Error('Invalid base64 data');
    }


    // Send the API request to Claude
    const response = await anthropic.beta.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      betas: ["pdfs-2024-09-25"],
      max_tokens: 1024,
      messages: [
        {
          content: [
            {
              type: 'document',
              source: {
                media_type: 'application/pdf',
                type: 'base64',
                data: base64Data, // Use cleaned base64 data
              },
            },
            {
              type: 'text',
              text: query,
            },
          ],
          role: 'user',
        },
      ],
    });

    // Extract the raw text response
    const textContent = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join(" ");

    console.log("Raw Response: ", textContent);

    // Construct a JSON object with the text content and other relevant fields
    const jsonResponse = {
      reply: textContent,    // The raw text content
      status: "success",     // Include status
      timestamp: new Date().toISOString(),  // Timestamp of the response
    };

    // Return the response in JSON format
    return NextResponse.json(jsonResponse);

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error in Claude API request:", error.message);
      return NextResponse.json({ error: error.message, status: "error" }, { status: 500 });
    } else {
      console.error("Unexpected error:", error);
      return NextResponse.json({ error: 'An unexpected error occurred.', status: "error" }, { status: 500 });
    }
  }
}

export function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
