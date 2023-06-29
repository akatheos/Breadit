import Editor from "@/components/Editor";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface pageProps {
  params: {
    slug: string;
  };
}

const page = async ({ params }: pageProps) => {
  const subbreadit = await db.subbreadit.findFirst({
    where: {
      name: params.slug,
    },
  });
  if (!subbreadit) return notFound();

  return (
    <div className="flex flex-col items-start gap-6">
      <div className="border-b border-gray-200 pb-5">
        <div className="-ml-2 -mt-2 flex-wrap items-baseline">
          <h3 className="ml-2 mt-2 text-base font-semibold leading-6 text-gray-900">
            Bread a post
          </h3>
          <p className="ml-2 mt-1 truncate text-sm text-gray-500">
            in r/{params.slug}
          </p>
        </div>
      </div>
      <Editor subbreaditId={subbreadit.id} />
    </div>
  );
};

export default page;
