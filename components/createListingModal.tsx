"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addNewItem, getUser } from "@/db/utils";
import { CATEGORIES, Category, valueToCategory } from "@/lib/categories";
import { Textarea } from "./ui/textarea";
import { DollarSign } from "lucide-react";
import { useSession } from "next-auth/react";
import { User } from "@/db/schema";

/* 
  This component is responsible for rendering the create listing modal. It is displayed when the user
  clicks the "Sell" button in the header.
*/
export default function CreateListingModal() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [listingPrice, setListingPrice] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      const fetchUserData = async () => {
        const userData = await getUser(session.user.name);
        setUser(userData);
      };
      fetchUserData();
    } else {
      setUser(null);
    }
  }, [session, status]);

  const onCreateListing = async () => {
    if (!user) {
      return; // If user is not logged in, exit function
    }

    setLoading(true);

    const parsedQuantity = parseInt(quantity);
    const parsedPrice = parseFloat(listingPrice);

    if (isNaN(parsedQuantity) || isNaN(parsedPrice)) {
      setError(true);
      setLoading(false);
      return;
    }``
    const newItem = {
      id: Math.random().toString(36).substring(7), // Generate a unique ID for the item
      title:name||"No title",
      description:description||"No description provided",
      price: parsedPrice||1,
      image: url||"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuKaWgRjHVDbkzxYfB5AYZHOmlvl-p2VoIUKlapKWM5A&s",
      totalSupply: parsedQuantity||1,
      avaliableSupply: parsedQuantity||1,
      owner: session.user.name,
      category:category.value||"toysAndGames",
      sellerId: user.username,
      listed: 1,
    };

    try {
      await addNewItem(newItem);
      setSuccess(true);
    } catch (error) {
      setError(true);
    }

    setLoading(false);

    // Reset form fields
    setName("");
    setDescription("");
    setListingPrice("");
    setUrl("");
    setQuantity("1");
    setCategory(null);

    // Redirect to seller page with listings tab selected
    // This part is not implemented as it's specific to your routing setup
  };

  if (!user || status === "loading") {
    return <></>; // If user is not logged in or session is loading, return empty fragment
  }
  
  /* 
    Otherwise, return the following UI:
  */
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <DollarSign className="h-4 w-4 mr-1" />
          Sell
        </Button>
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Create a new listing</DialogTitle>
          <DialogDescription>
            Enter all of the details for your new listing. Click submit to
            create the listing.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Description
            </Label>
            <Textarea
              id="username"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Listing price
            </Label>
            <Input
              id="username"
              value={listingPrice}
              onChange={(e) => {
                setListingPrice(e.target.value);
              }}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Image URL
            </Label>
            <Input
              id="username"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
              }}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Quantity
            </Label>
            <Input
              id="username"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
              }}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Category
            </Label>
            <Select
              value={category?.value}
              onValueChange={(value) => {
                if (value === category?.value) {
                  setCategory(null);
                } else {
                  setCategory(valueToCategory(value));
                }
              }}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue
                  placeholder="Select a category"
                  defaultValue="Select a category"
                />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={onCreateListing}
            disabled={loading || !user}
          >
            {!user
              ? "Connect wallet to sell stuff!"
              : loading
              ? "Loading..."
              : success
              ? "Success!"
              : error
              ? "Error - please try again"
              : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
