import { createClient } from "@/lib/supabase/server";

export type OfferItem = {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  price: number;
  item_type: "item" | "package";
  is_active: boolean;
  sort_order: number;
  category: {
    id: string;
    name: string;
    slug: string;
    sort_order: number;
    parent: {
      id: string;
      name: string;
      slug: string;
      sort_order: number;
    } | null;
  } | null;
};

type OfferCategoryRow = {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  sort_order: number;
};

type OfferItemRow = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  unit: string;
  price: number;
  item_type: "item" | "package";
  is_active: boolean;
  sort_order: number;
};

export async function getOfferItems(): Promise<OfferItem[]> {
  const supabase = await createClient();

  const { data: categories, error: categoriesError } = await supabase
    .from("offer_categories")
    .select("id, parent_id, name, slug, sort_order");

    if (categoriesError) {
    console.error("Error loading offer categories:", categoriesError.message);
    return [];
    }

    const typedCategories = categories as OfferCategoryRow[] | null;

  const { data: items, error: itemsError } = await supabase
    .from("offer_items")
    .select(
        "id, category_id, name, description, unit, price, item_type, is_active, sort_order"
    )
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

    if (itemsError) {
    console.error("Error loading offer items:", itemsError.message);
    return [];
    }

    const typedItems = items as OfferItemRow[] | null;

  const categoryMap = new Map(
    (typedCategories ?? []).map((category) => [category.id, category])
  );

  return ((typedItems ?? []) as OfferItemRow[]).map((item) => {
    const category = categoryMap.get(item.category_id) ?? null;
    const parent = category?.parent_id
      ? categoryMap.get(category.parent_id) ?? null
      : null;

    return {
      ...item,
      category: category
        ? {
            id: category.id,
            name: category.name,
            slug: category.slug,
            sort_order: category.sort_order,
            parent: parent
              ? {
                  id: parent.id,
                  name: parent.name,
                  slug: parent.slug,
                  sort_order: parent.sort_order,
                }
              : null,
          }
        : null,
    };
  });
}