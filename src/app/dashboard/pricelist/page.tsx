import PricelistClient from "./pricelist-client";
import { getOfferItems } from "@/lib/offers/get-offer-items";

export default async function Page() {
  const items = await getOfferItems();

  return <PricelistClient items={items} />;
}