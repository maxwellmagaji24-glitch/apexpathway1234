import { UserProvider } from './context/UserContext';
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>   {/* ← wraps everything */}
          {children}
        </UserProvider>
      </body>
    </html>
  );
}