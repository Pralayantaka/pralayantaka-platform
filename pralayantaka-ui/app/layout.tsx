import "./globals.css"; // This connects your Tailwind CSS
import Providers from '../components/Providers'; // Updated path

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}