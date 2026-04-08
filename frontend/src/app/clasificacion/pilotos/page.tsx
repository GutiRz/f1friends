import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ temporada?: string }>;
};

export default async function RedirectPilotos({ searchParams }: Props) {
  const { temporada } = await searchParams;
  const qs = temporada ? `?temporada=${temporada}&tab=pilotos` : "?tab=pilotos";
  redirect(`/clasificacion${qs}`);
}
