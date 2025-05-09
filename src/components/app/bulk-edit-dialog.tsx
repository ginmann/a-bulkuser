"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  availableDepartments: string[];
}

type EditableField = "mfaPolicy" | "department";

export function BulkEditDialog({
  isOpen,
  onOpenChange,
  selectedUserCount,
  onBulkEdit,
  availableDepartments,
}: BulkEditDialogProps) {
  const [fieldToEdit, setFieldToEdit] = useState<EditableField>("department");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [mfaPolicyValue, setMfaPolicyValue] = useState<MfaPolicy>("Medium");

  useEffect(() => {
    if (isOpen) {
      // Reset department selection when dialog opens or fieldToEdit changes
      if (fieldToEdit === "department" && availableDepartments.length > 0) {
        setSelectedDepartment(availableDepartments[0]);
      } else {
        setSelectedDepartment("");
      }
      // Reset MFA policy to default when dialog opens
      setMfaPolicyValue("Medium");
    }
  }, [isOpen, fieldToEdit, availableDepartments]);

  const handleSave = () => {
    if (fieldToEdit === "department") {
      if (selectedDepartment === "") return; 
      onBulkEdit("department", selectedDepartment);
    } else {
      onBulkEdit("mfaPolicy", mfaPolicyValue);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Users</DialogTitle>
          <DialogDescription>
            Update {selectedUserCount} selected user(s). Choose a field and
            select or enter the new value.
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
              <SelectTrigger className="col-span-3" id="field">
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
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
                disabled={availableDepartments.length === 0}
              >
                <SelectTrigger id="departmentValue" className="col-span-3">
                  <SelectValue placeholder="Select new department" />
                </SelectTrigger>
                <SelectContent>
                  {availableDepartments.length > 0 ? (
                    availableDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>No departments available</SelectItem>
                  )}
                </SelectContent>
              </Select>
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
          <Button 
            type="button" 
            onClick={handleSave}
            disabled={fieldToEdit === "department" && selectedDepartment === "" && availableDepartments.length > 0}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
