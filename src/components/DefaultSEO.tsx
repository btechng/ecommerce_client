import React from "react";
import SEO from "./SEO"; // ✅ Matches exact file name and case

const DefaultSEO: React.FC = () => (
  <SEO
    title="TasknCart - Affordable Online Shopping"
    description="Shop top quality products at TasknCart. Affordable prices, fast delivery, secure checkout."
    keywords="ecommerce, online shopping, TasknCart, cheap products, best prices"
    image="https://taskncart.shop/default-seo.jpg"
    url="https://taskncart.shop"
  />
);

export default DefaultSEO;
