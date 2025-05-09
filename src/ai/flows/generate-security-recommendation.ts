
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
import {UserSchema} from '@/types'; // Import UserSchema
import {z} from 'genkit';

const SecurityRecommendationInputSchema = z.object({
  userContext: z
    .string()
    .describe('Information about the current user and their role.'),
  systemContext: z
    .string()
    .describe('Details about the system configuration and current security policies.'),
  allUsers: z.array(UserSchema).describe('A list of all users in the system.'),
});
export type SecurityRecommendationInput = z.infer<typeof SecurityRecommendationInputSchema>;

const SecurityRecommendationOutputSchema = z.object({
  recommendation: z
    .string()
    .describe('A specific, actionable recommendation to improve system security. (1 sentence max)'),
  rationale:
    z.string().describe('The reasoning behind the recommendation and potential benefits. (1-2 sentences max)'),
  priority: z.enum(['low', 'medium', 'high']).describe('The priority of the recommendation.'),
  affectedUserIds: z.array(z.string()).optional().describe("IDs of users specifically affected by this recommendation. Omit or return empty array if general or no specific users are identifiable."),
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

  Based on the user's context, the current system configuration, and the provided list of all users, provide a specific and actionable recommendation to improve system security.
  The recommendation should be **1 sentence maximum**.
  The rationale should be **1-2 sentences maximum**.

  User Context: {{{userContext}}}
  System Context: {{{systemContext}}}
  All Users Data (for analysis): {{{json allUsers}}}

  If your recommendation specifically targets a subset of users based on their properties (e.g., users with 'Low' MFA policy, users in a specific department lacking certain configurations), identify these users from the 'allUsers' data and return their 'id's in the 'affectedUserIds' array.
  If the recommendation is general or no specific users are identifiable as directly non-compliant or needing immediate attention based on the recommendation, return an empty array for 'affectedUserIds' or omit the field.

  Format your response as a JSON object matching the schema. The priority should be either low, medium, or high.`,
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

    