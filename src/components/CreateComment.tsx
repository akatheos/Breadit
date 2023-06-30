"use client";

import { FC, useState } from "react";
import { Label } from "./ui/Label";
import { Textarea } from "./ui/Textarea";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import { CommentValidator } from "@/lib/validators/comment";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useRouter } from "next/navigation";

interface CreateCommentProps {
  postId: string;
  replyToId?: string;
}

const CreateComment: FC<CreateCommentProps> = ({ postId, replyToId }) => {
  const [input, setInput] = useState<string>("");
  const { loginToast } = useCustomToast();
  const router = useRouter();
  const { mutate: Comment, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentValidator) => {
      const payload: CommentValidator = {
        postId,
        text,
        replyToId,
      };
      const { data } = await axios.patch(
        `/api/subbreadit/post/comment/`,
        payload
      );
      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }
      return toast({
        title: "Something went wrong.",
        description: "Comment wasn't created successfully. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      router.refresh();
      setInput("");
    },
  });

  return (
    <div className="grid w-ful gap-1.5">
      <Label htmlFor="comment">Your comment</Label>
      <div className="mt-2">
        <Textarea
          id="comment"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
          placeholder="Leave a comment..."
        />
        <div className="mt-2 flex justify-end">
          <Button
            onClick={() =>
              Comment({
                postId,
                text: input,
                replyToId,
              })
            }
            isLoading={isLoading}
            disabled={input.length === 0 || isLoading}
          >
            Comment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateComment;
