import "./globals.css";

export const metadata = {
  title: "Box Algebra",
  description: "What's hiding in the box? A visual algebra learning tool.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
