import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google({
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          firstName: profile.given_name || profile.name?.split(" ")[0] || "",
          lastName:
            profile.family_name ||
            profile.name?.split(" ").slice(1).join(" ") ||
            "",
        };
      },
    }),
  ],
});
