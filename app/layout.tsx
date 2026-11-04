import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Xin Một Bữa Cơm",
  description: "Ăn xin online: bạn quét, mình no. Chọn món để mời mình một bữa, từ ly trà đá đến bữa cơm đủ đầy.",
};
export const viewport: Viewport = { themeColor: "#CDE6FF", width: "device-width", initialScale: 1, viewportFit: "cover" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /><link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800&family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playpen+Sans:wght@500;700&display=swap" rel="stylesheet" /></head><body>{children}</body></html>;
}
