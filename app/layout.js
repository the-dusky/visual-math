import "./globals.css";

export const metadata = {
  title: "Mekhi's Math Lab",
  description: "Visual math lessons — equations, inequalities, and more.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
