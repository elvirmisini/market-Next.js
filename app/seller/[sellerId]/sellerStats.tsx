"use client";

import { useEffect, useState } from "react";
import {
  getNumberOfRatingsForTarget,
  getStarsForTarget,
  getUserNumberOfPurchases,
  getUserNumberOfSales,
} from "@/db/utils";
import { User } from "@/db/schema";
import { Star } from "lucide-react";

export default function SellerStats({ seller }: { seller: User }) {
  const [numberOfSales, setNumberOfSales] = useState(0);
  const [numberOfPurchases, setNumberOfPurchases] = useState(0);
  const [stars, setStars] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);

  useEffect(() => {
    const fetchSellerStats = async () => {
      const sales = await getUserNumberOfSales(seller.username);
      const purchases = await getUserNumberOfPurchases(seller.username);
      const avgStars = await getStarsForTarget(seller.username);
      const ratingsCount = await getNumberOfRatingsForTarget(seller.username);

      setNumberOfSales(sales);
      setNumberOfPurchases(purchases);
      setStars(avgStars);
      setRatingCount(ratingsCount);
    };

    fetchSellerStats();
  }, [seller]);

  return (
    <div className="flex flex-row justify-center items-center mb-1">
      <span className="text-sm text-gray-500 whitespace-nowrap">
        {numberOfSales} Sales
      </span>
      <span className="text-sm text-gray-500 mx-2">•</span>
      <span className="text-sm text-gray-500 whitespace-nowrap">
        {numberOfPurchases} Purchases
      </span>
      <span className="text-sm text-gray-500 mx-2">•</span>
      {stars == null ? (
        <span className="text-sm text-gray-500 whitespace-nowrap">
          No reviews yet
        </span>
      ) : (
        <div className="text-sm text-gray-500 flex flex-row gap-2 items-center">
          <div className="flex flex-row">
            {[1, 2, 3, 4, 5].map((i) => {
              return (
                <Star
                  key={i}
                  size={13}
                  className={
                    i <= Math.round(stars)
                      ? "text-gray-500 fill-gray-500"
                      : "text-gray-500"
                  }
                />
              );
            })}
          </div>
          <span>({ratingCount})</span>
        </div>
      )}
    </div>
  );
}
