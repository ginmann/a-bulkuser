"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MfaPolicy, mfaPolicyOptions } from "@/types";

interface BulkEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUserCount: number;
  onBulkEdit: (field: "mfaPolicy" | "department", value: string) => void;
}

type EditableField = "mfaPolicy" | "department";

export function BulkEditDialog({
  isOpen,
  onOpenChange,
  selectedUserCount,
  onBulkEdit,
}: BulkEditDialogProps) {
  const [fieldToEdit, setFieldToEdit] = useState<EditableField>("department");
  const [departmentValue, setDepartmentValue] = useState("");
  const [mfaPolicyValue, setMfaPolicyValue] = useState<MfaPolicy>("Medium");

  const handleSave = () => {
    if (fieldToEdit === "department") {
      if (departmentValue.trim() === "") return; // Basic validation
      onBulkEdit("department", departmentValue);
    } else {
      onBulkEdit("mfaPolicy", mfaPolicyValue);
    }
    onOpenChange(false);
    setDepartmentValue(""); // Reset for next time
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bulk Edit Users</DialogTitle>
          <DialogDescription>
            Update {selectedUserCount} selected user(s). Choose a field and
            enter the new value.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="field" className="text-right">
              Field
            </Label>
            <Select
              value={fieldToEdit}
              onValueChange={(value) => setFieldToEdit(value as EditableField)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select field to edit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="department">Department</SelectItem>
                <SelectItem value="mfaPolicy">MFA Policy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {fieldToEdit === "department" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="departmentValue" className="text-right">
                Department
              </Label>
              <Input
                id="departmentValue"
                value={departmentValue}
                onChange={(e) => setDepartmentValue(e.target.value)}
                className="col-span-3"
                placeholder="Enter new department"
              />
            </div>
          )}
          {fieldToEdit === "mfaPolicy" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mfaPolicyValue" className="text-right">
                MFA Policy
              </Label>
              <Select
                value={mfaPolicyValue}
                onValueChange={(value) => setMfaPolicyValue(value as MfaPolicy)}
              >
                <SelectTrigger id="mfaPolicyValue" className="col-span-3">
                  <SelectValue placeholder="Select MFA Policy" />
                </SelectTrigger>
                <SelectContent>
                  {mfaPolicyOptions.map((policy) => (
                    <SelectItem key={policy} value={policy}>
                      {policy}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
