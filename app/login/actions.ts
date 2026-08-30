"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation";

export type LoginFormState = {
  error?: string;
};

export async function signIn(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  const supabase = createClient();

  // Wrapped explicitly: signInWithPassword() normally returns a graceful
  // { error } for wrong credentials (handled below), but an unexpected
  // failure (a transient network issue reaching Supabase, for example)
  // could throw instead. Either way the user should see the same plain
  // "couldn't sign in, try again" message — never an uncaught Server
  // Action error.
  let signInError: { message: string } | null = null;
  try {
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    signInError = error;
  } catch {
    signInError = { message: "unexpected" };
  }

  if (signInError) {
    return { error: "Incorrect email or password." };
  }

  redirect("/admin");
}
