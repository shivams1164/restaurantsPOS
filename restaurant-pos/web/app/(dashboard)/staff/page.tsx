// FILE: web/app/(dashboard)/staff/page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/features/empty-state";
import { StaffFormModal } from "@/components/features/staff-form-modal";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkeletonTable } from "@/components/features/skeleton-table";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSessionContext } from "@/components/providers/session-provider";
import { useStaff, useStaffMutations } from "@/hooks/use-staff";
import type { CreateStaffValues } from "@/schemas/staff";
import { formatDateTime } from "@/lib/utils";

export default function StaffPage() {
  const { restaurant } = useSessionContext();
  const [modalOpen, setModalOpen] = useState(false);

  const staffQuery = useStaff(restaurant.id);
  const { createMutation, toggleActiveMutation, resetPasswordMutation } = useStaffMutations(restaurant.id);

  const onCreate = async (values: CreateStaffValues) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success("Staff user created");
      setModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create staff");
    }
  };

  return (
    <PageWrapper
      title="Staff"
      action={<Button onClick={() => setModalOpen(true)}>Add staff</Button>}
    >
      <div className="overflow-x-auto rounded-xl border border-app-border bg-white">
        {staffQuery.isLoading ? (
          <SkeletonTable rows={6} cols={7} />
        ) : (staffQuery.data ?? []).length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(staffQuery.data ?? []).map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">{staff.name}</TableCell>
                  <TableCell>
                    <Badge variant={staff.role === "waiter" ? "blue" : "amber"}>{staff.role}</Badge>
                  </TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>{staff.phone ?? "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={staff.is_active}
                        onCheckedChange={(value) => {
                          toggleActiveMutation.mutate(
                            { userId: staff.id, isActive: value },
                            {
                              onSuccess: () => toast.success(value ? "Staff activated" : "Staff deactivated"),
                              onError: (error) =>
                                toast.error(error instanceof Error ? error.message : "Failed to change status")
                            }
                          );
                        }}
                      />
                      <span className="text-xs text-neutral-500">{staff.is_active ? "Active" : "Inactive"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDateTime(staff.updated_at)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        resetPasswordMutation.mutate(staff.email, {
                          onSuccess: () => toast.success("Password reset email sent"),
                          onError: (error) =>
                            toast.error(error instanceof Error ? error.message : "Could not send reset email")
                        });
                      }}
                    >
                      Reset Password
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-4">
            <EmptyState title="No staff yet" description="Create waiter and delivery accounts to start operation." action={<Button onClick={() => setModalOpen(true)}>Add staff</Button>} />
          </div>
        )}
      </div>

      <StaffFormModal
        open={modalOpen}
        isSubmitting={createMutation.isPending}
        onClose={() => setModalOpen(false)}
        onSubmit={onCreate}
      />
    </PageWrapper>
  );
}
