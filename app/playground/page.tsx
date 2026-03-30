import type { Metadata } from "next";
import PlaygroundLayout from "@/components/layout/PlaygroundLayout";

export const metadata: Metadata = {
  title: "Halku — JavaScript Playground",
  description: "Write and run JavaScript instantly in your browser.",
};

export default function PlaygroundPage() {
  return (
    <PlaygroundLayout />
  );
}
