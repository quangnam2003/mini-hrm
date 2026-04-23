import { DefaultSession, DefaultUser } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      empCode?: string;
      role?: string;
      avatar?: string;
      initials?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    empCode?: string;
    role?: string;
    accessToken?: string;
    avatar?: string;
    initials?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    role?: string;
    empCode?: string;
    avatar?: string;
  }
}
