import type { Metadata } from "next";
import { Noto_Sans_Georgian } from "next/font/google";
import "./globals.css";

const notoSansGeorgian = Noto_Sans_Georgian({
  subsets: ["georgian", "latin"],
  variable: "--font-georgian",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "EXPRO.GE - ევაკუატორი და ტვირთის გადაზიდვა",
  description:
    "საქართველოში ევაკუატორის და ტვირთის გადაზიდვის სერვისი. სწრაფი, საიმედო და ხელმისაწვდომი ფასები თბილისსა და რეგიონებში.",
  keywords: [
    "ევაკუატორი",
    "ტვირთის გადაზიდვა",
    "თბილისი",
    "საქართველო",
    "evacuator",
    "cargo",
  ],
  openGraph: {
    title: "EXPRO.GE - ევაკუატორი და ტვირთის გადაზიდვა",
    description:
      "საქართველოში ევაკუატორის და ტვირთის გადაზიდვის სერვისი. სწრაფი, საიმედო და ხელმისაწვდომი ფასები.",
    locale: "ka_GE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ka">
      <body className={`${notoSansGeorgian.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
