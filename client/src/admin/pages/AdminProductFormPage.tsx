import { Link, useNavigate, useParams } from 'react-router-dom';
import ErrorState from '../../components/feedback/ErrorState';
import { useCategories } from '../../hooks/useCategories';
import { showToast } from '../../stores/toastStore';
import ProductForm from '../components/ProductForm';
import {
  useAdminProduct,
  useCategorySpecFields,
  useCreateProduct,
  useRemoveProductImage,
  useUpdateProduct,
  useUploadProductImage,
} from '../hooks/useAdminProducts';
import type { AdminProduct, AdminProductInput } from '../types';

const emptyProduct = {
  sku: '',
  name: '',
  description: '',
  // Empty number input until the admin types a price.
  price: Number.NaN,
  categoryId: Number.NaN,
  details: {},
} satisfies AdminProductInput;

// The specs row of the product's own category, without id / productId.
const detailsOf = (product: AdminProduct): Record<string, string> => {
  const row =
    product.laptopDetails ??
    product.mobilePhoneDetails ??
    product.computerDetails ??
    product.consoleDetails ??
    product.tabletDetails ??
    {};
  return Object.fromEntries(
    Object.entries(row)
      .filter(([key]) => key !== 'id' && key !== 'productId')
      .map(([key, value]) => [key, String(value)]),
  );
};

// /admin/products/new and /admin/products/:id/edit
export default function AdminProductFormPage() {
  const { id } = useParams();
  const productId = id && /^[1-9]\d*$/.test(id) ? Number(id) : null;
  const isEdit = id !== undefined;
  const navigate = useNavigate();

  const { categories, categoriesLoaded, categoriesError, refetchCategories } =
    useCategories();
  const specFields = useCategorySpecFields();
  const product = useAdminProduct(isEdit ? productId : null);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const uploadImage = useUploadProductImage();
  const removeImage = useRemoveProductImage();

  // 1. Save the product (a new one needs an id before it can get an image).
  // 2. Upload the chosen image, if any.
  const save = async (input: AdminProductInput, imageFile: File | null) => {
    const saved =
      isEdit && productId !== null
        ? await updateProduct.mutateAsync({ id: productId, input })
        : await createProduct.mutateAsync(input);

    if (imageFile) {
      try {
        await uploadImage.mutateAsync({ id: saved.id, file: imageFile });
      } catch (error) {
        // The product itself is saved: open it, so the image can be tried
        // again, and say clearly what failed.
        const reason = error instanceof Error ? error.message : '';
        showToast(`Product saved, but the image was not: ${reason}`, 'error');
        navigate(`/admin/products/${saved.id}/edit`, { replace: true });
        return;
      }
    }

    showToast(isEdit ? 'Product saved' : 'Product created');
    navigate('/admin/products');
  };

  const removeSavedImage = () => {
    if (productId === null) {
      return;
    }
    removeImage.mutate(productId, {
      onSuccess: () => showToast('Image removed'),
    });
  };

  const title = isEdit ? 'Edit product' : 'New product';
  const failed =
    categoriesError || specFields.isError || (isEdit && product.isError);
  const loading =
    !categoriesLoaded ||
    specFields.isPending ||
    (isEdit && productId !== null && product.isPending);

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-title">{title}</h1>
        <Link className="ghost-button" to="/admin/products">
          Back to products
        </Link>
      </div>

      {isEdit && productId === null ? (
        <p className="subheading">This product does not exist.</p>
      ) : failed ? (
        <ErrorState
          what="this product"
          onRetry={() => {
            refetchCategories();
            specFields.refetch();
            product.refetch();
          }}
        />
      ) : loading || !specFields.data ? (
        <p className="subheading">Loading…</p>
      ) : (
        <ProductForm
          // A new product id gives a fresh form with its own default values.
          key={productId ?? 'new'}
          categories={categories}
          specFields={specFields.data}
          defaultValues={
            isEdit && product.data
              ? {
                  sku: product.data.sku,
                  name: product.data.name,
                  description: product.data.description,
                  price: product.data.price,
                  categoryId: product.data.categoryId,
                  details: detailsOf(product.data),
                }
              : emptyProduct
          }
          lockCategory={isEdit}
          imageUrl={isEdit ? (product.data?.imageUrl ?? null) : null}
          onRemoveImage={isEdit ? removeSavedImage : undefined}
          removingImage={removeImage.isPending}
          submitLabel={isEdit ? 'Save changes' : 'Create product'}
          onSubmit={save}
        />
      )}
    </>
  );
}
