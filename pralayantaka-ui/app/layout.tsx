import "./globals.css";
import type { Metadata } from 'next';
import Providers from '../components/Providers';
import { Inter, Cinzel } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cinzel = Cinzel({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-cinzel' });

export const metadata: Metadata = {
    title: 'Pralayantaka Analytics',
    description: 'Real-time Crazy Time engagement and probability tracking platform',
    icons: {
        icon: '/favicon.ico',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${inter.variable} ${cinzel.variable}`}>
            <body className="font-sans antialiased bg-[#0F111A]">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}