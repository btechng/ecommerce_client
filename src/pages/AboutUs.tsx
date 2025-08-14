import React from "react";
import { Helmet } from "react-helmet";

export default function AboutUs() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    mainEntity: {
      "@type": "Organization",
      name: "TasknCart",
      url: "https://taskncart.shop",
      logo: "https://taskncart.shop/logo.jpg", // Replace with actual logo
      sameAs: [
        "https://facebook.com/taskncart",
        "https://instagram.com/taskncart",
        "https://twitter.com/taskncart",
      ],
      description:
        "TasknCart is your trusted platform to buy, sell, and connect with vendors for easy access to services.",
    },
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Helmet>
        <title>About Us | TasknCart</title>
        <meta
          name="description"
          content="Learn more about TasknCart, your trusted source for buying, selling, and connecting with verified vendors for easy access to services."
        />
        <link rel="canonical" href="https://taskncart.shop/about-us" />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>

      <h1 className="text-2xl font-bold mb-4">About Us</h1>
      <p>
        TasknCart is your trusted source for buying, selling, and connecting
        with verified vendors for quick and easy access to services.
      </p>
    </div>
  );
}
