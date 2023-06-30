import { Comment, Post, Subbreadit, User, Vote } from "@prisma/client";

export type ExtendedPost = Post & {
  subbreadit: Subbreadit;
  votes: Vote[];
  author: User;
  comments: Comment[];
};
