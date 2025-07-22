"use server";
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { db } from "@/lib/prisma";

export async function getAuthenticatedUser() {
  const supabase = await createClient();      // you implement: pulls cookies/headers
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(`Auth error: ${error.message}`);
  const user = data.user;
  if (!user) throw new Error("Unauthorised");
  return user;
}


export async function getUserSession() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return null;
  }
  return data.user;
}

export async function login(formData: FormData) {
  const supabase = await createClient()
  // type-casting here for convenience
  // in practice, you should validate your inputs
  const userdata = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  const { error, data } = await supabase.auth.signInWithPassword(userdata)
  if (error) {
    return {
      sucess: false,
      message: error.message,
    }
  }
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
export async function signup(formData: FormData) {
  const supabase = await createClient()
  // type-casting here for convenience
  // in practice, you should validate your inputs
  const userdata = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: { username: formData.get('name') as string } // <- This will show in Display name column
    }
  }
  const { error, data } = await supabase.auth.signUp(userdata)
  if (error) {
    return {
      sucess: false,
      message: error.message,
    }
  } else if (data?.user?.identities?.length === 0) {
    return {
      sucess: false,
      message: "User with this email already exists",
    }
  }

  return {
    sucess: true,
    message: "Confirm email",
  }
  //   revalidatePath('/', 'layout')
  //   redirect('/dashboard')
}

export async function logout() {

  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect("/error");
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  const authCallbackUrl = `${process.env.SITE_URL}/auth/callback?next=/dashboard`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: authCallbackUrl
    },
  })

  console.log("google auth", data);

  if (error) {
    return {
      sucess: false,
      message: error.message,
    }
  }

  redirect(data.url);

  return {
    sucess: true,
    message: "Confirm email",
  }
}