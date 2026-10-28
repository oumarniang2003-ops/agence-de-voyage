const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Ajout des modèles de procédures pour le Visa Tourisme ---');

  // 1. Modèle Tourisme France / Schengen
  const existingFranceTourism = await prisma.procedureTemplate.findFirst({
    where: { code: 'FRANCE_VISA_COURT_SEJOUR' },
  });

  if (!existingFranceTourism) {
    const templateFrance = await prisma.procedureTemplate.create({
      data: {
        code: 'FRANCE_VISA_COURT_SEJOUR',
        name: 'France / Schengen : Visa Court Séjour Tourisme & Visite',
        country: 'FRANCE',
        type: 'TOURISM',
        description: 'Procédure complète pour demande de visa touristique ou visite familiale (France-Visas, TLS/VFS).',
        isDefault: true,
        steps: {
          create: [
            { orderIndex: 0, title: 'Bilan du séjour & Diagnostic du profil', description: 'Vérification du motif, faisabilité, attaches socio-professionnelles et familiales au pays d’origine.', estimatedDurationDays: 2, isCritical: true },
            { orderIndex: 1, title: 'Constitution des justificatifs de ressources & hébergement', description: 'Bulletins de salaire, relevés bancaires 3-6 mois, attestation d’accueil ou réservation hôtel confirmée.', estimatedDurationDays: 5, isCritical: true },
            { orderIndex: 2, title: 'Réservation des vols & Assurance voyage', description: 'Itinéraire de vol aller-retour et attestation d’assurance médicale Schengen (couverture 30 000 €).', estimatedDurationDays: 2, isCritical: false },
            { orderIndex: 3, title: 'Saisie formulaire officiel France-Visas', description: 'Remplissage en ligne du formulaire CERFA, validation et génération du récépissé.', estimatedDurationDays: 1, isCritical: true },
            { orderIndex: 4, title: 'Rendez-vous centre des visas (TLScontact / VFS) & Biométrie', description: 'Dépôt physique du dossier complet, paiement des frais de visa et prise des empreintes.', estimatedDurationDays: 7, isCritical: true },
            { orderIndex: 5, title: 'Décision consulaire & Récupération du passeport', description: 'Suivi de l’état du passeport, retrait et contrôle de la vignette visa.', estimatedDurationDays: 15, isCritical: false },
          ],
        },
        documentRequirements: {
          create: [
            { name: 'Passeport valide (minimum 6 mois après retour)', category: 'IDENTITE', isMandatory: true, description: 'Au moins 2 pages vierges.' },
            { name: 'Photo d’identité récente (norme OACI)', category: 'IDENTITE', isMandatory: true, description: 'Fond clair, format 35x45mm.' },
            { name: 'Justificatif d’hébergement (Hôtel ou Attestation d’accueil)', category: 'LEGAL', isMandatory: true, description: 'Réservation d’hôtel confirmée ou attestation d’accueil légalisée par la mairie en France.' },
            { name: 'Réservation billet d’avion aller-retour', category: 'LEGAL', isMandatory: true, description: 'Itinéraire de voyage complet avec dates précises.' },
            { name: 'Relevés bancaires récents (3 à 6 derniers mois)', category: 'FINANCIER', isMandatory: true, description: 'Relevés bancaires certifiés démontrant des ressources suffisantes.' },
            { name: 'Justificatif socio-professionnel (Contrat / Bulletins / Registre)', category: 'LEGAL', isMandatory: true, description: 'Contrat de travail + 3 dernières fiches de paie + attestation de congé, ou registre de commerce.' },
            { name: 'Assurance voyage médicale Schengen', category: 'LEGAL', isMandatory: true, description: 'Couvrant au minimum 30 000 € de frais médicaux et rapatriement.' },
          ],
        },
      },
    });
    console.log('✅ Modèle France Tourisme créé avec succès.');
  } else {
    console.log('ℹ️ Modèle France Tourisme déjà existant.');
  }

  // 2. Modèle Tourisme Canada (VRT)
  const existingCanadaTourism = await prisma.procedureTemplate.findFirst({
    where: { code: 'CANADA_VISA_VISITEUR' },
  });

  if (!existingCanadaTourism) {
    const templateCanada = await prisma.procedureTemplate.create({
      data: {
        code: 'CANADA_VISA_VISITEUR',
        name: 'Canada : Visa de Visiteur (VRT) & Tourisme',
        country: 'CANADA',
        type: 'TOURISM',
        description: 'Accompagnement complet pour visa de séjour temporaire canadien via le portail IRCC.',
        isDefault: true,
        steps: {
          create: [
            { orderIndex: 0, title: 'Évaluation d’admissibilité & Attaches pays d’origine', description: 'Analyse des antécédents de voyage, situation familiale, biens et emploi stable.', estimatedDurationDays: 3, isCritical: true },
            { orderIndex: 1, title: 'Lettre d’invitation / Itinéraire touristique', description: 'Rédaction ou vérification de l’invitation avec statut de l’hôte au Canada ou programme de visite.', estimatedDurationDays: 4, isCritical: true },
            { orderIndex: 2, title: 'Dossier financier & Preuves de fonds', description: 'Relevés bancaires personnels et/ou du garant, preuves de propriété et revenus.', estimatedDurationDays: 5, isCritical: true },
            { orderIndex: 3, title: 'Création compte et soumission portail IRCC', description: 'Remplissage des formulaires IMM5257, téléversement de la lettre explicative et des justificatifs.', estimatedDurationDays: 2, isCritical: true },
            { orderIndex: 4, title: 'Collecte des données biométriques (CRDV)', description: 'Prise de rendez-vous et passage au CRDV pour empreintes et photo numérique.', estimatedDurationDays: 7, isCritical: true },
            { orderIndex: 5, title: 'Décision IRCC & Dépôt passeport original', description: 'Lettre d’instructions pour le passeport, envoi et apposition du visa.', estimatedDurationDays: 30, isCritical: false },
          ],
        },
        documentRequirements: {
          create: [
            { name: 'Passeport biométrique valide', category: 'IDENTITE', isMandatory: true, description: 'Validité couvrant la durée du séjour envisagé.' },
            { name: 'Photo numérique format passeport canadien', category: 'IDENTITE', isMandatory: true, description: 'Respectant scrupuleusement les spécifications IRCC.' },
            { name: 'Lettre d’explication du voyage (Motif et plan détaillé)', category: 'LEGAL', isMandatory: true, description: 'Détail des activités prévues, des dates et engagement formel de retour.' },
            { name: 'Preuves financières (Relevés bancaires récents certifiés)', category: 'FINANCIER', isMandatory: true, description: 'Solde suffisant pour couvrir l’ensemble des dépenses prévues.' },
            { name: 'Preuves d’attaches au pays (Emploi, biens, famille)', category: 'LEGAL', isMandatory: true, description: 'Contrat CDI, fiches de paie, titres de propriété, acte de mariage, enfants.' },
            { name: 'Lettre d’invitation et statut de l’hôte au Canada (si visite)', category: 'LEGAL', isMandatory: false, description: 'Copie de la carte RP ou passeport canadien, avis de cotisation NOA de l’hôte.' },
          ],
        },
      },
    });
    console.log('✅ Modèle Canada Visiteur créé avec succès.');
  } else {
    console.log('ℹ️ Modèle Canada Visiteur déjà existant.');
  }

  // Mettre à jour les modèles existants pour expliciter type = 'STUDIES'
  await prisma.procedureTemplate.updateMany({
    where: { code: { in: ['FRANCE_CAMPUS_FRANCE', 'CANADA_PERMIS_ETUDES'] } },
    data: { type: 'STUDIES' },
  });

  console.log('✅ Synchronisation des modèles de procédures achevée !');
}

main()
  .catch((e) => {
    console.error('Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
