import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { usernameValidator } from "@/lib/validators/username";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }
    const body = await req.json();
    const { name } = usernameValidator.parse(body);
    const username = await db.user.findFirst({
      where: {
        username: name,
      },
    });
    if (username) {
      return new Response("Username is taken", { status: 409 });
    }
    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        username: name,
      },
    });
    return new Response("Username changed successfully.");
  } catch (error) {
    error;
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }
    return new Response(
      "Could not update username at this time. Please try later",
      { status: 500 }
    );
  }
}
