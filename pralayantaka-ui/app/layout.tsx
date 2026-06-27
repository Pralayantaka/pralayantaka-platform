import "./globals.css";
import type { Metadata } from 'next';
import Providers from '../components/Providers';

export const metadata: Metadata = {
    title: 'Pralayantaka Analytics',
    description: 'Real-time Crazy Time engagement and probability tracking platform',
    icons: {
        icon: '/favicon.ico',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
            </head>
            <body style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}