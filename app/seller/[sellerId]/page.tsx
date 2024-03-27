"use client";

import { getUser } from "@/db/utils";
import ProfilePageContent from "./profilePageContent";
import { useEffect, useState } from "react";
import { User } from "@/db/schema";
import { AlertTriangle } from "lucide-react";
import { SessionProvider } from "next-auth/react";

export default function SellerPage({
  params,
}: {
  params: { sellerId: string };
}) {
  const [seller, setSeller] = useState<User | null>(null); // The seller to display on the page

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const fetchedSeller = await getUser(params.sellerId);
        setSeller(fetchedSeller);
      } catch (error) {
        console.error("Error fetching seller:", error);
        setSeller(null);
      }
    };

    fetchSeller();
  }, [params.sellerId]);

  if (!seller) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertTriangle className="w-16 h-16 text-yellow-400" />
        <span>Seller not found</span>
      </div>
    );
  }

  return (
    <SessionProvider>
      <ProfilePageContent seller={seller} />
    </SessionProvider>
  );
}
