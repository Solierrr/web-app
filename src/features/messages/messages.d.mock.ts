import type { Message } from "./messages";
import userMock from "@/features/users/user/user.d.mock";

const messagesMock = [
  {
    user: userMock[0],
    message: "Olá! Vi seu anúncio de placas solares, ainda está disponível?",
    time: new Date("2026-08-20T09:15:00"),
  },
  {
    user: userMock[1],
    message: "Olá! Sim, temos unidades em estoque.",
    time: new Date("2026-08-20T09:20:00"),
  },
] as Message[];

export default messagesMock;
