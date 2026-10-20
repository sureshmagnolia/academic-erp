import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'ERP4Colleges | Academic Management & Student Portal',
  description:
    'Academic ERP system featuring secure Google OAuth sign-in and verified student email whitelist control.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Providers>
          <div className="app-shell">
            <Navbar />
            <main className="main-content">{children}</main>
            <footer className="footer-wrapper">
              <div className="footer-container">
                <p className="footer-text">
                  &copy; 2026 ERP4Colleges. Student Data & Academic Management System.
                </p>
                <div className="footer-links">
                  <span>Secured with Google OAuth</span>
                  <span>•</span>
                  <span>Verified Whitelist Access</span>
                  <span>•</span>
                  <span>Deployed on Vercel</span>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
