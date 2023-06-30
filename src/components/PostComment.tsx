"use client";

import { FC, useRef, useState } from "react";
import UserAvatar from "./UserAvatar";
import { Comment, CommentVote, User, VoteType } from "@prisma/client";
import { formatTimeToNow } from "@/lib/utils";
import CommentVotes from "./CommentVotes";
import { Button } from "./ui/Button";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Label } from "./ui/Label";
import { Textarea } from "./ui/Textarea";
import { useMutation } from "@tanstack/react-query";
import { CommentValidator } from "@/lib/validators/comment";
import axios, { AxiosError } from "axios";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";

type ExtendedComment = Comment & { votes: CommentVote[]; author: User };

interface PostCommentProps {
  comment: ExtendedComment;
  votesAmt: number;
  currentVote: VoteType | null;
  postId: string;
}

const PostComment: FC<PostCommentProps> = ({
  comment,
  votesAmt,
  currentVote,
  postId,
}) => {
  const commentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const [isReplying, SetIsReplying] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const { loginToast } = useCustomToast();
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
      SetIsReplying(false);
    },
  });

  return (
    <div ref={commentRef} className="flex flex-col">
      <div className="flex items-center">
        <UserAvatar
          user={{
            username: comment.author.username || null,
            image: comment.author.image || null,
          }}
          className="h-6 w-6"
        />
        <div className="ml-2 flex items-center gap-x-2">
          <p className="text-sm font-medium text-gray-900">
            u/{comment.author.username}
          </p>{" "}
          <p className="max-h-40 truncate text-xs text-zinc-500">
            {formatTimeToNow(new Date(comment.createAt))}
          </p>
        </div>
      </div>
      <p className="text-sm text-zinc-900 mt-2">{comment.text}</p>
      <div className="flex gap-2 items-center flex-wrap">
        <CommentVotes
          commentId={comment.id}
          initialVotesAmt={votesAmt}
          initialVote={currentVote}
        />
        <Button
          onClick={() => {
            if (!session) return router.push("/sign-in");
            SetIsReplying(!isReplying);
          }}
          variant="ghost"
          size="sm"
          aria-label="reply-button"
        >
          <MessageSquare className="h-4 w-4 mr-1.5" />
          Reply
        </Button>
        {isReplying ? (
          <div className="grid w-full gap-1.5">
            <Label htmlFor="comment">Your reply</Label>
            <div className="mt-2">
              <Textarea
                id="comment"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder="Leave a reply..."
              />
              <div className="mt-2 flex justify-end">
                <Button
                  tabIndex={-1}
                  variant="ghost"
                  onClick={() => {
                    if (isReplying) SetIsReplying(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (!input) return;
                    Comment({
                      postId,
                      text: input,
                      replyToId: comment.replyToId ?? comment.id,
                    });
                  }}
                  isLoading={isLoading}
                  disabled={input.length === 0 || isLoading}
                >
                  Reply
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PostComment;
