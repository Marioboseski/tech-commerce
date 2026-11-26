import type { OrderStatus, OrderStatusEvent } from '../types/order';

const FLOW = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const;

// How the customer reads each step.
export const timelineLabels: Record<OrderStatus, string> = {
  PENDING: 'Order placed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export type TimelineStep = {
  status: OrderStatus;
  state: 'done' | 'current' | 'upcoming';
  // When it happened; null for steps still to come (or older orders that
  // have no record of that step).
  date: string | null;
};

export const buildTimeline = (
  status: OrderStatus,
  history: OrderStatusEvent[],
): TimelineStep[] => {
  const dateOf = (step: OrderStatus) =>
    history.findLast((event) => event.status === step)?.createdAt ?? null;

  // A cancelled order shows the steps it really went through, then
  // "Cancelled", and no steps that will never come.
  if (status === 'CANCELLED') {
    return [
      ...FLOW.filter((step) => dateOf(step) !== null).map((step) => ({
        status: step,
        state: 'done' as const,
        date: dateOf(step),
      })),
      { status, state: 'current', date: dateOf(status) },
    ];
  }

  const current = FLOW.indexOf(status);
  return FLOW.map((step, index) => ({
    status: step,
    state:
      index < current ? 'done' : index === current ? 'current' : 'upcoming',
    date: index <= current ? dateOf(step) : null,
  }));
};
