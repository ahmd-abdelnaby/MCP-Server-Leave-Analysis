import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function analyzeReasonHandler(args: any) {
  const { reason, leave_type } = args;

  if (!process.env.GEMINI_API_KEY) {
    return {
      content: [{
        type: 'text',
        text: "Gemini API key not configured. Skipping advanced reason analysis."
      }]
    };
  }

  const prompt = `
    Analyze the following employee leave request reason and provide a brief sentiment and risk assessment.
    
    Leave Type: ${leave_type}
    Reason: "${reason}"
    
    Please return a JSON object with:
    1. "sentiment": (e.g., 'Positive', 'Neutral', 'Stressed', 'Urgent')
    2. "risk_level": (0-10, where 10 is high risk of burnout or attrition)
    3. "manager_note": (A brief suggestion for the manager on how to respond with empathy)
    4. "is_vague": (Boolean, true if the reason is too brief to analyze properly)
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Attempt to extract JSON from the response (sometimes Gemini wraps in markdown blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw_response: responseText };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(analysis, null, 2)
      }]
    };
  } catch (err: any) {
    return {
      content: [{
        type: 'text',
        text: `Error analyzing reason with Gemini: ${err.message}`
      }]
    };
  }
}
