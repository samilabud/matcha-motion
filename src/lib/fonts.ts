import { DM_Serif_Display, Inter } from "next/font/google";

// Figma Core: Typography/Font Family/Primary Font and Secondary Font.
export const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
export const dmSerif = DM_Serif_Display({ variable: "--font-dm-serif", subsets: ["latin"], weight: "400" });

export const fontVariables = `${inter.variable} ${dmSerif.variable}`;
