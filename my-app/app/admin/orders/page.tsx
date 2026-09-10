"use client";

import { useState, useMemo } from "react";
import { useOrders } from "./hooks/useOrders";
import { useOrderStatus } from "./hooks/useOrderStatus";
import { useOrderCancellation } from "./hooks/useOrderCancellation";
import { OrderFilters } from "../components/OrderFilters";
import { OrderList } from "../components/OrderList";
import { CancellationModal } from "../components/CancellationModal";
import { OrderErrorState } from "../components/OrderErrorState";

export default function OrdersPage() {
  const { orders, loading, error, formatOrderDate } = useOrders();
  const { updatingOrderId, updateStatus } = useOrderStatus(orders);
  const {
    cancelModalOpen,
    cancellationReason,
    isCancelling,
    openCancellationModal,
    closeCancellationModal,
    setCancellationReason,
    cancelOrder,
  } = useOrderCancellation(orders);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Filter orders with useMemo
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        statusFilter === "all" ? true : order.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleReload = () => {
    if (globalThis.window !== undefined) {
      globalThis.window.location.reload();
    }
  };

  // Error state
  if (error) {
    return (
      <div className="p-8 pb-32">
        <OrderErrorState error={error} onRetry={handleReload} />
      </div>
    );
  }

  return (
    <div className="px-6 pt-2 pb-32 max-w-7xl mx-auto">
      <OrderFilters
        activeTab={statusFilter}
        onTabChange={setStatusFilter}
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <OrderList
        orders={filteredOrders}
        loading={loading}
        expandedOrderId={expandedOrderId}
        updatingOrderId={updatingOrderId}
        onToggleExpand={toggleExpand}
        onUpdateStatus={updateStatus}
        onCancelOrder={openCancellationModal}
        formatDate={formatOrderDate}
      />

      <CancellationModal
        isOpen={cancelModalOpen}
        isCancelling={isCancelling}
        cancellationReason={cancellationReason}
        onReasonChange={setCancellationReason}
        onClose={closeCancellationModal}
        onConfirm={cancelOrder}
      />
    </div>
  );
}
