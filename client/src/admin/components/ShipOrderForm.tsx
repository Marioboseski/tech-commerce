import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormField from '../../components/forms/FormField';
import { CARRIERS, carrierLabels } from '../../lib/carriers';
import { showServerFieldErrors } from '../../lib/formErrors';
import { shipmentSchema, type Shipment } from '../../schemas/shipmentSchema';

type ShipOrderFormProps = {
  onSubmit: (shipment: Shipment) => Promise<unknown>;
  onCancel: () => void;
};

// Shown after "Mark as shipped": an order is only shipped together with
// its carrier and tracking number.
export default function ShipOrderForm({
  onSubmit,
  onCancel,
}: ShipOrderFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(shipmentSchema),
    defaultValues: { carrier: undefined, trackingNumber: '' },
    mode: 'onTouched',
  });

  const submit = handleSubmit(async (shipment) => {
    try {
      await onSubmit(shipment);
    } catch (error) {
      // Other errors (e.g. 409) are shown by the global error message.
      showServerFieldErrors(error, setError, ['carrier', 'trackingNumber']);
    }
  });

  return (
    <form className="admin-form admin-ship-form" onSubmit={submit} noValidate>
      <h2>Ship this order</h2>
      <div className="admin-form-grid">
        <label>
          Carrier
          <select
            {...register('carrier')}
            defaultValue=""
            aria-invalid={errors.carrier ? true : undefined}
            aria-describedby={errors.carrier ? 'carrier-error' : undefined}
          >
            <option value="" disabled>
              Choose a carrier
            </option>
            {CARRIERS.map((carrier) => (
              <option key={carrier} value={carrier}>
                {carrierLabels[carrier]}
              </option>
            ))}
          </select>
          {errors.carrier?.message && (
            <span className="field-error" id="carrier-error">
              {errors.carrier.message}
            </span>
          )}
        </label>
        <FormField
          label="Tracking number"
          autoComplete="off"
          registration={register('trackingNumber')}
          error={errors.trackingNumber}
        />
      </div>
      <div className="admin-form-actions">
        <button
          type="submit"
          className="primary-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving…' : 'Confirm shipment'}
        </button>
        <button
          type="button"
          className="ghost-button"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
