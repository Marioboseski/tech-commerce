import type { OrderStatus } from '../../types/order';

// Server value → text for people.
const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    // e.g. "order-status order-status-pending", so each status can get a color.
    <span className={`order-status order-status-${status.toLowerCase()}`}>
      {statusLabels[status]}
    </span>
  );
}
