
import { z } from 'zod';

export type MfaPolicy = "Low" | "Medium" | "High";

export const mfaPolicyOptions: MfaPolicy[] = ["Low", "Medium", "High"];

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  mfaPolicy: MfaPolicy;
  identityMapping: string;
}

// Zod schema for User, mirroring the User interface
export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  department: z.string(),
  mfaPolicy: z.enum(mfaPolicyOptions),
  identityMapping: z.string(),
});

    