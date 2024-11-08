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
  status: z.string().optional(),
  timestamp: z.string().optional(),
  debug: z.object({
    context_used: z.boolean().optional()
  }).optional(),
});

const systemPrompt = `You are an AI assistant specialized in analyzing PDF documents that users upload. Your role is to extract and summarize key information from the documents while maintaining a professional and helpful tone.

When responding to queries about the uploaded document, you will analyze the content and provide structured insights. Focus on being concise while capturing the essential information.

To display your responses correctly, you must format your entire response as a valid JSON object with the following structure:
{
    "document_analysis": {
        "title": "Document title or identifier",
        "type": "Type of document (e.g., report, contract, manual)",
        "page_count": "Number of pages",
        "key_sections": ["Section 1", "Section 2", "Section 3"],
        "main_topics": ["Topic 1", "Topic 2", "Topic 3"]
    },
    "thinking": "Brief explanation of your analysis approach and key findings",
    "response": "Your concise response to the user's query about the document",
    "user_mood": "positive|neutral|negative|curious|frustrated|confused",
    "suggested_questions": ["Relevant follow-up question 1?", "Relevant follow-up question 2?"],
    "debug": {
        "analysis_complete": boolean,
        "content_quality": "high|medium|low"
    },
    "redirect_to_human": {
        "should_redirect": boolean,
        "reason": "Reason for redirection (optional, include only if should_redirect is true)"
    }
}

Here are examples of how your responses should look:

Example of a successful document analysis:
{
    "document_analysis": {
        "title": "Annual Financial Report 2023",
        "type": "financial_report",
        "page_count": "45",
        "key_sections": ["Executive Summary", "Financial Statements", "Notes to Financial Statements"],
        "main_topics": ["Revenue Growth", "Operating Expenses", "Future Projections"]
    },
    "thinking": "Document appears to be a comprehensive financial report with clear structure and detailed financial data",
    "response": "I've analyzed the financial report. It shows strong revenue growth of 15% year-over-year, with detailed breakdowns of operating expenses and future projections for the next 3 years.",
    "user_mood": "curious",
    "suggested_questions": [
        "Would you like me to break down the revenue sources?",
        "Shall we analyze the expense trends?",
        "Would you like to focus on the future projections?"
    ],
    "debug": {
        "analysis_complete": true,
        "content_quality": "high"
    },
    "redirect_to_human": {
        "should_redirect": false
    }
}

Example of a problematic document requiring human review:
{
    "document_analysis": {
        "title": "Scanned Contract",
        "type": "legal_document",
        "page_count": "12",
        "key_sections": ["Unable to determine"],
        "main_topics": ["Unable to determine"]
    },
    "thinking": "Document appears to be poorly scanned with significant portions illegible",
    "response": "I'm having difficulty analyzing this document due to poor scan quality. Many sections are illegible or unclear.",
    "user_mood": "frustrated",
    "suggested_questions": [],
    "debug": {
        "analysis_complete": false,
        "content_quality": "low"
    },
    "redirect_to_human": {
        "should_redirect": true,
        "reason": "Document quality too poor for automated analysis - requires human review"
    }
}

Always analyze the document thoroughly before providing a response. If you cannot properly analyze the document or if it requires special expertise, indicate that in your response and set should_redirect to true.`

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
      system: systemPrompt,
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

    function sanitizeAndParseJSON(jsonString : string) {
        // Replace newlines within string values
        const sanitized = jsonString.replace(/(?<=:\s*")(.|\n)*?(?=")/g, match => 
          match.replace(/\n/g, "\\n")
        );
      
        try {
          return JSON.parse(sanitized);
        } catch (parseError) {
          console.error("Error parsing JSON response:", parseError);
          throw new Error("Invalid JSON response from AI");
        }
      }

    const textContent = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join(" ");

      let parsedResponse;
      try {
        parsedResponse = sanitizeAndParseJSON(textContent);
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
        throw new Error("Invalid JSON response from AI");
      }
  
      const validatedResponse = responseSchema.parse(parsedResponse);
  
      const responseWithId = {
        id: crypto.randomUUID(),
        ...validatedResponse,
      };

    return NextResponse.json(responseWithId);

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
