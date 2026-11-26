import { statusLabels } from '../../lib/orderStatus';
import type { OrderStatus } from '../../types/order';

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`order-status order-status-${status.toLowerCase()}`}>
      {statusLabels[status]}
    </span>
  );
}
