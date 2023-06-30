import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { db } from "@/lib/db";
import PostFeed from "./PostFeed";
import { getAuthSession } from "@/lib/auth";

const CustomFeed = async () => {
  const session = await getAuthSession();
  const followedCommunities = await db.subscription.findMany({
    where: {
      userId: session?.user.id,
    },
    include: {
      subbreadit: true,
    },
  });
  const posts = await db.post.findMany({
    where: {
      subbreadit: {
        name: {
          in: followedCommunities.map(({ subbreadit }) => subbreadit.id),
        },
      },
    },
    orderBy: {
      createAt: "desc",
    },
    include: {
      votes: true,
      author: true,
      comments: true,
      subbreadit: true,
    },
    take: INFINITE_SCROLLING_PAGINATION_RESULTS,
  });
  return <PostFeed initialPosts={posts} />;
};

export default CustomFeed;
