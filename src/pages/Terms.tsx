import React from "react";
import { Helmet } from "react-helmet";

export default function Terms() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Terms & Conditions - TasknCart",
    url: "https://taskncart.shop/terms",
    description:
      "Read the Terms & Conditions for using TasknCart, including guidelines for respectful interaction and proper use of our platform.",
    mainEntity: {
      "@type": "CreativeWork",
      name: "Terms & Conditions",
      about: "Legal terms and rules for using the TasknCart platform.",
    },
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Helmet>
        <title>Terms & Conditions | TasknCart</title>
        <meta
          name="description"
          content="Review the Terms & Conditions for using TasknCart, including guidelines for respectful commenting, content usage, and platform rules."
        />
        <link rel="canonical" href="https://taskncart.shop/terms" />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>

      <h1 className="text-2xl font-bold mb-4">Terms & Conditions</h1>
      <p>
        By using TasknCart, you agree to our terms of use including respectful
        commenting, non-reproduction of content without credit, and not misusing
        the platform.
      </p>
    </div>
  );
}
