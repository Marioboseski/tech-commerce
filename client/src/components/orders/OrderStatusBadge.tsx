import type { OrderStatus } from '../../types/order';

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`order-status order-status-${status.toLowerCase()}`}>
      {statusLabels[status]}
    </span>
  );
}
