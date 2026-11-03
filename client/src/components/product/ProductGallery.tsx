import { useState } from 'react';

const views = [
  { id: 'front', label: 'Front view' },
  { id: 'angle', label: 'Angled view' },
  { id: 'detail', label: 'Product detail' },
];

type ProductGalleryProps = {
  name: string;
  image: string;
};

export default function ProductGallery({ name, image }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const selectPrevious = () => {
    setActiveIndex((current) => (current - 1 + views.length) % views.length);
  };
  const selectNext = () => {
    setActiveIndex((current) => (current + 1) % views.length);
  };
  const activeView = views[activeIndex];

  return (
    <div className="product-gallery">
      <div className={`gallery-main gallery-view-${activeView.id}`}>
        <button
          className="gallery-arrow gallery-arrow-previous"
          type="button"
          aria-label="Show previous product image"
          onClick={selectPrevious}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div className="gallery-product-art" aria-live="polite">
          <img
            className="gallery-product-image"
            src={image}
            alt={`${name} — ${activeView.label.toLowerCase()}`}
          />
          <span className="gallery-view-label">{activeView.label}</span>
        </div>
        <button
          className="gallery-arrow gallery-arrow-next"
          type="button"
          aria-label="Show next product image"
          onClick={selectNext}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
      <div
        className="gallery-thumbnails"
        role="tablist"
        aria-label="Product images"
      >
        {views.map((view, index) => (
          <button
            className={`gallery-thumbnail gallery-view-${view.id} ${activeIndex === index ? 'is-active' : ''}`}
            key={view.id}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            aria-label={`Show ${view.label.toLowerCase()}`}
            onClick={() => setActiveIndex(index)}
          >
            <img src={image} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}
