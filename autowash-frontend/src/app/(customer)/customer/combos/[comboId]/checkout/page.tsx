import { CustomerComboCheckoutPage } from "@/features/combos/components/customer-combo-checkout-page";

export default function ComboCheckoutPage({ params }: { params: { comboId: string } }) {
  return <CustomerComboCheckoutPage comboId={params.comboId} />;
}
