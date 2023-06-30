"use client";

import dynamic from "next/dynamic";
import { FC } from "react";
import Image from "next/image";

const Output = dynamic(
  async () => (await import("editorjs-react-renderer")).default,
  { ssr: false }
);
interface EditorOutputProps {
  postTitle: string;
  content: any;
}
const renderers = {
  image: CustomImageRenderer,
  code: CustomCodeRenderer,
};
const style = {
  paragraph: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
};

const EditorOutput: FC<EditorOutputProps> = ({ content, postTitle }) => {
  return (
    <Output
      className="text-sm"
      renderers={renderers}
      style={style}
      data={content}
      postTitle={postTitle}
    />
  );
};

export default EditorOutput;

function CustomImageRenderer({
  data,
  postTitle,
}: {
  data: any;
  postTitle: string;
}) {
  const src = data.file.url;

  return (
    <div className="relative w-full min-h-[15rem]">
      <Image
        alt={postTitle + "image"}
        className="object-contain"
        fill
        sizes="100%"
        priority
        src={src}
      />
    </div>
  );
}

function CustomCodeRenderer({ data }: any) {
  return (
    <pre className="bg-gray-800 rounded-md p-4">
      <code className="text-gray-100 text-sm">{data.code}</code>
    </pre>
  );
}
