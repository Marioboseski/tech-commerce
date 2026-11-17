type ProductGalleryProps = {
  name: string;
  image: string;
};

export default function ProductGallery({ name, image }: ProductGalleryProps) {
  return (
    <div className="product-gallery">
      <div className="gallery-main">
        <img className="gallery-product-image" src={image} alt={name} />
      </div>
    </div>
  );
}
