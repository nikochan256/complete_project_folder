// app/layout.js
import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
// import StoreProvider from "../";
import "./globals.css";
import LoadingScreen from "../components/LoadingScreen";
import ClearStorageOnClose from "../components/ClearStorageOnClose";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
  title: "Dmarketplace multi vendo",
  description: "Dmarketplace s- Shop smarter",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.className} antialiased`}>
        <ClearStorageOnClose>
          <LoadingScreen>
            {/* <StoreProvider> */}
              <Toaster />
              {children}
            {/* </StoreProvider> */}
          </LoadingScreen>
        </ClearStorageOnClose>
      </body>
    </html>
  );
}
