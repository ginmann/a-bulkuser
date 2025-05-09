
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, MfaPolicy, mfaPolicyOptions } from "@/types";
import { UploadCloud } from "lucide-react";

interface ImportCsvDialogProps {
  onImportUsers: (users: Omit<User, "id">[]) => void;
}

export function ImportCsvDialog({ onImportUsers }: ImportCsvDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type !== "text/csv") {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a CSV file.",
        });
        setFile(null);
        if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        return;
      }
      setFile(selectedFile);
    }
  };

  const parseCSV = (csvText: string): Omit<User, "id">[] => {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) {
        throw new Error("CSV file must contain a header row and at least one data row.");
    }
    const headers = lines[0].split(",").map(header => header.trim().toLowerCase());
    const requiredHeaders = ["username", "firstname", "lastname", "email", "department", "mfapolicy", "identitymapping"];
    
    // Check for required headers (case-insensitive and allowing for slight variations)
    const lowerCaseHeaders = headers.map(h => h.toLowerCase().replace(/\s+/g, ''));
    const missingHeaders = requiredHeaders.filter(rh => !lowerCaseHeaders.includes(rh));

    if (missingHeaders.length > 0) {
      throw new Error(`Missing required CSV headers: ${missingHeaders.join(", ")}. Expected: ${requiredHeaders.join(', ')}`);
    }
    
    const users: Omit<User, "id">[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",");
      const userObject: any = {};
      headers.forEach((header, index) => {
        const cleanHeader = header.toLowerCase().replace(/\s+/g, ''); // normalize header
        userObject[cleanHeader] = values[index] ? values[index].trim() : "";
      });

      // Validate and map to User type
      if (!userObject.username || !userObject.firstname || !userObject.lastname || !userObject.email || !userObject.department || !userObject.mfapolicy || !userObject.identitymapping) {
        console.warn(`Skipping row ${i+1} due to missing essential data: ${lines[i]}`);
        continue;
      }
      if (!mfaPolicyOptions.includes(userObject.mfapolicy as MfaPolicy)) {
        console.warn(`Skipping row ${i+1} due to invalid MFA policy: ${userObject.mfapolicy}. Defaulting to Medium or consider fixing data.`);
        userObject.mfapolicy = "Medium"; // Or skip, or throw specific error
      }


      users.push({
        username: userObject.username,
        firstName: userObject.firstname, // CSV header "firstname" maps to "firstName"
        lastName: userObject.lastname,   // CSV header "lastname" maps to "lastName"
        email: userObject.email,
        department: userObject.department,
        mfaPolicy: userObject.mfapolicy as MfaPolicy,
        identityMapping: userObject.identitymapping,
      });
    }
    return users;
  };


  const handleSubmit = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No File Selected",
        description: "Please select a CSV file to import.",
      });
      return;
    }

    setIsParsing(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          if (!text) throw new Error("File content is empty or unreadable.");
          const parsedUsers = parseCSV(text);
          onImportUsers(parsedUsers);
          setIsOpen(false);
          setFile(null);
          if(fileInputRef.current) fileInputRef.current.value = "";
        } catch (parseError: any) {
          toast({
            variant: "destructive",
            title: "CSV Parsing Error",
            description: parseError.message || "Failed to parse CSV file. Please check the format.",
          });
        } finally {
          setIsParsing(false);
        }
      };
      reader.onerror = () => {
        toast({
            variant: "destructive",
            title: "File Read Error",
            description: "Could not read the selected file.",
          });
        setIsParsing(false);
      }
      reader.readAsText(file);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: error.message || "An unexpected error occurred during import.",
      });
      setIsParsing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        setFile(null); // Reset file when dialog closes
        if(fileInputRef.current) fileInputRef.current.value = "";
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UploadCloud className="mr-2 h-5 w-5" /> Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Import Users from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with user data. Required columns: username, firstName, lastName, email, department, mfaPolicy, identityMapping.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="csv-file">CSV File</Label>
            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} ref={fileInputRef} />
            {file && <p className="text-sm text-muted-foreground mt-1">Selected file: {file.name}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => {
             setIsOpen(false); 
             setFile(null); 
             if(fileInputRef.current) fileInputRef.current.value = "";
            }}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!file || isParsing}>
            {isParsing ? "Importing..." : "Import Users"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
