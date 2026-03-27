import { redirect } from "next/navigation";

// Root → playground
export default function Home() {
  redirect("/playground");
}
