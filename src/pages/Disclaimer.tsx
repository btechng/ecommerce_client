import React from "react";
import { Helmet } from "react-helmet";

export default function Disclaimer() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Disclaimer - TasknCart",
    url: "https://taskncart.shop/disclaimer",
    description:
      "Disclaimer for TasknCart, outlining the limits of responsibility for content accuracy and vendor services.",
    mainEntity: {
      "@type": "CreativeWork",
      name: "Disclaimer",
      about:
        "Limitations of liability and accuracy disclaimer for TasknCart content and vendor listings.",
    },
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Helmet>
        <title>Disclaimer | TasknCart</title>
        <meta
          name="description"
          content="Read the TasknCart Disclaimer, explaining limitations on liability and the accuracy of vendor listings."
        />
        <link rel="canonical" href="https://taskncart.shop/disclaimer" />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>

      <h1 className="text-2xl font-bold mb-4">Disclaimer</h1>
      <p>
        The content on TasknCart is for everyone. While we strive to vet every
        vendor, we do not guarantee the completeness. Users are encouraged to
        verify facts independently.
      </p>
    </div>
  );
}
