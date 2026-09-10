import { Order, OrderStatus } from "../types/delivery.types";
import { DeliveryCardHeader } from "./DeliveryCardHeader";
import { DeliveryAddress } from "./DeliveryAddress";
import { DeliveryItems } from "./DeliveryItems";
import { DeliveryActions } from "./DeliveryActions";

interface DeliveryCardProps {
  order: Order;
  isUpdating: boolean;
  getStatusColor: (status: OrderStatus) => string;
  getStatusLabel: (status: OrderStatus) => string;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onCancel: (orderId: string) => void;
}

export const DeliveryCard = ({
  order,
  isUpdating,
  getStatusColor,
  getStatusLabel,
  onUpdateStatus,
  onCancel,
}: DeliveryCardProps) => {
  return (
    <div className="bg-stone-900/40 rounded-[2rem] border border-white/5 p-6 shadow-sm hover:shadow-xl hover:shadow-black/20 hover:border-amber-500/20 transition-all duration-300 group">
      <DeliveryCardHeader
        orderId={order.id}
        customer_name={order.customer_name}
        status={order.status}
        getStatusColor={getStatusColor}
        getStatusLabel={getStatusLabel}
      />

      <DeliveryAddress
        address={order.address}
        customer_phone={order.customer_phone}
      />

      <DeliveryItems items={order.items} />

      <DeliveryActions
        orderId={order.id}
        status={order.status}
        paymentMethod={order.payment_method}
        total_amount={order.total_amount}
        isUpdating={isUpdating}
        onUpdateStatus={onUpdateStatus}
        onCancel={onCancel}
      />
    </div>
  );
};
