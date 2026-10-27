// Vérifie qu'un enregistrement référencé appartient bien à l'agence de l'utilisateur connecté.
import { prisma } from "@/lib/prisma";

export async function clientInAgency(id: string, agencyId: string) {
  return (await prisma.client.count({ where: { id, agencyId } })) > 0;
}

export async function applicationInAgency(id: string, agencyId: string) {
  return (await prisma.application.count({ where: { id, agencyId } })) > 0;
}

export async function userInAgency(id: string, agencyId: string) {
  return (await prisma.user.count({ where: { id, agencyId, isActive: true } })) > 0;
}
