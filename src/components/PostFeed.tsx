"use client";

import { ExtendedPost } from "@/types/db";
import { FC, useEffect, useRef, useState } from "react";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import axios from "axios";
import PostComponent from "./PostComponent";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

interface PostFeedProps {
  initialPosts: ExtendedPost[];
  subbreaditName?: string;
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const PostFeed: FC<PostFeedProps> = ({ initialPosts, subbreaditName }) => {
  const lastPostRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });
  const { data: session } = useSession();
  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ["infinite-query"],
    async ({ pageParam = 1 }) => {
      const query =
        `/api/posts?limit=${INFINITE_SCROLLING_PAGINATION_RESULTS}&page=${pageParam}` +
        (!!subbreaditName ? `&subbreaditName=${subbreaditName}` : "");
      const { data } = await axios.get(query);
      return data as ExtendedPost[];
    },
    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
      initialData: { pages: [initialPosts], pageParams: [1] },
    }
  );
  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);
  const posts = data?.pages.flatMap((page) => page) ?? initialPosts;

  if (mounted && posts.length === 0 && subbreaditName)
    return (
      <div className="flex flex-col col-span-2 space-y-6">
        Theres no posts yet.
      </div>
    );

  return (
    <ul className="flex flex-col col-span-2 space-y-6">
      {posts.map((post, index) => {
        const votesAmt = post.votes.reduce((acc, vote) => {
          if (vote.type === "UP") return acc + 1;
          if (vote.type === "DOWN") return acc - 1;
          return acc;
        }, 0);
        const currentVote = post.votes.find(
          (vote) => vote.userId === session?.user.id
        );
        if (index === posts.length - 1) {
          return (
            <li key={post.id} ref={ref}>
              <PostComponent
                post={post}
                subbreaditName={post.subbreadit.name}
                commentAmt={post.comments.length}
                votesAmt={votesAmt}
                currentVote={currentVote}
              />
            </li>
          );
        } else {
          return (
            <PostComponent
              key={post.id}
              post={post}
              subbreaditName={post.subbreadit.name}
              commentAmt={post.comments.length}
              votesAmt={votesAmt}
              currentVote={currentVote}
            />
          );
        }
      })}
      {isFetchingNextPage && (
        <li className="flex justify-center">
          <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
        </li>
      )}
    </ul>
  );
};

export default PostFeed;
