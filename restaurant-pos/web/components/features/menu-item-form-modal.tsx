// FILE: web/components/features/menu-item-form-modal.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { menuItemSchema, type MenuItemValues } from "@/schemas/menu";
import type { Tables } from "@/types/database";

interface MenuItemFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  categories: string[];
  initialItem?: Tables<"menu_items"> | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: MenuItemValues, file: File | null) => void;
}

export function MenuItemFormModal({
  open,
  mode,
  categories,
  initialItem,
  isSubmitting,
  onClose,
  onSubmit
}: MenuItemFormModalProps) {
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<MenuItemValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      id: undefined,
      name: "",
      description: "",
      price: 0,
      category: "",
      prep_time_min: 10,
      available: true,
      image_url: ""
    }
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialItem) {
      form.reset({
        id: initialItem.id,
        name: initialItem.name,
        description: initialItem.description ?? "",
        price: Number(initialItem.price),
        category: initialItem.category,
        prep_time_min: initialItem.prep_time_min,
        available: initialItem.available,
        image_url: initialItem.image_url ?? ""
      });
    } else {
      form.reset({
        id: undefined,
        name: "",
        description: "",
        price: 0,
        category: "",
        prep_time_min: 10,
        available: true,
        image_url: ""
      });
    }

    setFile(null);
  }, [form, initialItem, open]);

  const submit = (values: MenuItemValues) => onSubmit(values, file);

  return (
    <Modal open={open} onClose={onClose} title={mode === "create" ? "Add menu item" : "Edit menu item"}>
      <form className="space-y-3" onSubmit={form.handleSubmit(submit)}>
        <div className="space-y-1">
          <Label>Name</Label>
          <Input {...form.register("name")} />
          {form.formState.errors.name ? <p className="text-xs text-red-600">{form.formState.errors.name.message}</p> : null}
        </div>

        <div className="space-y-1">
          <Label>Description</Label>
          <Textarea {...form.register("description")} />
          {form.formState.errors.description ? (
            <p className="text-xs text-red-600">{form.formState.errors.description.message}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Price</Label>
            <Input type="number" step="0.01" min="0" {...form.register("price", { valueAsNumber: true })} />
          </div>
          <div className="space-y-1">
            <Label>Prep Time (min)</Label>
            <Input type="number" min="0" {...form.register("prep_time_min", { valueAsNumber: true })} />
          </div>
        </div>

        <div className="space-y-1">
          <Label>Category</Label>
          <Input list="menu-categories" {...form.register("category")} />
          <datalist id="menu-categories">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </div>

        <div className="space-y-1">
          <Label>Image (optional)</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" {...form.register("available")} />
            Available
          </label>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : mode === "create" ? "Create item" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
