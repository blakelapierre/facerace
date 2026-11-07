import { createFileRoute } from "@tanstack/react-router";
import { Race } from "@/game/Race";

export const Route = createFileRoute("/")({ component: Race });
