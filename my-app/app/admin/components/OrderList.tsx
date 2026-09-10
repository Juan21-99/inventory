import { Order, OrderStatus } from "../types/order.types";
import { OrderCard } from "./OrderCard";
import { OrderSkeleton } from "./OrderSkeleton";
import { OrderDetails } from "./OrderDetails";
import { OrderEmptyState } from "./OrderEmptyState";
import { OrderStatusActions } from "./OrderStatusActions";

interface OrderListProps {
  orders: Order[];
  loading: boolean;
  expandedOrderId: string | null;
  updatingOrderId: string | null;
  onToggleExpand: (orderId: string) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onCancelOrder: (orderId: string) => void;
  formatDate: (timestamp: string | number | Date | undefined) => string;
}

export const OrderList = ({
  orders,
  loading,
  expandedOrderId,
  updatingOrderId,
  onToggleExpand,
  onUpdateStatus,
  onCancelOrder,
  formatDate,
}: OrderListProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((item) => (
          <OrderSkeleton key={`skeleton-${item}`} />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return <OrderEmptyState />;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const isExpanded = expandedOrderId === order.id;
        const isUpdating = updatingOrderId === order.id;

        return (
          <OrderCard
            key={order.id}
            order={order}
            isExpanded={isExpanded}
            onToggleExpand={onToggleExpand}
          >
            <OrderDetails
              orderId={order.id}
              items={order.items}
              total_amount={order.total_amount}
              created_at={order.created_at}
              formatDate={formatDate}
            >
              <OrderStatusActions
                orderId={order.id}
                status={order.status}
                paymentMethod={order.payment_method}
                isUpdating={isUpdating}
                onUpdateStatus={onUpdateStatus}
                onCancel={onCancelOrder}
              />
            </OrderDetails>
          </OrderCard>
        );
      })}
    </div>
  );
};
