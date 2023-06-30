import MiniCreatePost from "@/components/MiniCreatePost";
import PostFeed from "@/components/PostFeed";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface pageProps {
  params: {
    slug: string;
  };
}

const page = async ({ params }: pageProps) => {
  const { slug } = params;
  const session = await getAuthSession();
  const subbreadit = await db.subbreadit.findFirst({
    where: {
      name: slug,
    },

    include: {
      posts: {
        include: {
          author: true,
          votes: true,
          comments: true,
          subbreadit: true,
        },
        take: INFINITE_SCROLLING_PAGINATION_RESULTS,
        orderBy: {
          createAt: "desc",
        },
      },
    },
  });

  if (!subbreadit) return notFound();

  return (
    <>
      <h1 className="font-semibold text-2xl h-7">r/{subbreadit.name}</h1>
      <MiniCreatePost session={session} />
      <PostFeed
        initialPosts={subbreadit.posts}
        subbreaditName={subbreadit.name}
      />
    </>
  );
};

export default page;
