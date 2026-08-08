import { Geist, Geist_Mono,Schoolbell } from "next/font/google";
import Footer from "@/components/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const schoolbell = Schoolbell({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-schoolbell",
});

export const metadata = {
  title: "Sat-Draw | Multiplayer drawing game",
  description: "Create a room, draw live, and race your friends to guess the word.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}  ${schoolbell.variable}  h-full antialiased`}
    >

      <body className="min-h-full flex flex-col bg-blue-800">
        
        {children}
        <Footer />
        </body>
    </html>
  );
}
