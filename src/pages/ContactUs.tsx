import React from "react";
import { Helmet } from "react-helmet";

export default function ContactUs() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    mainEntity: {
      "@type": "Organization",
      name: "TasknCart",
      url: "https://taskncart.shop",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+2348148494924",
        contactType: "Customer Service",
        areaServed: "NG",
        availableLanguage: "English",
      },
    },
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Helmet>
        <title>Contact Us | TasknCart</title>
        <meta
          name="description"
          content="Get in touch with TasknCart. Call, email, or send us a message for support on your orders and services."
        />
        <link rel="canonical" href="https://taskncart.shop/contact-us" />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>

      <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
      <p>
        We’d love to hear from you! For general inquiries or press requests,
        contact us:
      </p>
      <ul className="list-disc ml-6 mt-4">
        <li>📞 Phone: +234 814 849 4924</li>
        <li>📧 Email: support@taskncart.shop</li>
        <li>🏢 Address: Lagos, Nigeria</li>
      </ul>
    </div>
  );
}
