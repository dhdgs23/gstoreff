'use server';

/**
 * @fileOverview This file defines a Genkit flow for a customer FAQ chatbot.
 *
 * - `customerFAQChatbot` - A function that processes customer questions and returns answers.
 * - `CustomerFAQChatbotInput` - The input type for the `customerFAQChatbot` function.
 * - `CustomerFAQChatbotOutput` - The return type for the `customerFAQChatbot` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomerFAQChatbotInputSchema = z.object({
  question: z
    .string()
    .describe('The customer support question. Be specific about order delays due to redeem code processing.'),
});
export type CustomerFAQChatbotInput = z.infer<typeof CustomerFAQChatbotInputSchema>;

const CustomerFAQChatbotOutputSchema = z.object({
  answer: z.string().describe('The answer to the customer support question.'),
});
export type CustomerFAQChatbotOutput = z.infer<typeof CustomerFAQChatbotOutputSchema>;

export async function customerFAQChatbot(input: CustomerFAQChatbotInput): Promise<CustomerFAQChatbotOutput> {
  return customerFAQChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customerFAQChatbotPrompt',
  input: {schema: CustomerFAQChatbotInputSchema},
  output: {schema: CustomerFAQChatbotOutputSchema},
  prompt: `You are a customer support chatbot for Garena Gears, a gaming shop website where users can buy Free Fire game items at discounted prices.

  Answer the following question:
  {{question}}

  Be especially helpful regarding potential delays due to redeem code processing, and offer alternatives for immediate top-up. Always be polite and professional.
`,
});

const customerFAQChatbotFlow = ai.defineFlow(
  {
    name: 'customerFAQChatbotFlow',
    inputSchema: CustomerFAQChatbotInputSchema,
    outputSchema: CustomerFAQChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
