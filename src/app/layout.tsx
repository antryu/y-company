import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#030712',
};

export const metadata: Metadata = {
  title: '_y Holdings — Interactive Company Simulator',
  description: 'Explore Andrew Tower: 29 AI agents across 10 floors. Chat with each agent, watch them work, and discover the _y Holdings universe.',
  keywords: ['AI', 'company simulator', 'interactive', '_y Holdings', 'agents'],
  openGraph: {
    title: '_y Holdings — Interactive Company Simulator',
    description: 'Explore Andrew Tower: 29 AI agents across 10 floors. Chat with each agent, watch them work, and discover the _y Holdings universe.',
    type: 'website',
    siteName: '_y Holdings',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: '_y Holdings — Interactive Company Simulator',
    description: '29 AI agents, 10 floors, 1 tower. Explore the _y Holdings universe.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
