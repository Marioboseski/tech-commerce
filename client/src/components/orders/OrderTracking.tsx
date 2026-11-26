import { carrierLabels } from '../../lib/carriers';
import { formatDateTime } from '../../lib/formatters';
import { buildTimeline, timelineLabels } from '../../lib/orderTimeline';
import { showToast } from '../../stores/toastStore';
import type { Order } from '../../types/order';

type OrderTrackingProps = Pick<
  Order,
  'status' | 'statusHistory' | 'carrier' | 'trackingNumber'
>;

export default function OrderTracking({
  status,
  statusHistory,
  carrier,
  trackingNumber,
}: OrderTrackingProps) {
  const steps = buildTimeline(status, statusHistory);

  const copyTrackingNumber = async () => {
    if (!trackingNumber) {
      return;
    }
    try {
      await navigator.clipboard.writeText(trackingNumber);
      showToast('Tracking number copied');
    } catch {
      // The clipboard is not available everywhere (e.g. plain http).
      showToast('Could not copy. Please select the number instead.', 'error');
    }
  };

  return (
    <section className="order-tracking" aria-label="Order tracking">
      <ol className="order-timeline">
        {steps.map((step) => (
          <li
            key={step.status}
            className={`order-timeline-step is-${step.state}${
              step.status === 'CANCELLED' ? ' is-cancelled' : ''
            }`}
            aria-current={step.state === 'current' ? 'step' : undefined}
          >
            <span className="order-timeline-dot" aria-hidden="true" />
            <strong>{timelineLabels[step.status]}</strong>
            <span>{step.date ? formatDateTime(step.date) : ' '}</span>
          </li>
        ))}
      </ol>

      {carrier && trackingNumber && (
        <div className="order-shipment">
          <div>
            <span>Carrier</span>
            <strong>{carrierLabels[carrier]}</strong>
          </div>
          <div>
            <span>Tracking number</span>
            <strong className="order-tracking-number">{trackingNumber}</strong>
          </div>
          <button
            type="button"
            className="ghost-button"
            onClick={copyTrackingNumber}
          >
            Copy number
          </button>
        </div>
      )}
    </section>
  );
}
