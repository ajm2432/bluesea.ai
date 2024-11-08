import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { z } from 'zod';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Define schema for the response
const responseSchema = z.object({
  response: z.string(),
  thinking: z.string(),
  user_mood: z.enum([
    "positive",
    "neutral",
    "negative",
    "curious",
    "frustrated",
    "confused",
  ]),
  suggested_questions: z.array(z.string()),
  debug: z.object({
    context_used: z.boolean(),
  }),
  status: z.string(),
  timestamp: z.string(),
});

function sanitizeAndParseJSON(jsonString: string) {
  const sanitized = jsonString.replace(/(?<=:\s*")(.|\n)*?(?=")/g, (match) =>
    match.replace(/\n/g, "\\n")
  );

  try {
    return JSON.parse(sanitized);
  } catch (parseError) {
    console.error("Error parsing JSON response:", parseError);
    throw new Error("Invalid JSON response from AI");
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { pdfBase64, query } = await req.json();

    if (!pdfBase64 || !query) {
      throw new Error("Missing required fields: pdfBase64 or query");
    }

    const base64Data = pdfBase64.startsWith('data:')
      ? pdfBase64.split(',')[1]
      : pdfBase64;

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
                data: base64Data,
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

    const textContent = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join(" ");

    const structuredResponse = {
      thinking: "Providing insights based on PDF content.",
      response: textContent,
      user_mood: "curious",
      suggested_questions: ["What are the document's key points?", "Can you summarize more details?"],
      debug: {
        context_used: !!response.content.length,
      },
      status: "success",
      timestamp: new Date().toISOString(),
    };

    const validatedResponse = responseSchema.parse(structuredResponse);

    return NextResponse.json(validatedResponse);

  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      {
        response: "An error occurred while processing your request.",
        thinking: "Error occurred in response generation.",
        user_mood: "neutral",
        suggested_questions: [],
        debug: { context_used: false },
        status: "error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
