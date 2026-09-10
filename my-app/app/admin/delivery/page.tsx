"use client";

import { useState, useMemo, useCallback } from "react";
import { useDeliveryOrders } from "./hooks/useDeliveryOrders";
import { useDeliveryStatus } from "./hooks/useDeliveryStatus";
import { useDeliveryCancellation } from "./hooks/useDeliveryCancellation";
import { DeliveryFilters } from "../components/DeliveryFilters";
import { DeliveryList } from "../components/DeliveryList";
import { CancellationModal } from "../components/CancellationModal";
import {
  DELIVERY_STATUS_COLORS,
  DELIVERY_STATUS_LABELS,
} from "../constants/delivery.constants";
import { OrderStatus } from "../types/delivery.types";

export default function DeliveryPage() {
  const { orders, loading } = useDeliveryOrders();
  const { updatingOrder, updateStatus } = useDeliveryStatus(orders);
  const {
    cancelModalOpen,
    cancellationReason,
    isCancelling,
    openCancellationModal,
    closeCancellationModal,
    setCancellationReason,
    cancelOrder,
  } = useDeliveryCancellation(orders);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter orders with useMemo
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.address || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        statusFilter === "all" ? true : order.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const getStatusColor = useCallback((status: OrderStatus): string => {
    return DELIVERY_STATUS_COLORS[status] || DELIVERY_STATUS_COLORS.cancelled;
  }, []);

  const getStatusLabel = useCallback((status: OrderStatus): string => {
    return DELIVERY_STATUS_LABELS[status] || status;
  }, []);

  return (
    <div className="px-6 pt-2 pb-32 max-w-7xl mx-auto">
      <DeliveryFilters
        activeTab={statusFilter}
        onTabChange={setStatusFilter}
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <DeliveryList
        orders={filteredOrders}
        loading={loading}
        updatingOrder={updatingOrder}
        getStatusColor={getStatusColor}
        getStatusLabel={getStatusLabel}
        onUpdateStatus={updateStatus}
        onCancel={openCancellationModal}
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
