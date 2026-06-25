interface ToolSchemaProps {
  name: string
  slug: string
  description: string
  category?: string
}

export default function ToolSchema({
  name,
  slug,
  description,
  category = 'UtilityApplication',
}: ToolSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    url: `https://airanko.com/tools/${slug}`,
    description,
    applicationCategory: category,
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    provider: { '@id': 'https://airanko.com/#organization' },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
