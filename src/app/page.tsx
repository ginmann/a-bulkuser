
"use client";

import { useState, useEffect } from "react";
import { User, MfaPolicy } from "@/types";
import { UserTable } from "@/components/app/user-table";
import { AddUserDialog } from "@/components/app/add-user-dialog";
import { AiRecommendations } from "@/components/app/ai-recommendations";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

// Helper to generate more users
const generateSampleUsers = (count: number, existingUsers: User[]): User[] => {
  const newUsers: User[] = [];
  const firstNames = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Daniel", "Nancy", "Matthew", "Lisa", "Anthony", "Betty", "Donald", "Dorothy", "Mark", "Sandra", "Paul", "Ashley", "Steven", "Kimberly", "Andrew", "Donna", "Kenneth", "Emily", "George", "Carol", "Joshua", "Michelle", "Kevin", "Amanda", "Brian", "Melissa", "Edward", "Deborah", "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason", "Laura", "Jeffrey", "Sharon", "Ryan", "Cynthia"];
  const lastNames = ["Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Martin", "Jackson", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Green", "Baker", "Adams", "Nelson", "Hill", "Campbell", "Mitchell", "Roberts", "Carter", "Phillips", "Evans", "Turner", "Torres", "Parker", "Collins", "Edwards", "Stewart", "Flores", "Morris", "Nguyen", "Murphy", "Rivera", "Cook", "Rogers", "Morgan", "Peterson", "Cooper", "Reed", "Bailey"];
  const departments = ["Cardiology", "Pediatrics", "Oncology", "Neurology", "Radiology", "Surgery", "Emergency", "Internal Medicine", "Orthopedics", "Pharmacy", "Psychiatry", "Dermatology", "Urology", "Ophthalmology", "Anesthesiology", "Pathology", "Physical Therapy", "Nutrition", "Human Resources", "IT Support"];
  const mfaPolicies: MfaPolicy[] = ["Low", "Medium", "High"];
  
  const existingUsernames = new Set(existingUsers.map(u => u.username));
  const existingEmails = new Set(existingUsers.map(u => u.email));

  let attempts = 0; // To avoid infinite loop if we run out of unique names

  for (let i = 0; i < count && attempts < count * 5; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    let username = `${firstName.toLowerCase().charAt(0)}${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`;
    let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@example.com`;

    // Ensure username and email are unique
    while (existingUsernames.has(username)) {
      username = `${firstName.toLowerCase().charAt(0)}${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}`;
      attempts++;
    }
    while (existingEmails.has(email)) {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@example.com`;
      attempts++;
    }
    if (attempts >= count * 5) break; // Break if too many attempts

    existingUsernames.add(username);
    existingEmails.add(email);

    newUsers.push({
      id: String(Date.now() + Math.random() + i + existingUsers.length),
      username,
      firstName,
      lastName,
      email,
      department: departments[Math.floor(Math.random() * departments.length)],
      mfaPolicy: mfaPolicies[Math.floor(Math.random() * mfaPolicies.length)],
      identityMapping: `${Math.random() > 0.5 ? "AD" : "LDAP"}:${username}`,
    });
  }
  return newUsers;
};


// Initial mock data
const baseUsers: User[] = [
  { id: "1", username: "asmith", firstName: "Alice", lastName: "Smith", email: "alice.smith@example.com", department: "Cardiology", mfaPolicy: "High", identityMapping: "AD:asmith" },
  { id: "2", username: "bjohnson", firstName: "Bob", lastName: "Johnson", email: "bob.johnson@example.com", department: "Pediatrics", mfaPolicy: "Medium", identityMapping: "LDAP:bjohnson" },
  { id: "3", username: "cwilliams", firstName: "Carol", lastName: "Williams", email: "carol.williams@example.com", department: "Oncology", mfaPolicy: "Low", identityMapping: "AD:cwilliams" },
  { id: "4", username: "davisj", firstName: "David", lastName: "Davis", email: "david.davis@example.com", department: "Neurology", mfaPolicy: "Medium", identityMapping: "INTERNAL:davisj" },
  { id: "5", username: "emartin", firstName: "Emily", lastName: "Martin", email: "emily.martin@example.com", department: "Radiology", mfaPolicy: "High", identityMapping: "AD:emartin" },
];

const initialUsers = [...baseUsers, ...generateSampleUsers(100, baseUsers)]; // Increased to 100 (50 + 50)


export default function MediViewAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Simulate fetching users or loading from local storage
    setUsers(initialUsers);
  }, []);


  const handleAddUser = (newUser: Omit<User, "id">) => {
    setUsers((prevUsers) => [
      ...prevUsers,
      { ...newUser, id: String(Date.now() + Math.random()) }, // Simple unique ID generation
    ]);
    toast({ title: "User Added", description: `${newUser.firstName} ${newUser.lastName} has been added successfully.` });
  };

  const handleUpdateUser = (userId: string, updates: Partial<User>) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, ...updates } : user
      )
    );
    // Toast is handled in UserTable for individual cell updates
  };

  const handleDeleteUsers = (userIds: string[]) => {
    setUsers((prevUsers) =>
      prevUsers.filter((user) => !userIds.includes(user.id))
    );
    // Toast is handled in UserTable
  };
  
  const handleBulkUpdateUsers = (userIds: string[], field: "mfaPolicy" | "department", value: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (userIds.includes(user.id)) {
          if (field === "mfaPolicy") {
            return { ...user, mfaPolicy: value as MfaPolicy };
          }
          return { ...user, [field]: value };
        }
        return user;
      })
    );
    // Toast is handled in UserTable
  };

  if (!isClient) {
    // Render a loading state or null on the server to avoid hydration mismatch
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-background">
        <div className="animate-pulse">
           <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary opacity-50">
            <path d="M12.54 2.02c.45-.18.94-.18 1.39 0l8.11 3.24c.42.17.7.56.7.98v6.48c0 .42-.28.81-.7.98l-8.11 3.24c-.45.18-.94.18-1.39 0l-8.11-3.24a1.15 1.15 0 0 1-.7-.98V6.24c0-.42.28-.81.7-.98S12.54 2.02 12.54 2.02z"/>
            <path d="m6.05 6.53 11.9-.02"/>
            <path d="m19.52 17.24-15.04.04"/>
            <path d="M6.05 17.47 12 14.02l6.02-3.48"/>
            <path d="M17.98 6.24 12 9.72l-5.95-3.48"/>
           </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 hidden md:flex items-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M12.54 2.02c.45-.18.94-.18 1.39 0l8.11 3.24c.42.17.7.56.7.98v6.48c0 .42-.28.81-.7.98l-8.11 3.24c-.45.18-.94.18-1.39 0l-8.11-3.24a1.15 1.15 0 0 1-.7-.98V6.24c0-.42.28-.81.7-.98S12.54 2.02 12.54 2.02z"/>
              <path d="m6.05 6.53 11.9-.02"/><path d="m19.52 17.24-15.04.04"/>
              <path d="M6.05 17.47 12 14.02l6.02-3.48"/><path d="M17.98 6.24 12 9.72l-5.95-3.48"/>
            </svg>
            <span className="ml-2 text-xl font-bold">User Admin Prototype</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
             <AddUserDialog onAddUser={handleAddUser} />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
        <section aria-labelledby="ai-recommendations-heading">
          <h2 id="ai-recommendations-heading" className="text-2xl font-semibold tracking-tight mb-6">
            System Security Insights
          </h2>
          <AiRecommendations allUsers={users} />
        </section>

        <Separator className="my-8" />

        <section aria-labelledby="user-management-heading">
           <h2 id="user-management-heading" className="text-2xl font-semibold tracking-tight mb-6">
            User Management
          </h2>
          <UserTable 
            users={users} 
            onUpdateUser={handleUpdateUser}
            onDeleteUsers={handleDeleteUsers}
            onBulkUpdateUsers={handleBulkUpdateUsers}
          />
        </section>
      </main>

      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Your Company Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

    