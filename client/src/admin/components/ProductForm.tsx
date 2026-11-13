import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { Path, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormField from '../../components/forms/FormField';
import { showServerFieldErrors } from '../../lib/formErrors';
import { specLabels } from '../../lib/productSpecs';
import { defaultPlaceholder, getProductImage } from '../../lib/productImage';
import ProductImageField from './ProductImageField';
import type {
  AdminCategory,
  AdminProductInput,
  CategorySpecFields,
} from '../types';

// Same rules and messages as the server (adminProductSchemas.ts).
const MAX_PRICE = 9_999_999_999.99;

const requiredText = (label: string, maxLength: number) =>
  z
    .string(`${label} is required`)
    .trim()
    .min(1, `${label} is required`)
    .max(maxLength, `${label} can be at most ${maxLength} characters`);

// The required spec fields depend on the chosen category, so the schema is
// built for that category every time the form is checked.
const makeProductSchema = (specFields: Record<string, number>) =>
  z.object({
    sku: requiredText('SKU', 50).regex(
      /^[A-Za-z0-9-]+$/,
      'SKU can only contain letters, numbers and -',
    ),
    name: requiredText('Name', 255),
    description: requiredText('Description', 5000),
    // An empty number input gives NaN, which z.number() rejects.
    price: z
      .number('Price must be a number')
      .positive('Price must be greater than 0')
      .max(MAX_PRICE, 'Price is too big')
      .refine(
        (value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6,
        'Price can have at most 2 decimals',
      ),
    categoryId: z.number('Choose a category').positive('Choose a category'),
    details: z.object(
      Object.fromEntries(
        Object.entries(specFields).map(([field, maxLength]) => [
          field,
          requiredText(specLabels[field] ?? field, maxLength),
        ]),
      ),
    ),
  });

type ProductFormProps = {
  categories: AdminCategory[];
  specFields: CategorySpecFields;
  defaultValues: AdminProductInput;
  // Edit: the category is fixed (the server refuses to change it).
  lockCategory: boolean;
  submitLabel: string;
  // The saved image (edit), or null.
  imageUrl: string | null;
  // Edit only: removes the saved image right away.
  onRemoveImage?: () => void;
  removingImage?: boolean;
  // imageFile: a newly chosen photo, uploaded after the product is saved.
  onSubmit: (
    input: AdminProductInput,
    imageFile: File | null,
  ) => Promise<unknown>;
};

export default function ProductForm({
  categories,
  specFields,
  defaultValues,
  lockCategory,
  submitLabel,
  imageUrl,
  onRemoveImage,
  removingImage,
  onSubmit,
}: ProductFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);

  const slugFor = (categoryId: number) =>
    categories.find((category) => category.id === categoryId)?.slug;

  const resolver: Resolver<AdminProductInput> = (values, context, options) => {
    const slug = slugFor(values.categoryId);
    const fields = (slug && specFields[slug]) || {};
    return zodResolver(makeProductSchema(fields))(
      values,
      context,
      options,
    ) as ReturnType<Resolver<AdminProductInput>>;
  };

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AdminProductInput>({
    resolver,
    defaultValues,
    mode: 'onTouched',
  });

  // Re-renders when the category changes, to show that category's specs.
  const categoryId = useWatch({ control, name: 'categoryId' });
  const slug = slugFor(categoryId);
  const fieldsOfCategory = slug ? Object.keys(specFields[slug] ?? {}) : [];
  // Without a saved image the shop shows the category placeholder.
  const currentImageUrl =
    imageUrl ??
    (slug
      ? getProductImage({ imageUrl: null, category: { name: '', slug } })
      : defaultPlaceholder);
  const lockedCategory = categories.find(
    (category) => category.id === defaultValues.categoryId,
  );

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values, imageFile);
    } catch (error) {
      const fields = [
        'sku',
        'name',
        'description',
        'price',
        'categoryId',
        ...fieldsOfCategory.map((field) => `details.${field}`),
      ] as Path<AdminProductInput>[];

      if (!showServerFieldErrors(error, setError, fields)) {
        setError('root.server', {
          message:
            error instanceof Error ? error.message : 'Something went wrong',
        });
      }
    }
  });

  return (
    <form className="admin-form" onSubmit={submit} noValidate>
      <section className="admin-form-section">
        <h2>Product</h2>
        <div className="admin-form-grid">
          <FormField
            label="Name"
            registration={register('name')}
            error={errors.name}
          />
          <FormField
            label="SKU"
            registration={register('sku')}
            error={errors.sku}
          />
          <FormField
            label="Price (€)"
            type="number"
            step="0.01"
            min="0"
            registration={register('price', { valueAsNumber: true })}
            error={errors.price}
          />
          {lockCategory ? (
            <label>
              Category
              <input value={lockedCategory?.name ?? ''} disabled readOnly />
              <span className="admin-hint">
                The category cannot be changed after creating a product.
              </span>
            </label>
          ) : (
            <label>
              Category
              <select
                {...register('categoryId', { valueAsNumber: true })}
                aria-invalid={errors.categoryId ? true : undefined}
              >
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId?.message && (
                <span className="field-error">{errors.categoryId.message}</span>
              )}
            </label>
          )}
        </div>
        <label>
          Description
          <textarea
            rows={5}
            {...register('description')}
            aria-invalid={errors.description ? true : undefined}
          />
          {errors.description?.message && (
            <span className="field-error">{errors.description.message}</span>
          )}
        </label>
      </section>

      <section className="admin-form-section">
        <h2>Image</h2>
        <ProductImageField
          currentImageUrl={currentImageUrl}
          hasSavedImage={imageUrl !== null}
          file={imageFile}
          onFileChange={setImageFile}
          onRemoveSaved={onRemoveImage}
          removing={removingImage}
        />
      </section>

      <section className="admin-form-section">
        <h2>Specifications</h2>
        {fieldsOfCategory.length === 0 ? (
          <p className="admin-hint">Choose a category to see its fields.</p>
        ) : (
          <div className="admin-form-grid">
            {fieldsOfCategory.map((field) => (
              <FormField
                key={`${slug}-${field}`}
                label={specLabels[field] ?? field}
                registration={register(`details.${field}`)}
                error={errors.details?.[field]}
              />
            ))}
          </div>
        )}
      </section>

      <div className="admin-form-actions">
        <button
          className="primary-button"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
        {errors.root?.server && (
          <p className="account-error" role="alert">
            {errors.root.server.message}
          </p>
        )}
      </div>
    </form>
  );
}
