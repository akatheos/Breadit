"use client";

import { FC, useCallback, useEffect, useRef, useState } from "react";
import TextAreaAutosize from "react-textarea-autosize";
import { useForm } from "react-hook-form";
import { PostValidator, postValidator } from "@/lib/validators/post";
import { zodResolver } from "@hookform/resolvers/zod";
import type EditorJS from "@editorjs/editorjs";
import { uploadFiles } from "@/lib/uploadthing";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { useCustomToast } from "@/hooks/use-custom-toast";

interface EditorProps {
  subbreaditId: string;
}

const Editor: FC<EditorProps> = ({ subbreaditId }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostValidator>({
    resolver: zodResolver(postValidator),
    defaultValues: {
      subbreaditId,
      title: "",
      content: null,
    },
  });
  const _titleRef = useRef<HTMLTextAreaElement>(null);
  const ref = useRef<EditorJS>();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();
  const { loginToast } = useCustomToast();
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
    }
  }, []);
  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import("@editorjs/editorjs")).default;
    const Header = (await import("@editorjs/header")).default;
    const Embed = (await import("@editorjs/embed")).default;
    const Table = (await import("@editorjs/table")).default;
    const List = (await import("@editorjs/list")).default;
    const Code = (await import("@editorjs/code")).default;
    const LinkTool = (await import("@editorjs/link")).default;
    const InlineCode = (await import("@editorjs/inline-code")).default;
    const ImageTool = (await import("@editorjs/image")).default;

    if (!ref.current) {
      const editor = new EditorJS({
        holder: "editor",
        onReady() {
          ref.current = editor;
        },
        placeholder: "Type here to write your post...",
        inlineToolbar: true,
        data: { blocks: [] },
        tools: {
          header: Header,
          LinkTool: {
            class: LinkTool,
            config: {
              endpoint: "/api/link",
            },
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  const [res] = await uploadFiles([file], "imageUploader");
                  return {
                    success: 1,
                    file: {
                      url: res.fileUrl,
                    },
                  };
                },
              },
            },
          },
          list: List,
          code: Code,
          InlineCode: InlineCode,
          table: Table,
          embed: Embed,
        },
      });
    }
  }, []);
  useEffect(() => {
    const init = async () => {
      await initializeEditor();
      setTimeout(() => {
        _titleRef.current?.focus;
      }, 0);
    };
    if (isMounted) {
      init();
      return () => {
        ref.current?.destroy();
        ref.current = undefined;
      };
    }
  }, [isMounted, initializeEditor]);
  const { ref: titleRef, ...rest } = register("title");
  useEffect(() => {
    if (Object.keys(errors).length) {
      for (const [, value] of Object.entries(errors)) {
        toast({
          title: "Something went wrong !",
          description: (value as { message: string }).message,
          variant: "destructive",
        });
      }
    }
  }, [errors]);
  const { mutate: createPost, isLoading } = useMutation({
    mutationFn: async ({ title, content, subbreaditId }: PostValidator) => {
      const payload: PostValidator = {
        title,
        content,
        subbreaditId,
      };
      const { data } = await axios.post("/api/subbreadit/post/create", payload);
      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 400) {
          return toast({
            title: "Not subscribed !",
            description:
              "You need to subscribe to the subbreadit to post in it.",
            variant: "destructive",
          });
        }
        if (err.response?.status === 401) {
          return loginToast();
        }
      }
      return toast({
        title: "Something went wrong !",
        description: "Your post was not published, please try again later.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      const newPathname = pathname.split("/").slice(0, -1).join("/");
      router.push(newPathname);
      router.refresh();
      return toast({
        title: "Created post Successfully !",
        description: "Your post has been published.",
      });
    },
  });
  async function onSubmit(data: PostValidator) {
    const blocks = await ref.current?.save();
    const payload: PostValidator = {
      title: data.title,
      content: blocks,
      subbreaditId,
    };
    createPost(payload);
  }

  if (!isMounted) {
    return null;
  }

  return (
    <div className="w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200">
      <form
        id="subbreadit-post-form"
        className="w-fit"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="prose prose-stone md:prose-invert">
          <TextAreaAutosize
            ref={(e) => {
              titleRef(e);
              //@ts-ignore
              _titleRef.current = e;
            }}
            {...rest}
            placeholder="Title"
            className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
          />
          <div id="editor" className="min-h-[500px]" />
        </div>
      </form>
      <div className="w-full flex justify-end">
        <Button
          type="submit"
          className="w-full"
          form="subbreadit-post-form"
          disabled={isLoading}
          isLoading={isLoading}
        >
          Post
        </Button>
      </div>
    </div>
  );
};

export default Editor;
