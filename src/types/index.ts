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
