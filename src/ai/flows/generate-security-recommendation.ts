// src/ai/flows/generate-security-recommendation.ts
'use server';
/**
 * @fileOverview AI-driven security recommendation generator.
 *
 * - generateSecurityRecommendation - A function that generates security recommendations.
 * - SecurityRecommendationInput - The input type for the generateSecurityRecommendation function.
 * - SecurityRecommendationOutput - The return type for the generateSecurityRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SecurityRecommendationInputSchema = z.object({
  userContext: z
    .string()
    .describe('Information about the current user and their role.'),
  systemContext: z
    .string()
    .describe('Details about the system configuration and current security policies.'),
});
export type SecurityRecommendationInput = z.infer<typeof SecurityRecommendationInputSchema>;

const SecurityRecommendationOutputSchema = z.object({
  recommendation: z
    .string()
    .describe('A specific, actionable recommendation to improve system security.'),
  rationale:
    z.string().describe('The reasoning behind the recommendation and potential benefits.'),
  priority: z.enum(['low', 'medium', 'high']).describe('The priority of the recommendation.'),
});
export type SecurityRecommendationOutput = z.infer<typeof SecurityRecommendationOutputSchema>;

export async function generateSecurityRecommendation(
  input: SecurityRecommendationInput
): Promise<SecurityRecommendationOutput> {
  return generateSecurityRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'securityRecommendationPrompt',
  input: {schema: SecurityRecommendationInputSchema},
  output: {schema: SecurityRecommendationOutputSchema},
  prompt: `You are an AI assistant specialized in providing security recommendations for user account management systems.

  Based on the user's context and the current system configuration, provide a specific and actionable recommendation to improve system security.
  Explain the rationale behind the recommendation and potential benefits. The outputted recommendation should be no more than 2 sentences long. The rationale should be no more than 3.

  User Context: {{{userContext}}}
  System Context: {{{systemContext}}}

  Format your response as a JSON object matching the schema.  The priority should be either low, medium, or high.`,
});

const generateSecurityRecommendationFlow = ai.defineFlow(
  {
    name: 'generateSecurityRecommendationFlow',
    inputSchema: SecurityRecommendationInputSchema,
    outputSchema: SecurityRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
