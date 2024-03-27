"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/db/schema";
import {
  addItemToWatchList,
  getUser,
  isUserWatchingItem,
  purchaseItem,
  removeItemFromWatchList,
  unlistItem,
} from "@/db/utils";
import { CartItem } from "@/lib/cart";
import { UserStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ShoppingCartIcon } from "lucide-react";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function PurchaseSection({
  itemId,
  sellerUsername,
  available,
  listed,
  itemTitle,
  itemImage,
  itemPrice,
}: {
  itemId: string;
  sellerUsername: string;
  listed: 0 | 1;
  available: number;
  itemTitle: string;
  itemImage: string;
  itemPrice: number;
}) {
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [userStatus, setUserStatus] = useState(UserStatus.Visitor);
  const [quantity, setQuantity] = useState<string>("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isWatched, setIsWatched] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const session = await getSession();
      if (session?.user) {
        const fetchedUser = await getUser(session.user.name);
        setUser(fetchedUser);
        setUserStatus(
          fetchedUser.username === sellerUsername
            ? UserStatus.Seller
            : UserStatus.Buyer
        );
        const watching = await isUserWatchingItem(session.user.name, itemId);
        setIsWatched(watching);
      }
    };

    fetchData();
  }, []);

  const onBuyNow = async () => {
    if (!user || user.username === sellerUsername) return;
    setLoading(true);
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setError("Invalid quantity!");
      setLoading(false);
      return;
    }

    await purchaseItem(itemId,parsedQuantity, user.username);
    setSuccess("Purchase successful!");
    setLoading(false);
    // Redirect user to their profile page
  };

  const onAddToCart = async () => {
    if (!user || user.username === sellerUsername) return;
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setError("Invalid quantity!");
      return;
    }
    const existingItemIndex = cart.findIndex((item) => item.id === itemId);
    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += parsedQuantity;
    } else {
      cart.push({
        id: itemId, quantity: parsedQuantity,
        title: itemTitle,
        image: itemImage,
        sellerAddress:user.shippingAddress,
        price: itemPrice
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    // Display toast
  };

  const onRemoveListing = async () => {
    if (!user || user.username !== sellerUsername) return;
    setLoading(true);
    await unlistItem(itemId);
    setSuccess("Listing removed!");
    setLoading(false);
    // Redirect user to their profile page
  };

  return (
    <Card className="items-center p-6 flex flex-col gap-3 w-3/12 sticky top-6">
      {userStatus === UserStatus.Seller && (
        <Button
          disabled={loading || listed === 0}
          className="w-full"
          variant="destructive"
          onClick={onRemoveListing}
        >
          {loading
            ? "Loading..."
            : success
            ? success
            : error
            ? error
            : listed == 1
            ? "Remove listing"
            : "Listing removed"}
        </Button>
      )}
      {userStatus === UserStatus.Buyer && (
        <div className="flex flex-col items-center w-full gap-4">
          <div className="flex justify-center flex-col items-start w-full">
            <p className="text-3xl font-semibold">${itemPrice}</p>
            <p
              className={cn(
                `text-xl font-semibold`,
                available === 0 ? "text-red-600" : "text-green-600"
              )}
            >
              {available === 0 ? "Out of Stock" : "In Stock"}
            </p>
          </div>

          <div className="w-full flex flex-row items-center justify-start gap-4">
            <Label htmlFor="username" className="text-center text-lg">
              Qty:
            </Label>
            <Input
              id="username"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
              }}
              type="number"
              className={
                "w-[90px] bg-white flex flex-row items-center border border-black/25 rounded py-2 px-3 space-x-2" +
                `${
                  isNaN(parseInt(quantity)) || parseInt(quantity) > available
                    ? " text-red-500"
                    : ""
                }`
              }
            />
          </div>
          <Button
            disabled={loading || available === 0 || listed === 0}
            className="w-full font-medium bg-[#FFA41C] text-black hover:bg-[#FFB41C]"
            onClick={onBuyNow}
          >
            {loading
              ? "Loading..."
              : success
              ? success
              : error
              ? error
              : available === 0
              ? "Out of stock"
              : listed === 1
              ? "Buy now"
              : "Item not available"}
          </Button>
          <Button
            disabled={loading || available === 0 || listed === 0}
            className="w-full font-medium bg-[#FFD813] text-black hover:bg-[#FFE813]"
            onClick={onAddToCart}
          >
            <ShoppingCartIcon className="w-4 h-4 mr-2" />
            {loading
              ? "Loading..."
              : success
              ? success
              : error
              ? error
              : available === 0
              ? "Out of stock"
              : listed === 1
              ? "Add to cart"
              : "Item not available"}
          </Button>
          <div className="py-2 w-full">
            <div className="bg-black/50 w-full h-px" />
          </div>
          {isWatched ? (
            <Button
              disabled={loading || available === 0 || listed === 0}
              variant="outline"
              className="w-full font-medium  rounded-lg text-black "
              onClick={() =>{
                if (!user) return;
                removeItemFromWatchList(user.username, itemId);
                setIsWatched(false);
              }}
                          >
                            Remove from Watch List
                          </Button>
                        ) : (
                          <Button
                            disabled={loading || available === 0 || listed === 0}
                            className="w-full font-medium bg-white border border-black/50 py-3 rounded-full text-black hover:bg-white"
                            onClick={() => {
                              if (!user) return;
                              addItemToWatchList(user.username, itemId);
                              setIsWatched(true);
                            }}
                          >
                            Add to Watch List
                          </Button>
                        )}
                      </div>
                    )}
                    {userStatus === UserStatus.Visitor && (
                      <Button disabled variant="outline" className="w-full">
                        Log in to purchase
                      </Button>
                    )}
                  </Card>
                );
              }
              