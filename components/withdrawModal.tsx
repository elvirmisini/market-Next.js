"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getUser,
  getUserShopBalance,
  withdrawBalanceFromShop,
} from "@/db/utils";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function WithdrawModal() {
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>("0");
  const { data: session } = useSession();

  useEffect(() => {
    const fetchShopBalance = async () => {
      if (!session?.user) return;

      const user = await getUser(session.user.name);
      if (!user) return;

      const balance = await getUserShopBalance(user.username);
      setAmount(balance.toFixed(2));
    };

    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get("withdraw") === "true") {
      setShowDialog(true);
    }

    fetchShopBalance();
  }, [session]);

  const onWithdraw = async () => {
    setLoading(true);
    if (!session?.user) return;

    const user = await getUser(session.user.name);
    if (!user) {
      setError(true);
      setLoading(false);
      return;
    }

    try {
      await withdrawBalanceFromShop(user.username,parseFloat(amount));
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(true);
    }

    window.history.replaceState(null, "", window.location.pathname);
    setShowDialog(false);
    setLoading(false);
  };

  return (
    <Dialog open={showDialog}>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Withdraw Sui from your shop</DialogTitle>
          <DialogDescription>
            {amount === "0" ? (
              "You have nothing to withdraw from your shop. Please create a listing to earn."
            ) : (
              <span>
                You have <span className="text-green-500">${amount}</span> in
                your shop. Click the button below to withdraw it.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant={"secondary"}
            onClick={() => {
              window.history.replaceState(null, "", window.location.pathname);
              setShowDialog(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={onWithdraw}
            disabled={loading || amount === "0"}
          >
            {loading
              ? "Loading..."
              : success
              ? "Success!"
              : error
              ? "Error - please try again"
              : "Withdraw"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
