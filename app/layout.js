import './globals.css'
import { Providers } from './providers'

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://codeformatter.online'
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || ''

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'CodeFormatter — Free Online JSON, XML, YAML, CSV, HTML, CSS, JS Formatter & Converter',
    template: '%s · CodeFormatter',
  },
  description:
    'CodeFormatter is a free, fast online toolkit to format, minify, validate and convert JSON, XML, YAML, CSV, HTML, CSS, JavaScript, SQL, Base64 and JWT — plus a Diff Checker and JSON Tree Viewer. Everything runs privately in your browser. Built by NeoWebSolutions.',
  keywords: [
    'json formatter', 'json beautifier', 'json validator', 'json minifier',
    'xml formatter', 'xml to json', 'json to xml', 'yaml to json', 'json to yaml',
    'csv to json', 'json to csv', 'html formatter', 'css formatter', 'javascript formatter',
    'sql formatter', 'base64 encoder', 'base64 decoder', 'url encoder', 'jwt decoder',
    'diff checker', 'json tree viewer', 'developer tools', 'code beautifier', 'online formatter',
  ],
  authors: [{ name: 'NeoWebSolutions', url: 'https://neowebsolutions.netlify.app/' }],
  creator: 'NeoWebSolutions',
  publisher: 'NeoWebSolutions',
  applicationName: 'CodeFormatter',
  category: 'Developer Tools',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 } },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'CodeFormatter',
    title: 'CodeFormatter — Free Online JSON, XML, YAML, CSV, HTML, CSS, JS Formatter & Converter',
    description:
      '37+ free developer tools to format, minify, validate and convert JSON, XML, YAML, CSV, HTML, CSS, JavaScript, SQL, Base64 and JWT. Runs entirely in your browser.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeFormatter — Free Online JSON, XML, YAML, CSV, HTML, CSS, JS Formatter & Converter',
    description:
      '37+ free developer tools to format, minify, validate and convert data & code. Runs entirely in your browser.',
    creator: '@neowebsolutions',
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
  width: 'device-width',
  initialScale: 1,
}

// JSON-LD structured data — improves rich results in Google Search
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#webapp`,
      name: 'CodeFormatter',
      url: SITE_URL,
      description:
        'A free suite of 37+ developer tools to format, minify, validate and convert JSON, XML, YAML, CSV, HTML, CSS, JavaScript, SQL, Base64 and JWT — plus a Diff Checker and JSON Tree Viewer.',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      publisher: {
        '@type': 'Organization',
        name: 'NeoWebSolutions',
        url: 'https://neowebsolutions.netlify.app/',
      },
      featureList: [
        'JSON Formatter and Validator',
        'XML to JSON Converter',
        'JSON to XML Converter',
        'YAML to JSON Converter',
        'CSV to JSON Converter',
        'HTML / CSS / JavaScript Beautifier',
        'SQL Formatter',
        'Base64 Encoder and Decoder',
        'JWT Decoder',
        'URL Encoder',
        'Diff Checker',
        'JSON Tree Viewer',
        'UUID Generator',
        'SHA-256 / SHA-1 Hash Generator',
      ],
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'NeoWebSolutions',
      url: 'https://neowebsolutions.netlify.app/',
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'CodeFormatter',
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en-US',
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Is CodeFormatter free to use?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Every tool on CodeFormatter is 100% free. No signup, no watermark, no rate limits.' } },
        { '@type': 'Question', name: 'Is my data safe on CodeFormatter?', acceptedAnswer: { '@type': 'Answer', text: 'Absolutely. All formatting, minifying, validation and conversion happens locally inside your web browser. Your data never touches our servers.' } },
        { '@type': 'Question', name: 'Can I convert XML to JSON?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Open the XML to JSON converter, paste your XML on the left, and copy the JSON output on the right.' } },
        { '@type': 'Question', name: 'Does CodeFormatter work offline?', acceptedAnswer: { '@type': 'Answer', text: 'Once the page has loaded, every tool works completely offline because the processing is client-side.' } },
      ],
    },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {ADSENSE_CLIENT && <meta name="google-adsense-account" content={ADSENSE_CLIENT} />}
        <link rel="canonical" href={SITE_URL} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script dangerouslySetInnerHTML={{__html: `try{var t=localStorage.getItem('cf-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}`}} />
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body suppressHydrationWarning className="text-[17px] leading-relaxed antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
