// Crée ou met à jour un utilisateur (avec mot de passe haché).
// Usage :
//   node scripts/create-user.js <email> <motdepasse> <Prénom> <Nom> <ADMIN|COUNSELOR|ASSISTANT> <slug-agence>
// Exemple :
//   node scripts/create-user.js moi@agence.com "MonMotDePasseSolide!" Oumar Niang ADMIN avenir-etudes-dakar
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function main() {
  const [email, password, firstName, lastName, role, slug] = process.argv.slice(2);
  if (!email || !password || !firstName || !lastName || !role || !slug) {
    console.error("Usage: node scripts/create-user.js <email> <motdepasse> <Prénom> <Nom> <ADMIN|COUNSELOR|ASSISTANT> <slug-agence>");
    process.exit(1);
  }
  if (!["ADMIN", "COUNSELOR", "ASSISTANT"].includes(role)) {
    console.error("Rôle invalide. Utilisez ADMIN, COUNSELOR ou ASSISTANT.");
    process.exit(1);
  }
  if (password.length < 10) {
    console.error("Mot de passe trop court : 10 caractères minimum.");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const agency = await prisma.agency.findUnique({ where: { slug } });
    if (!agency) {
      const all = await prisma.agency.findMany({ select: { slug: true, name: true } });
      console.error(`Agence "${slug}" introuvable. Agences existantes :`, all);
      process.exit(1);
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const normalized = email.trim().toLowerCase();
    const user = await prisma.user.upsert({
      where: { agencyId_email: { agencyId: agency.id, email: normalized } },
      update: { passwordHash, firstName, lastName, role, isActive: true },
      create: { agencyId: agency.id, email: normalized, passwordHash, firstName, lastName, role },
    });
    console.log(`OK : ${user.firstName} ${user.lastName} <${user.email}> (${user.role}) — agence ${agency.name}`);
  } finally {
    await prisma.$disconnect();
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
