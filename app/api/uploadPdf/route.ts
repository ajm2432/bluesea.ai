import { NextRequest, NextResponse } from 'next/server'; // Import NextRequest and NextResponse
import fetch from 'node-fetch';
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Handle POST requests
export async function POST(req: NextRequest) {
  const { pdfUrl, query } = await req.json(); // Parse JSON body from request

  try {
    // Fetch PDF from the URL
    const pdfResponse = await fetch(pdfUrl);
    if (!pdfResponse.ok) {
      throw new Error(`Failed to fetch PDF: ${pdfResponse.statusText}`);
    }

    // Convert PDF to base64
    const arrayBuffer = await pdfResponse.arrayBuffer();
    const pdfBase64 = Buffer.from(arrayBuffer).toString('base64');

    // Send the API request to Claude with the PDF in base64 format
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
                data: pdfBase64,
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

    // Return the response from Claude
    return NextResponse.json({ reply: response }); // Send JSON response

  } catch (error: unknown) {
    // Assert error as an instance of Error to access message
    if (error instanceof Error) {
      console.error("Error in Claude API request:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 }); // Handle errors and return status
    } else {
      // If error is not an instance of Error, handle the unexpected error
      console.error("Unexpected error:", error);
      return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
  }
}

// Handle other HTTP methods (e.g., GET, DELETE, etc.)
export function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 }); // Method Not Allowed
}
