const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://govershop.com";

const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Govershop",
    url: SITE_URL,
    description:
        "Platform top up game online termurah dan terpercaya di Indonesia. Mobile Legends, Free Fire, Genshin Impact, dan 100+ game lainnya.",
    potentialAction: {
        "@type": "SearchAction",
        target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
    },
};

const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Govershop",
    url: SITE_URL,
    logo: `${SITE_URL}/Banner/logo-govershop.png`,
    description:
        "Platform top up game online termurah dan terpercaya di Indonesia.",
    contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: ["id", "en"],
    },
};

export function JsonLd() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(websiteJsonLd),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(organizationJsonLd),
                }}
            />
        </>
    );
}
