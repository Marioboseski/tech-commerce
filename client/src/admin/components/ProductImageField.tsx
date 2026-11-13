import { useEffect, useId, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';

// Same limits as the server (lib/productImages.ts). Checked here first so
// the admin does not wait for an upload that will be refused anyway.
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

type ProductImageFieldProps = {
  // The saved image (or the category placeholder when there is none).
  currentImageUrl: string;
  hasSavedImage: boolean;
  file: File | null;
  onFileChange: (file: File | null) => void;
  // Only on edit: removes the saved image right away.
  onRemoveSaved?: () => void;
  removing?: boolean;
};

export default function ProductImageField({
  currentImageUrl,
  hasSavedImage,
  file,
  onFileChange,
  onRemoveSaved,
  removing = false,
}: ProductImageFieldProps) {
  const inputId = useId();
  const [error, setError] = useState('');

  // A chosen file is shown before uploading through a temporary local URL,
  // which must be released again (or it stays in memory).
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
  useEffect(
    () => () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    },
    [previewUrl],
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const chosen = event.target.files?.[0] ?? null;
    // Allows choosing the same file again after a mistake.
    event.target.value = '';

    if (!chosen) {
      return;
    }
    if (!ALLOWED_TYPES.includes(chosen.type)) {
      setError('Only JPG, PNG, WebP or AVIF images are allowed');
      return;
    }
    if (chosen.size > MAX_BYTES) {
      setError('The image can be at most 5 MB');
      return;
    }
    setError('');
    onFileChange(chosen);
  };

  return (
    <div className="admin-image-field">
      <img
        className="admin-image-preview"
        src={previewUrl ?? currentImageUrl}
        alt=""
      />
      <div className="admin-image-actions">
        <label className="ghost-button admin-file-button" htmlFor={inputId}>
          {file || hasSavedImage ? 'Change image' : 'Choose image'}
        </label>
        <input
          id={inputId}
          className="visually-hidden"
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleChange}
        />
        {file && (
          <button type="button" onClick={() => onFileChange(null)}>
            Undo
          </button>
        )}
        {!file && hasSavedImage && onRemoveSaved && (
          <button type="button" disabled={removing} onClick={onRemoveSaved}>
            {removing ? 'Removing…' : 'Remove image'}
          </button>
        )}
        <span className="admin-hint">
          {file
            ? `${file.name} will be uploaded when you save.`
            : 'JPG, PNG, WebP or AVIF, at most 5 MB.'}
        </span>
        {error && (
          <span className="field-error" role="alert">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
