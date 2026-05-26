import { createClient } from "@/lib/supabase/server";

export type OfferCategoryPathItem = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type OfferItemUser = {
  id: string;
  email: string;
};

export type OfferItem = {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  price: number;
  item_type: "item" | "package";
  is_active: boolean;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_by_user: OfferItemUser | null;
  updated_by_user: OfferItemUser | null;
  category_path: OfferCategoryPathItem[];
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
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
};
function buildCategoryPath(
  category: OfferCategoryRow | null,
  categoryMap: Map<string, OfferCategoryRow>
): OfferCategoryPathItem[] {
  if (!category) return [];

  const path: OfferCategoryPathItem[] = [];
  let current: OfferCategoryRow | null = category;

  while (current) {
    path.unshift({
      id: current.id,
      name: current.name,
      slug: current.slug,
      sort_order: current.sort_order,
    });

    current = current.parent_id
      ? categoryMap.get(current.parent_id) ?? null
      : null;
  }

  return path;
}

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
      "id, category_id, name, description, unit, price, item_type, is_active, sort_order, created_at, updated_at, created_by, updated_by"
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

  const userMap = await getOfferItemUsers(
    (typedItems ?? []).flatMap((item) => [item.created_by, item.updated_by])
  );

  return (typedItems ?? []).map((item) => {
    const category = categoryMap.get(item.category_id) ?? null;
    const parent = category?.parent_id
      ? categoryMap.get(category.parent_id) ?? null
      : null;

    return {
      ...item,
      created_by_user: item.created_by
        ? userMap.get(item.created_by) ?? null
        : null,
      updated_by_user: item.updated_by
        ? userMap.get(item.updated_by) ?? null
        : null,
      category_path: buildCategoryPath(category, categoryMap),
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

export async function getOfferItemById(
  id: string
): Promise<OfferItem | null> {
  const supabase = await createClient();

  const { data: categories, error: categoriesError } = await supabase
    .from("offer_categories")
    .select("id, parent_id, name, slug, sort_order");

  if (categoriesError) {
    console.error("Error loading offer categories:", categoriesError.message);
    return null;
  }

  const typedCategories = categories as OfferCategoryRow[] | null;

  const { data: item, error: itemError } = await supabase
    .from("offer_items")
    .select(
      "id, category_id, name, description, unit, price, item_type, is_active, sort_order, created_at, updated_at, created_by, updated_by"
    )
    .eq("id", id)
    .maybeSingle();

  if (itemError) {
    console.error("Error loading offer item:", itemError.message);
    return null;
  }

  if (!item) {
    return null;
  }

  const typedItem = item as OfferItemRow;

  const categoryMap = new Map(
    (typedCategories ?? []).map((category) => [category.id, category])
  );

  const userMap = await getOfferItemUsers([
    typedItem.created_by,
    typedItem.updated_by,
  ]);

  const category = categoryMap.get(typedItem.category_id) ?? null;
  const parent = category?.parent_id
    ? categoryMap.get(category.parent_id) ?? null
    : null;

  return {
    ...typedItem,
    created_by_user: typedItem.created_by
      ? userMap.get(typedItem.created_by) ?? null
      : null,
    updated_by_user: typedItem.updated_by
      ? userMap.get(typedItem.updated_by) ?? null
      : null,
    category_path: buildCategoryPath(category, categoryMap),
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
}

async function getOfferItemUsers(
  userIds: (string | null)[]
): Promise<Map<string, OfferItemUser>> {
  const uniqueUserIds = Array.from(
    new Set(userIds.filter((userId): userId is string => Boolean(userId)))
  );

  if (uniqueUserIds.length === 0) {
    return new Map();
  }

  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from("users")
    .select("id, email")
    .in("id", uniqueUserIds);

  if (error) {
    console.error("Error loading offer item users:", error.message);
    return new Map();
  }

  return new Map(
    ((users ?? []) as OfferItemUser[]).map((user) => [user.id, user])
  );
}