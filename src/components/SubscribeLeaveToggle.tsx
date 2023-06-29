"use client";

import { FC, startTransition } from "react";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import { SubbreaditSubscriptionPayload } from "@/lib/validators/subbreadit";
import axios, { AxiosError } from "axios";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface SubscribeLeaveToggleProps {
  subbreaditId: string;
  subbreaditName: string;
  isSubscribed: boolean;
}

const SubscribeLeaveToggle: FC<SubscribeLeaveToggleProps> = ({
  subbreaditId,
  subbreaditName,
  isSubscribed,
}) => {
  const { loginToast } = useCustomToast();
  const router = useRouter();
  const { mutate: subscribe, isLoading: isSubscribing } = useMutation({
    mutationFn: async () => {
      const payload: SubbreaditSubscriptionPayload = {
        subbreaditId,
      };
      const { data } = await axios.post("/api/subbreadit/subscribe", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }
      return toast({
        title: "There was a problem !",
        description: "Something went wrong, please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });
      return toast({
        title: "Subscribed successfully!",
        description: `You are now subscribed to r/${subbreaditName}.`,
      });
    },
  });
  const { mutate: unsubscribe, isLoading: isUnSubscribing } = useMutation({
    mutationFn: async () => {
      const payload: SubbreaditSubscriptionPayload = {
        subbreaditId,
      };
      const { data } = await axios.post("/api/subbreadit/unsubscribe", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }
      return toast({
        title: "There was a problem !",
        description: "Something went wrong, please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });
      return toast({
        title: "Unsubscribed successfully!",
        description: `You are now unsubscribed from r/${subbreaditName}.`,
      });
    },
  });

  return isSubscribed ? (
    <Button
      className="w-full mt-1 mb-4"
      isLoading={isUnSubscribing}
      disabled={isUnSubscribing}
      onClick={() => unsubscribe()}
    >
      Leave community
    </Button>
  ) : (
    <Button
      className="w-full mt-1 mb-4"
      isLoading={isSubscribing}
      disabled={isSubscribing}
      onClick={() => subscribe()}
    >
      Join to post
    </Button>
  );
};

export default SubscribeLeaveToggle;
