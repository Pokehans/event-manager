import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getOfferItems } from "@/lib/offers/get-offer-items";
import PricelistClient from "./pricelist-client";

export default async function Page() {
  const currentUser = await getCurrentUser({ redirectTo: "/" });
  const items = await getOfferItems();

  if (!currentUser) return null;

  return (
    <PricelistClient items={items} currentUserRole={currentUser.role} />
  );
}