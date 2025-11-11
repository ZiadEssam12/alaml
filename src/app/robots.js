export default function Robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard"],
        crawlDelay: 10,
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_BASE}/sitemap.xml`,
  };
}
