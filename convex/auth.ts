import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";
import { TestingCredentials } from "./testing/functions";

const GoogleProvider = Google({
  authorization: {
    params: {
      prompt: "select_account",
    },
  },
  profile(user) {
    return {
      id: user.sub,
      name: user.name,
      email: user.email,
      image: user.image,
      firstName: user.given_name || user.name?.split(" ")[0] || "",
      lastName:
        user.family_name || user.name?.split(" ").slice(1).join(" ") || "",
    };
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: process.env.IS_TEST
    ? [GoogleProvider, TestingCredentials]
    : [GoogleProvider],
});
