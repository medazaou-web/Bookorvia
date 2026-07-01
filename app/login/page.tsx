import { createServerSupabase } from "../../lib/supabase/serverClient";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export default async function Page(props: { searchParams?: Promise<Record<string, string>> }) {
  const searchParams = await props.searchParams;
  const next = searchParams?.next || "/dashboard";
  
  const cookieStore = cookies();
  const supabase = createServerSupabase(cookieStore);

  try {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      // already logged in - redirect to next or dashboard
      redirect(next);
    }
  } catch (e) {
    // ignore and render the client form
  }

  return <LoginForm nextPath={next} />;
}
