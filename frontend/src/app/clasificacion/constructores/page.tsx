import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ temporada?: string }>;
};

export default async function RedirectConstructores({ searchParams }: Props) {
  const { temporada } = await searchParams;
  const qs = temporada ? `?temporada=${temporada}&tab=constructores` : "?tab=constructores";
  redirect(`/clasificacion${qs}`);
}
