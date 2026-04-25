// FILE: web/app/(dashboard)/menu/page.tsx
"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/features/empty-state";
import { MenuItemCard } from "@/components/features/menu-item-card";
import { MenuItemFormModal } from "@/components/features/menu-item-form-modal";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionContext } from "@/components/providers/session-provider";
import { useMenuCategories, useMenuItems, useMenuMutations } from "@/hooks/use-menu";
import type { MenuItemValues } from "@/schemas/menu";
import type { Tables } from "@/types/database";

export default function MenuPage() {
  const { restaurant } = useSessionContext();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Tables<"menu_items"> | null>(null);

  const categoriesQuery = useMenuCategories(restaurant.id);
  const itemsQuery = useMenuItems({ restaurantId: restaurant.id, category: selectedCategory });
  const { saveMutation, deleteMutation, availabilityMutation, uploadMutation } = useMenuMutations(restaurant.id);

  const categories = useMemo(() => ["all", ...(categoriesQuery.data ?? [])], [categoriesQuery.data]);

  const openCreateModal = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEditModal = (item: Tables<"menu_items">) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSubmit = async (values: MenuItemValues, file: File | null) => {
    try {
      let imageUrl = values.image_url || undefined;

      if (file) {
        const extension = file.name.split(".").pop() ?? "jpg";
        const path = `${restaurant.id}/menu/${crypto.randomUUID()}.${extension}`;
        imageUrl = await uploadMutation.mutateAsync({ path, file });
      }

      await saveMutation.mutateAsync({
        id: values.id,
        name: values.name,
        description: values.description || undefined,
        price: values.price,
        category: values.category,
        prep_time_min: values.prep_time_min,
        available: values.available,
        image_url: imageUrl
      });

      toast.success(editingItem ? "Menu item updated" : "Menu item created");
      setModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save item");
    }
  };

  const onDelete = async (itemId: string) => {
    const confirmed = window.confirm("Delete this menu item?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(itemId);
      toast.success("Menu item deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  };

  return (
    <PageWrapper
      title="Menu"
      action={
        <Button onClick={openCreateModal}>
          Add item
        </Button>
      }
    >
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            size="sm"
            variant={selectedCategory === category ? "default" : "secondary"}
            onClick={() => setSelectedCategory(category)}
          >
            {category === "all" ? "All" : category}
          </Button>
        ))}
      </div>

      {itemsQuery.isLoading ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[320px] rounded-xl" />
          ))}
        </div>
      ) : (itemsQuery.data ?? []).length > 0 ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(itemsQuery.data ?? []).map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onEdit={openEditModal}
              onDelete={onDelete}
              onToggleAvailability={(itemId, available) => {
                availabilityMutation.mutate(
                  { itemId, available },
                  {
                    onError: (error) => toast.error(error instanceof Error ? error.message : "Update failed")
                  }
                );
              }}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState title="No menu items" description="Create dishes and drinks to make them available to staff." action={<Button onClick={openCreateModal}>Add first item</Button>} />
        </div>
      )}

      <MenuItemFormModal
        open={modalOpen}
        mode={editingItem ? "edit" : "create"}
        categories={(categoriesQuery.data ?? []).filter((item) => item !== "all")}
        initialItem={editingItem}
        isSubmitting={saveMutation.isPending || uploadMutation.isPending}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSubmit}
      />
    </PageWrapper>
  );
}
