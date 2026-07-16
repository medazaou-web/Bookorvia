import { createServerSupabase } from "../../lib/supabase/serverClient";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import RegisterForm from "./RegisterForm";

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createServerSupabase(cookieStore);

  try {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      redirect("/dashboard");
    }
  } catch (e) {
    // ignore and render the client form
  }

  return <RegisterForm />;
}

