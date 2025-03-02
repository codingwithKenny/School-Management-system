import 'react-calendar/dist/Calendar.css';
import './globals.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ClerkProvider } from '@clerk/nextjs';
import { DatabaseProvider } from './context/DatabaseProvider';
import { Toaster } from '@/components/ui/toaster';
import InactivityTimeout from '@/components/InactivityTimeout';

export const metadata = {
  title: 'Muslim Group of Schools - Best Secondary School in Oyo, Nigeria',
  description: 'Muslim Group of Schools is a top Islamic secondary school in Oyo, Nigeria, offering quality education with strong moral and academic excellence.',
  keywords: 'Muslim school in Nigeria, best secondary school in Oyo, Islamic schools in Nigeria, top Muslim schools, quality education in Oyo',
  author: 'Muslim Group of Schools',
  robots: 'index, follow',
  openGraph: {
    title: 'Muslim Group of Schools - Best Secondary School in Oyo, Nigeria',
    description: 'Join the best Islamic secondary school in Oyo, Nigeria, focused on academic excellence and moral values.',
    url: 'https://muslimgroupofschools.com',
    type: 'website',
    images: [
      {
        url: 'https://muslimgroupofschools.com/logo.png',
        width: 1200,
        height: 630,
        alt: 'Muslim Group of Schools - Leading Secondary School in Oyo',
      },
    ],
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className="">
        <ClerkProvider frontendApi="pk_live_Y2xlcmsubXVzbGltZ3JvdXBvZnNjaG9vbHMuY29tJA">
          <DatabaseProvider> 
          <InactivityTimeout />

            {children}
            <Toaster />

          </DatabaseProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
