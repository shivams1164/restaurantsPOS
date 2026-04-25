// FILE: web/components/features/staff-form-modal.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { createStaffSchema, type CreateStaffValues } from "@/schemas/staff";

interface StaffFormModalProps {
  open: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: CreateStaffValues) => void;
}

export function StaffFormModal({ open, isSubmitting, onClose, onSubmit }: StaffFormModalProps) {
  const form = useForm<CreateStaffValues>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "waiter",
      phone: ""
    }
  });

  const submit = (values: CreateStaffValues) => {
    onSubmit(values);
  };

  return (
    <Modal open={open} onClose={onClose} title="Add staff user">
      <form className="space-y-3" onSubmit={form.handleSubmit(submit)}>
        <div className="space-y-1">
          <Label>Name</Label>
          <Input {...form.register("name")} />
          {form.formState.errors.name ? <p className="text-xs text-red-600">{form.formState.errors.name.message}</p> : null}
        </div>

        <div className="space-y-1">
          <Label>Email</Label>
          <Input type="email" {...form.register("email")} />
          {form.formState.errors.email ? <p className="text-xs text-red-600">{form.formState.errors.email.message}</p> : null}
        </div>

        <div className="space-y-1">
          <Label>Temporary Password</Label>
          <Input type="password" {...form.register("password")} />
          {form.formState.errors.password ? (
            <p className="text-xs text-red-600">{form.formState.errors.password.message}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Role</Label>
            <Select {...form.register("role")}>
              <option value="waiter">Waiter</option>
              <option value="delivery">Delivery</option>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Phone</Label>
            <Input {...form.register("phone")} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Staff"}</Button>
        </div>
      </form>
    </Modal>
  );
}
