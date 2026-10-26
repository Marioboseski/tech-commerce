import type { ProductDetails } from "../types/productTypes";

type ProductSpecificationsProps = {
  product: ProductDetails;
};

const ProductSpecifications = ({product}: ProductSpecificationsProps) => {
  
  if (product.laptopDetails) {
    const details = product.laptopDetails;

    return (
      <SpecificationsList
        title="Laptop Specifications"
        specifications={[
          ["Processor", details.processor],
          ["RAM", details.ram],
          ["Storage", details.storage],
          ["Screen Size", details.screenSize],
          ["Graphics Card", details.graphicsCard],
        ]}
      />
    );
  }

  if (product.computerDetails) {
    const details = product.computerDetails;

    return (
      <SpecificationsList
        title="Computer Specifications"
        specifications={[
          ["Processor", details.processor],
          ["RAM", details.ram],
          ["Storage", details.storage],
          ["Graphics Card", details.graphicsCard],
          ["Form Factor", details.formFactor],
        ]}
      />
    );
  }

  if (product.mobilePhoneDetails) {
    const details = product.mobilePhoneDetails;

    return (
      <SpecificationsList
        title="Mobile Phone Specifications"
        specifications={[
          ["Processor", details.processor],
          ["RAM", details.ram],
          ["Storage", details.storage],
          ["Battery", details.battery],
          ["Camera", details.camera],
          ["Screen Size", details.screenSize],
        ]}
      />
    );
  }

  if (product.consoleDetails) {
    const details = product.consoleDetails;

    return (
      <SpecificationsList
        title="Console Specifications"
        specifications={[
          ["Manufacturer", details.manufacturer],
          ["Storage", details.storage],
          ["Resolution", details.resolution],
          ["Maximum Players", details.maxPlayers],
          ["Connectivity", details.connectivity],
        ]}
      />
    );
  }

  if (product.tabletDetails) {
    const details = product.tabletDetails;

    return (
      <SpecificationsList
        title="Tablet Specifications"
        specifications={[
          ["Processor", details.processor],
          ["RAM", details.ram],
          ["Storage", details.storage],
          ["Battery", details.battery],
          ["Screen Size", details.screenSize],
        ]}
      />
    );
  }

  return <p>Specifications are not available for this product.</p>;
};

type SpecificationsListProps = {
  title: string;
  specifications: [string, string][];
};

const SpecificationsList = ({ title, specifications }: SpecificationsListProps) => (

  <section>
    <h2>{title}</h2>

    <dl>
      {specifications.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  </section>

);

export default ProductSpecifications;
