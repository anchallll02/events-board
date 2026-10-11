import "./globals.css";

export const metadata = {
  title: "Community Events Board",
  description: "Discover local events near you",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}