"use client";

import { FC, useRef } from "react";
import { Post, User, Vote } from "@prisma/client";
import { formatTimeToNow } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import EditorOutput from "./EditorOutput";
import PostVoteClient from "./post-vote/PostVoteClient";

type PartialVote = Pick<Vote, "type">;

interface PostProps {
  subbreaditName: string;
  post: Post & {
    author: User;
    votes: Vote[];
  };
  commentAmt: number;
  votesAmt: number;
  currentVote?: PartialVote;
}

const PostComponent: FC<PostProps> = ({
  subbreaditName,
  post,
  commentAmt,
  votesAmt,
  currentVote,
}) => {
  const postRef = useRef<HTMLDivElement>(null);

  return (
    <div className="rounded-md bg-white shadow">
      <div className="px-6 py-4 flex justify-between">
        <PostVoteClient
          postId={post.id}
          initialVotesAmt={votesAmt}
          initialVote={currentVote?.type}
        />
        <div className="w-0 flex-1">
          <div className="max-h-40 mt-1 text-xs text-gray-500">
            <a
              className="underline text-zinc-900 text-sm underline-offset-2"
              href={`/r/${subbreaditName}`}
            >
              r/{subbreaditName}
            </a>
            <span className="px-1">•</span>
            <span>Posted by u/{post?.author.username}</span>
            <span className="px-1">•</span>
            {formatTimeToNow(new Date(post?.createAt))}
          </div>
          <a href={`/r/${subbreaditName}/post/${post.id}`}>
            <h1 className="text-lg font-semibold py-2 leading-6 text-gray-900">
              {post.title!}
            </h1>
          </a>
          <div
            className="relative text-sm max-h-96 w-full overflow-clip"
            ref={postRef}
          >
            <EditorOutput content={post.content} postTitle={post.title} />
            {postRef.current?.clientHeight === 384 ? (
              <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent"></div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="bg-gray-50 z-20 text-sm p-4 sm:px-6">
        <a
          className="w-fit flex items-center gap-2"
          href={`/r/${subbreaditName}/post/${post.id}`}
        >
          <MessageSquare className="h-4 w-4" />{" "}
          {commentAmt > 1 ? (
            <span>{commentAmt} comments</span>
          ) : commentAmt === 1 ? (
            <span>{commentAmt} comment</span>
          ) : (
            <span>No comments yet</span>
          )}
        </a>
      </div>
    </div>
  );
};

export default PostComponent;
