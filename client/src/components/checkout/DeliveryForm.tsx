import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import FormField from '../forms/FormField';
import { useCreateOrder } from '../../hooks/useOrders';
import { showServerFieldErrors } from '../../lib/formErrors';
import { deliveryAddressSchema } from '../../schemas/checkoutSchema';

type DeliveryFormProps = {
  defaultFullName: string;
};

// Mounted only once the user is known, so defaultValues already has the name.
export default function DeliveryForm({ defaultFullName }: DeliveryFormProps) {
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(deliveryAddressSchema),
    defaultValues: {
      fullName: defaultFullName,
      street: '',
      city: '',
      postalCode: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async (address) => {
    try {
      const order = await createOrder.mutateAsync(address);
      // "Thank you" is shown only when we come from here (state.justPlaced).
      navigate(`/orders/${order.id}`, { state: { justPlaced: true } });
    } catch (error) {
      if (
        !showServerFieldErrors(error, setError, [
          'fullName',
          'street',
          'city',
          'postalCode',
        ])
      ) {
        setError('root.server', {
          message:
            error instanceof Error ? error.message : 'Something went wrong',
        });
      }
    }
  });

  return (
    <form className="checkout-form" onSubmit={onSubmit} noValidate>
      <h2>Delivery details</h2>
      <FormField
        label="Full name"
        autoComplete="name"
        registration={register('fullName')}
        error={errors.fullName}
      />
      <FormField
        label="Street address"
        autoComplete="street-address"
        registration={register('street')}
        error={errors.street}
      />
      <div className="checkout-form-row">
        <FormField
          label="City"
          autoComplete="address-level2"
          registration={register('city')}
          error={errors.city}
        />
        <FormField
          label="Postal code"
          autoComplete="postal-code"
          registration={register('postalCode')}
          error={errors.postalCode}
        />
      </div>
      <button
        className="primary-button"
        type="submit"
        // Also stops a double click from sending two orders.
        disabled={createOrder.isPending}
      >
        {createOrder.isPending ? 'Placing order…' : 'Place order'}
      </button>
      {errors.root?.server && (
        <p className="account-error" role="alert">
          {errors.root.server.message}
        </p>
      )}
      <p className="checkout-message">
        You pay on delivery. No card details are needed.
      </p>
    </form>
  );
}
