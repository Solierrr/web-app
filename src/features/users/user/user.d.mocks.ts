import type { User } from "./user";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import type { MyUser } from "./user.service";

const userMock = [
  {
    id: "user-1",
    authId: "auth-1",

    active: true,
    name: "Marina Alves Ferreira",
    cpf: "12345678901",
    birthDate: "1991-04-18",
    contact: {
      number: "31988887777",
      email: "marina.ferreira@gmail.com",
      socialMedia: {
        whatsapp: true,
        instagram: true,
      },
    },
  },
  {
    id: "user-2",
    authId: "auth-2",

    active: true,
    name: "Rafael Costa Nunes",
    cpf: "98765432100",
    birthDate: "1987-11-02",
    contact: {
      number: "41977776666",
      email: "rafael.nunes@hotmail.com",
    },
  },
  {
    id: "user-3",
    authId: "auth-3",
    active: false,
    name: "Juliana Pereira Souza",
    cpf: "45612378909",
    birthDate: "1995-07-25",
    contact: {
      number: "81966665555",
      email: "juliana.souza@outlook.com",
      socialMedia: {
        whatsapp: true,
        linkedin: true,
      },
    },
  },
] as User[];

export default userMock;

export function createMockUser(id = getAuthSession()?.userId ?? "mock-user"): MyUser {
  const session = getAuthSession();
  return {
    id,
    authId: id,
    username: localStorage.getItem(`solaria.mock.username.${id}`) ?? (id === session?.userId ? session.email.split("@")[0] : id),
    avatar: null,
    banner: null,
    active: true,
  };
}
