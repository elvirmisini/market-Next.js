"use client";

import { getReviewsForTarget, getUser } from "@/db/utils";
import { useEffect, useState } from "react";
import { Rating, User } from "@/db/schema";
import ReviewCard from "@/components/reviewCard";
import { getSession } from "next-auth/react";

/* 
  This ReviewListForTarget component is loaded on the client side and is responsible for retrieving 
  and displaying the reviews for a given target.
*/
export default function ReviewListForTarget({ target }: { target: string }) {

  const [reviews, setReviews] = useState<Rating[]>([]); // The reviews for the target
  const [loading, setLoading] = useState(true); // Whether the page is loading

  /* 
    On page load and whenever the target changes, get the current user and the reviews for the target.
  */
  useEffect(() => {
    setLoading(true); // Set loading to true

    // Get the reviews for the target
    getReviewsForTarget(target).then((reviews: Rating[]) => {
      setReviews(reviews); // Update the reviews state
      setLoading(false); // Set loading to false after fetching reviews
    });
  }, [target]);

  /*
    If the page is loading, display the provided loading message.
  */
  if (loading) {
    return (
      <div className="flex flex-col gap-4 items-center py-4 h-full">
        <span className="text-2xl text-gray-500">Loading...</span>
      </div>
    );
  }

  /*
    If there are no reviews, display a message saying so.
  */
  if (reviews.length === 0) {
    return (
      <div className="flex flex-col gap-4 items-center py-4 h-full">
        <span className="text-2xl text-gray-500">No reviews yet</span>
      </div>
    );
  }

  /*
    Otherwise, display the reviews.
  */
  return (
    <div className="flex flex-col gap-4 items-center py-4 h-full w-full">
      {reviews.map((review: Rating) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
