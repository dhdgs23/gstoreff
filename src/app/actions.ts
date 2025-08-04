'use server';

import { customerFAQChatbot, type CustomerFAQChatbotInput } from '@/ai/flows/customer-faq-chatbot';

export async function askQuestion(
  input: CustomerFAQChatbotInput
): Promise<{ success: boolean; answer?: string; error?: string }> {
  try {
    const result = await customerFAQChatbot(input);
    return { success: true, answer: result.answer };
  } catch (error) {
    console.error('Error in askQuestion action:', error);
    return { success: false, error: 'Sorry, I am unable to answer at the moment. Please try again later.' };
  }
}
