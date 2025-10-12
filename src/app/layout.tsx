import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ConvexClientProvider } from "./ConvexClientProvider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Civ drafter",
  description: "Civilization VI leader and map drafter",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[url('/background.jpg')] bg-cover bg-center bg-fixed bg-no-repeat flex justify-center items-center min-h-screen`}
      >
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  )
}
