"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { Item, User } from "@/db/schema";
import { useEffect, useState } from "react";
import {
  addItemToWatchList,
  getItemById,
  getUser,
  isUserWatchingItem,
  removeItemFromWatchList,
} from "@/db/utils";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "./ui/card";

export default function ItemCard({ itemId }: { itemId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [isWatched, setIsWatched] = useState(false);

  const { data: session } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch the item by ID
      const fetchedItem = await getItemById(itemId);
      setItem(fetchedItem);

      // Fetch the user data if logged in
      if (session?.user) {
        const fetchedUser = await getUser(session.user.name);
        setUser(fetchedUser);

        // Check if the item is on the user's watch list
        const watching = await isUserWatchingItem(session.user.name, itemId);
        
        setIsWatched(watching);
      }
    };

    fetchData();
  }, [itemId, session]);

  if (!item)  return (<></>); // If item is null, return empty fragment
  return (
    <a href={`/item/${item.owner}/${item.id}`}>
      <Card className="hover:scale-105 transform transition duration-300 ">
        <CardHeader className="px-0 py-0">
          <CardTitle>
            {" "}
            <Image
              src={item.image}
              alt={item.title}
              className="rounded-t-md object-cover w-[240px] h-[240px]"
              width={240}
              height={240}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <div className="hover:underline text-blue-500 font-medium hover:cursor-pointer text-sm">
            {item.title}
          </div>
        </CardContent>
        <CardFooter>
          <div className="w-full flex flex-row justify-between items-center gap-2">
            <p className="text-xl font-medium">${item.price}</p>
            {isWatched ? (
              <Star
                className="text-blue-500"
                size={24}
                onClick={async (e) => {
                  e.preventDefault();
                  if (user !== null) {
                    await removeItemFromWatchList(user.username, item.id);
                    setIsWatched(false);
                  }
                }}
              />
            ) : (
              <Star
                className="text-gray-500"
                size={24}
                onClick={async (e) => {
                  e.preventDefault();
                  if (user !== null) {
                    await addItemToWatchList(user.username, item.id);
                    setIsWatched(true);
                  }
                }}
              />
            )}
          </div>
        </CardFooter>
      </Card>
    </a>
  );
}
