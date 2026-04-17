import { supabase } from "../lib/supabaseClient"

export default async function Home() {
  const { data, error } = await supabase.from("events").select("*")

  return (
    <div>
      <h1>Restaurant Event Manager 🍽️</h1>

      <pre>{JSON.stringify({ data, error }, null, 2)}</pre>
    </div>
  )
}