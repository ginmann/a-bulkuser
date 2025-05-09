"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { User, MfaPolicy, mfaPolicyOptions } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, Edit3, ShieldCheck, UsersIcon, GripVertical } from "lucide-react";
import { BulkEditDialog } from "./bulk-edit-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserTableProps {
  users: User[];
  onUpdateUser: (id: string, updates: Partial<User>) => void;
  onDeleteUsers: (userIds: string[]) => void;
  onBulkUpdateUsers: (userIds: string[], field: "mfaPolicy" | "department", value: string) => void;
}

type EditingCell = {
  userId: string;
  field: keyof User;
} | null;

export function UserTable({
  users,
  onUpdateUser,
  onDeleteUsers,
  onBulkUpdateUsers,
}: UserTableProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<EditingCell>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isBulkEditDialogOpen, setIsBulkEditDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const selectTriggerRef = useRef<HTMLButtonElement | null>(null);

  const { toast } = useToast();

  const availableDepartments = useMemo(() => {
    const departments = new Set(users.map(user => user.department));
    return Array.from(departments).sort();
  }, [users]);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    } else if (editingCell && selectTriggerRef.current) {
       // For select, Radix focuses the trigger, actual items are in a portal
    }
  }, [editingCell]);

  const handleSelectUser = (userId: string, checked: boolean) => {
    setSelectedUserIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(new Set(users.map((user) => user.id)));
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const handleCellClick = (userId: string, field: keyof User, currentValue: string | MfaPolicy) => {
    setEditingCell({ userId, field });
    setEditValue(currentValue);
  };

  const handleSaveEdit = () => {
    if (editingCell) {
      onUpdateUser(editingCell.userId, { [editingCell.field]: editValue });
      setEditingCell(null);
      toast({ title: "User updated", description: `Field ${String(editingCell.field)} successfully updated.` });
    }
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
  };
  
  const renderCellContent = (user: User, field: keyof User) => {
    const value = user[field];
    if (editingCell?.userId === user.id && editingCell?.field === field) {
      if (field === "mfaPolicy") {
        return (
          <Select
            value={editValue as MfaPolicy}
            onValueChange={(val) => setEditValue(val)}
          >
            <SelectTrigger
              ref={selectTriggerRef}
              className="h-8 text-xs bg-background"
              onBlur={(e) => {
                 // Delay blur handling to allow select item click
                setTimeout(() => {
                  if (!e.relatedTarget || !e.relatedTarget.closest('[role="listbox"]')) {
                    handleSaveEdit();
                  }
                }, 100);
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mfaPolicyOptions.map((policy) => (
                <SelectItem key={policy} value={policy}>
                  {policy}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
      return (
        <Input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSaveEdit();
            if (e.key === "Escape") handleCancelEdit();
          }}
          className="h-8 text-xs bg-background"
        />
      );
    }
    return <span className="truncate">{value}</span>;
  };

  const handleDeleteSelected = () => {
    onDeleteUsers(Array.from(selectedUserIds));
    setSelectedUserIds(new Set());
    toast({ title: "Users Deleted", description: `${selectedUserIds.size} user(s) have been removed.`, variant: "destructive" });
  };

  const handleBulkEdit = (field: "mfaPolicy" | "department", value: string) => {
    onBulkUpdateUsers(Array.from(selectedUserIds), field, value);
    toast({ title: "Bulk Update Successful", description: `${selectedUserIds.size} user(s) have been updated.` });
  };

  const userFields: Array<{ key: keyof User; label: string }> = [
    { key: "username", label: "Username" },
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "department", label: "Department" },
    { key: "mfaPolicy", label: "MFA Policy" },
    { key: "identityMapping", label: "Identity Mapping" },
  ];

  return (
    <div className="space-y-4">
      {selectedUserIds.size > 0 && (
        <div className="flex items-center space-x-2 p-2 bg-muted rounded-md shadow">
          <span className="text-sm font-medium">{selectedUserIds.size} user(s) selected</span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" /> Remove Selected
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete {selectedUserIds.size} user(s). This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteSelected}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" size="sm" onClick={() => setIsBulkEditDialogOpen(true)}>
            <Edit3 className="mr-2 h-4 w-4" /> Edit
          </Button>
        </div>
      )}
      <div className="rounded-lg border shadow-sm overflow-hidden">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[50px] p-2 border-r border-border">
                <Checkbox
                  checked={
                    users.length > 0 && selectedUserIds.size === users.length
                  }
                  onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                  aria-label="Select all users"
                />
              </TableHead>
              {userFields.map((field) => (
                <TableHead key={field.key} className="p-3 border-r border-border last:border-r-0">
                  {field.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                className="group hover:bg-accent transition-colors"
                data-state={selectedUserIds.has(user.id) ? "selected" : ""}
              >
                <TableCell className="p-2 border-r border-border">
                  <Checkbox
                    checked={selectedUserIds.has(user.id)}
                    onCheckedChange={(checked) =>
                      handleSelectUser(user.id, Boolean(checked))
                    }
                    aria-label={`Select user ${user.username}`}
                  />
                </TableCell>
                {userFields.map((field) => (
                  <TableCell
                    key={field.key}
                    className="p-0 border-r border-border last:border-r-0 group-hover:bg-accent transition-colors"
                    onClick={() => handleCellClick(user.id, field.key, user[field.key])}
                  >
                    <div className="p-3 h-full"> {/* Ensure padding is inside clickable area */}
                      {renderCellContent(user, field.key)}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
             {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={userFields.length + 1} className="h-24 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <BulkEditDialog
        isOpen={isBulkEditDialogOpen}
        onOpenChange={setIsBulkEditDialogOpen}
        selectedUserCount={selectedUserIds.size}
        onBulkEdit={handleBulkEdit}
        availableDepartments={availableDepartments}
      />
    </div>
  );
}
