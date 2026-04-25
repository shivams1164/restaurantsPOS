// FILE: web/components/features/menu-item-card.tsx
import Image from "next/image";
import { ImageOff, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { currency } from "@/lib/utils";
import type { Tables } from "@/types/database";

interface MenuItemCardProps {
  item: Tables<"menu_items">;
  onEdit: (item: Tables<"menu_items">) => void;
  onDelete: (itemId: string) => void;
  onToggleAvailability: (itemId: string, available: boolean) => void;
}

export function MenuItemCard({ item, onEdit, onDelete, onToggleAvailability }: MenuItemCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-36 w-full bg-neutral-100">
        {item.image_url ? (
          <Image src={item.image_url} alt={item.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            <ImageOff />
          </div>
        )}
      </div>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-neutral-900">{item.name}</h3>
            <Badge className="mt-1" variant="neutral">{item.category}</Badge>
          </div>
          <p className="font-mono text-sm font-semibold text-neutral-900">{currency(Number(item.price))}</p>
        </div>

        <p className="line-clamp-2 text-sm text-neutral-500">{item.description ?? "No description"}</p>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-neutral-700">
            <Switch checked={item.available} onCheckedChange={(value) => onToggleAvailability(item.id, value)} />
            {item.available ? "Available" : "Unavailable"}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
              <Pencil size={14} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)}>
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
