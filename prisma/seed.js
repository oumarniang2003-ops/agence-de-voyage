const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Nettoyage de la base de données ---');
  await prisma.appointment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.note.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.document.deleteMany();
  await prisma.applicationStep.deleteMany();
  await prisma.application.deleteMany();
  await prisma.documentRequirement.deleteMany();
  await prisma.procedureStep.deleteMany();
  await prisma.procedureTemplate.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.agency.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  console.log('--- Création des agences et collaborateurs ---');
  // Agence 1: Avenir Études Dakar
  const agencyDakar = await prisma.agency.create({
    data: {
      name: 'Avenir Études Dakar',
      slug: 'avenir-etudes-dakar',
      email: 'contact@aveniretudes-dakar.com',
      phone: '+221 33 824 15 15',
      currency: 'FCFA',
      address: 'Immeuble FAHD, Boulevard Djily Mbaye, Dakar, Sénégal',
      alertThresholdDays: 5,
      users: {
        create: [
          {
            email: 'admin@aveniretudes.sn',
            passwordHash,
            firstName: 'Amadou',
            lastName: 'Sow',
            role: 'ADMIN',
            phone: '+221 77 654 32 10',
          },
          {
            email: 'conseiller@aveniretudes.sn',
            passwordHash,
            firstName: 'Cheikh',
            lastName: 'Fall',
            role: 'COUNSELOR',
            phone: '+221 77 123 45 67',
          },
          {
            email: 'assistante@aveniretudes.sn',
            passwordHash,
            firstName: 'Mariama',
            lastName: 'Ba',
            role: 'ASSISTANT',
            phone: '+221 77 987 65 43',
          },
        ],
      },
    },
    include: { users: true },
  });

  // Agence 2: Horizon International Abidjan
  const agencyAbidjan = await prisma.agency.create({
    data: {
      name: 'Horizon International Abidjan',
      slug: 'horizon-international-abidjan',
      email: 'contact@horizon-abidjan.ci',
      phone: '+225 27 22 44 88 00',
      currency: 'FCFA',
      address: 'Cocody Deux Plateaux, Vallons, Abidjan, Côte d’Ivoire',
      alertThresholdDays: 7,
      users: {
        create: [
          {
            email: 'admin@horizon-abidjan.ci',
            passwordHash,
            firstName: 'Clarisse',
            lastName: 'Kouassi',
            role: 'ADMIN',
            phone: '+225 07 08 09 10 11',
          },
          {
            email: 'conseiller@horizon-abidjan.ci',
            passwordHash,
            firstName: 'Yannick',
            lastName: 'Brou',
            role: 'COUNSELOR',
            phone: '+225 05 06 07 08 09',
          },
        ],
      },
    },
    include: { users: true },
  });

  console.log('--- Création des modèles de procédures (France & Canada) ---');

  // Modèle France Campus France
  const templateFrance = await prisma.procedureTemplate.create({
    data: {
      code: 'FRANCE_CAMPUS_FRANCE',
      name: 'France : Campus France & Visa Étudiant VLS-TS',
      country: 'FRANCE',
      description: 'Accompagnement complet de la création Pastel jusqu au visa long séjour pour la France.',
      isDefault: true,
      steps: {
        create: [
          { orderIndex: 0, title: 'Ouverture & Bilan d’orientation', description: 'Évaluation du profil académique, des notes et du projet professionnel.', estimatedDurationDays: 3, isCritical: false },
          { orderIndex: 1, title: 'Création compte Études en France (Pastel)', description: 'Création et configuration des identifiants officiels Campus France.', estimatedDurationDays: 2, isCritical: false },
          { orderIndex: 2, title: 'Choix des formations & vœux', description: 'Sélection des universités, IUT ou écoles (jusqu’à 7 vœux).', estimatedDurationDays: 7, isCritical: true },
          { orderIndex: 3, title: 'Collecte et validation des pièces', description: 'Vérification scrupuleuse des diplômes, relevés et traductions.', estimatedDurationDays: 10, isCritical: true },
          { orderIndex: 4, title: 'Soumission & Paiement frais Campus France', description: 'Validation finale du dossier en ligne et paiement des frais de dossier.', estimatedDurationDays: 4, isCritical: true },
          { orderIndex: 5, title: 'Préparation à l’entretien Campus France', description: 'Simulations d’entretien oral, coaching motivationnel.', estimatedDurationDays: 5, isCritical: true },
          { orderIndex: 6, title: 'Passage de l’entretien Campus France', description: 'Entretien officiel dans les locaux de l’Institut Français.', estimatedDurationDays: 1, isCritical: true },
          { orderIndex: 7, title: 'Réponses & Admissions établissements', description: 'Suivi des avis favorables et acceptation définitive du meilleur vœu.', estimatedDurationDays: 20, isCritical: false },
          { orderIndex: 8, title: 'Constitution dossier financier & hébergement', description: 'Attestation de virement irrévocable (AVI/CPG), attestation hébergement/garant.', estimatedDurationDays: 12, isCritical: true },
          { orderIndex: 9, title: 'Demande de Visa (France-Visas & TLS/VFS)', description: 'Remplissage CERFA, prise de rendez-vous consulaire et dépôt passeport.', estimatedDurationDays: 14, isCritical: true },
          { orderIndex: 10, title: 'Décision consulaire & Préparation départ', description: 'Retrait passeport avec vignette visa, recherche logement, accueil aéroport.', estimatedDurationDays: 10, isCritical: false },
        ],
      },
      documentRequirements: {
        create: [
          { name: 'Passeport valide (minimum 1 an)', category: 'IDENTITE', isMandatory: true, description: 'Copie intégrale des pages d’identité.' },
          { name: 'Photo d’identité récente (norme OACI)', category: 'IDENTITE', isMandatory: true, description: 'Fond blanc 35x45mm.' },
          { name: 'Acte de naissance légalisé', category: 'LEGAL', isMandatory: true, description: 'Moins de 3 mois.' },
          { name: 'Diplôme du Baccalauréat & Relevé de notes', category: 'ACADEMIQUE', isMandatory: true, description: 'Certifié conforme.' },
          { name: 'Relevés de notes des années post-bac', category: 'ACADEMIQUE', isMandatory: true, description: 'Toutes les années universitaires validées.' },
          { name: 'Dernier diplôme obtenu (Licence / Master)', category: 'ACADEMIQUE', isMandatory: false, description: 'Si déjà diplômé.' },
          { name: 'Curriculum Vitae actualisé', category: 'ACADEMIQUE', isMandatory: true, description: 'Au format européen standard.' },
          { name: 'Lettres de motivation par vœu', category: 'ACADEMIQUE', isMandatory: true, description: 'Projet d’études personnalisé.' },
          { name: 'Test de français (TCF / DELF / DALF)', category: 'ACADEMIQUE', isMandatory: false, description: 'Requis si exigé par la formation (score B2/C1).' },
          { name: 'Attestation de Virement Irrévocable (AVI)', category: 'FINANCIER', isMandatory: true, description: 'Garantie financière de 7380€ minimum pour l’année.' },
          { name: 'Attestation d’hébergement (3 premiers mois)', category: 'LEGAL', isMandatory: true, description: 'Contrat bail ou attestation d’accueil légalisée.' },
        ],
      },
    },
    include: { steps: true, documentRequirements: true },
  });

  // Modèle Canada Permis d'études & CAQ
  const templateCanada = await prisma.procedureTemplate.create({
    data: {
      code: 'CANADA_PERMIS_ETUDES',
      name: 'Canada : Admission DLI, CAQ & Permis d’Études IRCC',
      country: 'CANADA',
      description: 'Accompagnement admission collèges/universités désignés (EED), CAQ pour Québec et permis fédéral.',
      isDefault: true,
      steps: {
        create: [
          { orderIndex: 0, title: 'Évaluation d’admissibilité & Profil', description: 'Étude des antécédents, faisabilité et orientation ciblée.', estimatedDurationDays: 3, isCritical: false },
          { orderIndex: 1, title: 'Choix programme & Établissement (DLI/EED)', description: 'Sélection d’un programme admissible au PTPD.', estimatedDurationDays: 7, isCritical: true },
          { orderIndex: 2, title: 'Dépôt admission & Obtention lettre d’acceptation (LOA)', description: 'Paiement frais d’admission et réception de la LOA officielle.', estimatedDurationDays: 30, isCritical: true },
          { orderIndex: 3, title: 'Paiement acompte de scolarité', description: 'Règlement de la première session ou année exigée par l’université.', estimatedDurationDays: 7, isCritical: true },
          { orderIndex: 4, title: 'Demande de CAQ (si province de Québec)', description: 'Dépôt MIFI, téléversement plateforme Arrima.', estimatedDurationDays: 25, isCritical: true },
          { orderIndex: 5, title: 'Montage du dossier financier (Preuves de fonds)', description: 'Relevés bancaires sur 4 mois, certificats de placement garanti (CPG/GIC), garant.', estimatedDurationDays: 14, isCritical: true },
          { orderIndex: 6, title: 'Soumission Permis d’études (Portail IRCC)', description: 'Remplissage des formulaires IMM1294, lettre explicative (SOP).', estimatedDurationDays: 5, isCritical: true },
          { orderIndex: 7, title: 'Collecte des données biométriques (CRDV)', description: 'Prise d’empreintes et photo au centre de réception des visas.', estimatedDurationDays: 10, isCritical: true },
          { orderIndex: 8, title: 'Visite médicale préalable ou requise', description: 'Examen par un médecin désigné par IRCC.', estimatedDurationDays: 7, isCritical: false },
          { orderIndex: 9, title: 'Décision IRCC (Lettre pour point d’entrée)', description: 'Approbation du permis d’études et demande de passeport original.', estimatedDurationDays: 45, isCritical: true },
          { orderIndex: 10, title: 'Acheminement passeport & Briefing de départ', description: 'Insertion du visa / AVE et préparation logistique pour le voyage.', estimatedDurationDays: 10, isCritical: false },
        ],
      },
      documentRequirements: {
        create: [
          { name: 'Passeport biométrique valide', category: 'IDENTITE', isMandatory: true, description: 'Valide pour toute la durée des études prévues.' },
          { name: 'Photos de passeport format IRCC', category: 'IDENTITE', isMandatory: true, description: 'Dimensions 35x45mm selon consignes canadiennes.' },
          { name: 'Lettre d’acceptation officielle (LOA)', category: 'ACADEMIQUE', isMandatory: true, description: 'Émise par un établissement désigné (DLI).' },
          { name: 'Diplômes et relevés de notes certifiés', category: 'ACADEMIQUE', isMandatory: true, description: 'Du secondaire et post-secondaire.' },
          { name: 'Preuve de fonds financiers (Relevés bancaires / CPG)', category: 'FINANCIER', isMandatory: true, description: 'Frais de scolarité + coût de la vie (20 635 $ CAD min).' },
          { name: 'Lettre d’engagement du garant & fiches de paie', category: 'FINANCIER', isMandatory: true, description: 'Preuves d’emploi et liens de parenté vérifiables.' },
          { name: 'Lettre d’explication / Projet d’études (SOP)', category: 'ACADEMIQUE', isMandatory: true, description: 'Justification du choix du programme et retour au pays.' },
          { name: 'Certificat d’Acceptation du Québec (CAQ)', category: 'LEGAL', isMandatory: false, description: 'Obligatoire si études au Québec.' },
        ],
      },
    },
    include: { steps: true, documentRequirements: true },
  });

  console.log('--- Création des clients pour Dakar ---');
  const counselorDakar = agencyDakar.users.find(u => u.role === 'COUNSELOR');
  const assistantDakar = agencyDakar.users.find(u => u.role === 'ASSISTANT');
  const adminDakar = agencyDakar.users.find(u => u.role === 'ADMIN');

  // Client 1 : Fatou Diop (France)
  const clientFatou = await prisma.client.create({
    data: {
      agencyId: agencyDakar.id,
      assignedCounselorId: counselorDakar.id,
      referenceCode: 'CLI-DKR-001',
      firstName: 'Fatou',
      lastName: 'Diop',
      email: 'fatou.diop99@gmail.com',
      phone: '+221 77 450 12 34',
      whatsapp: '+221 77 450 12 34',
      birthDate: new Date('2001-05-14'),
      nationality: 'Sénégalaise',
      address: 'Mermoz Pyrotechnie, Dakar',
      currentEducationLevel: 'Licence 3 Informatique',
      fieldOfStudy: 'Génie Logiciel & Data',
      targetCountry: 'FRANCE',
      targetIntake: 'Rentrée Septembre 2026',
      tags: JSON.stringify(['Prioritaire', 'Excellentes notes', 'Bourse demandée']),
      notesSummary: 'Dossier très solide. Moyenne générale 15,2/20 en Licence.',
    },
  });

  // Client 2 : Mamadou Ndiaye (Canada)
  const clientMamadou = await prisma.client.create({
    data: {
      agencyId: agencyDakar.id,
      assignedCounselorId: counselorDakar.id,
      referenceCode: 'CLI-DKR-002',
      firstName: 'Mamadou',
      lastName: 'Ndiaye',
      email: 'm.ndiaye@outlook.com',
      phone: '+221 76 890 22 11',
      whatsapp: '+221 76 890 22 11',
      birthDate: new Date('2003-11-20'),
      nationality: 'Sénégalaise',
      address: 'Sacré-Cœur 3, Dakar',
      currentEducationLevel: 'Baccalauréat Scientifique (S2)',
      fieldOfStudy: 'Ingénierie Informatique',
      targetCountry: 'CANADA',
      targetIntake: 'Automne 2026',
      tags: JSON.stringify(['Canada', 'Garant solide']),
      notesSummary: 'Intéressé par l’Université Laval et Polytechnique Montréal.',
    },
  });

  // Client 3 : Aminata Touré (France)
  const clientAminata = await prisma.client.create({
    data: {
      agencyId: agencyDakar.id,
      assignedCounselorId: counselorDakar.id,
      referenceCode: 'CLI-DKR-003',
      firstName: 'Aminata',
      lastName: 'Touré',
      email: 'amina.toure.pro@yahoo.fr',
      phone: '+221 78 300 44 55',
      whatsapp: '+221 78 300 44 55',
      birthDate: new Date('1998-08-03'),
      nationality: 'Sénégalaise',
      address: 'Almadies, Dakar',
      currentEducationLevel: 'Master 1 Biologie',
      fieldOfStudy: 'Santé Publique',
      targetCountry: 'FRANCE',
      targetIntake: 'Rentrée Septembre 2026',
      tags: JSON.stringify(['Reconversion']),
      notesSummary: 'Souhaite intégrer un Master 2 à Paris-Saclay ou Sorbonne Université.',
    },
  });

  console.log('--- Création des dossiers (Applications) pour Dakar ---');

  // Dossier Fatou Diop (France - En cours d entretien)
  const appFatou = await prisma.application.create({
    data: {
      agencyId: agencyDakar.id,
      clientId: clientFatou.id,
      counselorId: counselorDakar.id,
      templateId: templateFrance.id,
      dossierNumber: 'DOS-FR-2026-001',
      country: 'FRANCE',
      targetInstitution: 'Université Paris-Saclay / Université de Lyon',
      targetProgram: 'Master Informatique - Parcours Science des Données',
      intake: 'Septembre 2026',
      status: 'IN_PROGRESS',
      currentStepIndex: 5, // Préparation à l'entretien
      progressPercentage: 55,
      totalServiceFee: 450000,
      currency: 'FCFA',
      lastActivityAt: new Date(),
    },
  });

  // Création des étapes pour le dossier Fatou
  for (let i = 0; i < templateFrance.steps.length; i++) {
    const step = templateFrance.steps[i];
    let status = 'PENDING';
    let completedAt = null;
    let startedAt = null;

    if (i < 5) {
      status = 'COMPLETED';
      completedAt = new Date(Date.now() - (5 - i) * 86400000 * 4);
      startedAt = new Date(Date.now() - (6 - i) * 86400000 * 4);
    } else if (i === 5) {
      status = 'IN_PROGRESS';
      startedAt = new Date();
    }

    await prisma.applicationStep.create({
      data: {
        applicationId: appFatou.id,
        stepTitle: step.title,
        stepDescription: step.description,
        orderIndex: step.orderIndex,
        status,
        startedAt,
        completedAt,
        responsibleUserId: counselorDakar.id,
        comments: i === 5 ? 'Simulation orale prévue le 24 octobre à 15h00.' : null,
      },
    });
  }

  // Documents pour Fatou
  await prisma.document.createMany({
    data: [
      {
        agencyId: agencyDakar.id,
        applicationId: appFatou.id,
        requirementName: 'Passeport valide (minimum 1 an)',
        name: 'Passeport_Fatou_Diop.pdf',
        mimeType: 'application/pdf',
        fileSize: 1845000,
        status: 'VALIDATED',
        expiresAt: new Date('2029-08-15'),
        verificationComment: 'Passeport valide, très lisible.',
        verifiedByUserId: counselorDakar.id,
        verifiedAt: new Date(),
      },
      {
        agencyId: agencyDakar.id,
        applicationId: appFatou.id,
        requirementName: 'Diplôme du Baccalauréat & Relevé de notes',
        name: 'Bac_Releve_Diop_Fatou.pdf',
        mimeType: 'application/pdf',
        fileSize: 2200000,
        status: 'VALIDATED',
        verificationComment: 'Mention Bien conforme.',
        verifiedByUserId: counselorDakar.id,
        verifiedAt: new Date(),
      },
      {
        agencyId: agencyDakar.id,
        applicationId: appFatou.id,
        requirementName: 'Curriculum Vitae actualisé',
        name: 'CV_Fatou_Diop_2026.pdf',
        mimeType: 'application/pdf',
        fileSize: 450000,
        status: 'VALIDATED',
        verificationComment: 'CV très bien structuré.',
        verifiedByUserId: assistantDakar.id,
        verifiedAt: new Date(),
      },
      {
        agencyId: agencyDakar.id,
        applicationId: appFatou.id,
        requirementName: 'Attestation de Virement Irrévocable (AVI)',
        name: 'Attestation_Financiere_AVI_Provisoire.pdf',
        mimeType: 'application/pdf',
        fileSize: 980000,
        status: 'IN_REVIEW',
        verificationComment: 'Attestation reçue, vérification de la banque partenaire en cours.',
      },
      {
        agencyId: agencyDakar.id,
        applicationId: appFatou.id,
        requirementName: 'Attestation d’hébergement (3 premiers mois)',
        name: 'Attestation_Hebergement_Tante.pdf',
        mimeType: 'application/pdf',
        fileSize: 840000,
        status: 'REJECTED',
        verificationComment: 'La pièce d’identité de l’hébergeant est expirée, merci de demander une mise à jour.',
        verifiedByUserId: counselorDakar.id,
        verifiedAt: new Date(),
      },
    ],
  });

  // Activités & Notes pour Fatou
  await prisma.activityLog.createMany({
    data: [
      {
        agencyId: agencyDakar.id,
        applicationId: appFatou.id,
        userId: counselorDakar.id,
        userName: `${counselorDakar.firstName} ${counselorDakar.lastName}`,
        actionType: 'CREATED',
        description: 'Ouverture du dossier Campus France pour Fatou Diop.',
        createdAt: new Date(Date.now() - 20 * 86400000),
      },
      {
        agencyId: agencyDakar.id,
        applicationId: appFatou.id,
        userId: counselorDakar.id,
        userName: `${counselorDakar.firstName} ${counselorDakar.lastName}`,
        actionType: 'DOCUMENT_VALIDATED',
        description: 'Passeport et Baccalauréat validés par le conseiller.',
        createdAt: new Date(Date.now() - 12 * 86400000),
      },
      {
        agencyId: agencyDakar.id,
        applicationId: appFatou.id,
        userId: counselorDakar.id,
        userName: `${counselorDakar.firstName} ${counselorDakar.lastName}`,
        actionType: 'STEP_CHANGED',
        description: 'Étape passée à : Préparation à l’entretien Campus France.',
        createdAt: new Date(Date.now() - 2 * 86400000),
      },
    ],
  });

  await prisma.note.createMany({
    data: [
      {
        agencyId: agencyDakar.id,
        applicationId: appFatou.id,
        authorId: counselorDakar.id,
        authorName: `${counselorDakar.firstName} ${counselorDakar.lastName}`,
        content: 'La candidate maîtrise parfaitement son sujet de recherche. Travailler la présentation des débouchés pro au Sénégal après le diplôme.',
        isPinned: true,
      },
      {
        agencyId: agencyDakar.id,
        applicationId: appFatou.id,
        authorId: assistantDakar.id,
        authorName: `${assistantDakar.firstName} ${assistantDakar.lastName}`,
        content: 'Frais de dossier agence réglés en totalité (450 000 FCFA). Reçu émis N° REC-2026-089.',
        isPinned: false,
      },
    ],
  });

  await prisma.task.createMany({
    data: [
      {
        agencyId: agencyDakar.id,
        applicationId: appFatou.id,
        assignedToId: counselorDakar.id,
        assignedToName: `${counselorDakar.firstName} ${counselorDakar.lastName}`,
        title: 'Simulation entretien Campus France',
        dueDate: new Date(Date.now() + 3 * 86400000),
        isCompleted: false,
        priority: 'HIGH',
      },
      {
        agencyId: agencyDakar.id,
        applicationId: appFatou.id,
        assignedToId: assistantDakar.id,
        assignedToName: `${assistantDakar.firstName} ${assistantDakar.lastName}`,
        title: 'Relancer client pour nouvelle pièce d’identité hébergeant',
        dueDate: new Date(Date.now() + 2 * 86400000),
        isCompleted: false,
        priority: 'MEDIUM',
      },
    ],
  });

  await prisma.payment.create({
    data: {
      agencyId: agencyDakar.id,
      applicationId: appFatou.id,
      amount: 450000,
      currency: 'FCFA',
      paymentMethod: 'VIREMENT',
      reference: 'VIR-SGBS-99120',
      receiptNumber: 'REC-2026-089',
      notes: 'Paiement intégral forfait accompagnement Campus France.',
    },
  });

  // Dossier Mamadou Ndiaye (Canada - LOA Reçue, constitution preuves de fonds)
  const appMamadou = await prisma.application.create({
    data: {
      agencyId: agencyDakar.id,
      clientId: clientMamadou.id,
      counselorId: counselorDakar.id,
      templateId: templateCanada.id,
      dossierNumber: 'DOS-CA-2026-002',
      country: 'CANADA',
      targetInstitution: 'Université Laval, Québec',
      targetProgram: 'Baccalauréat en Génie Logiciel (4 ans)',
      intake: 'Automne 2026',
      status: 'IN_PROGRESS',
      currentStepIndex: 4, // CAQ Québec
      progressPercentage: 40,
      totalServiceFee: 650000,
      currency: 'FCFA',
      lastActivityAt: new Date(),
    },
  });

  for (let i = 0; i < templateCanada.steps.length; i++) {
    const step = templateCanada.steps[i];
    let status = 'PENDING';
    if (i < 4) status = 'COMPLETED';
    else if (i === 4) status = 'IN_PROGRESS';

    await prisma.applicationStep.create({
      data: {
        applicationId: appMamadou.id,
        stepTitle: step.title,
        stepDescription: step.description,
        orderIndex: step.orderIndex,
        status,
        responsibleUserId: counselorDakar.id,
      },
    });
  }

  // Dossier Aminata Touré (France - Bloqué attestation de langue)
  const appAminata = await prisma.application.create({
    data: {
      agencyId: agencyDakar.id,
      clientId: clientAminata.id,
      counselorId: counselorDakar.id,
      templateId: templateFrance.id,
      dossierNumber: 'DOS-FR-2026-003',
      country: 'FRANCE',
      targetInstitution: 'Sorbonne Université',
      targetProgram: 'Master Santé Publique',
      intake: 'Septembre 2026',
      status: 'BLOCKED',
      currentStepIndex: 3, // Collecte des pièces
      progressPercentage: 27,
      totalServiceFee: 450000,
      currency: 'FCFA',
      lastActivityAt: new Date(Date.now() - 9 * 86400000), // Inactif depuis 9 jours (alerte !)
    },
  });

  for (let i = 0; i < templateFrance.steps.length; i++) {
    const step = templateFrance.steps[i];
    let status = 'PENDING';
    if (i < 3) status = 'COMPLETED';
    else if (i === 3) status = 'BLOCKED';

    await prisma.applicationStep.create({
      data: {
        applicationId: appAminata.id,
        stepTitle: step.title,
        stepDescription: step.description,
        orderIndex: step.orderIndex,
        status,
        responsibleUserId: counselorDakar.id,
        comments: i === 3 ? 'Bloqué : attente des résultats du TCF tout public.' : null,
      },
    });
  }

  console.log('--- Création des données pour Abidjan (Agence 2) ---');
  const counselorAbidjan = agencyAbidjan.users.find(u => u.role === 'COUNSELOR');

  // Client Abidjan 1 : Aïcha Koné (France)
  const clientAicha = await prisma.client.create({
    data: {
      agencyId: agencyAbidjan.id,
      assignedCounselorId: counselorAbidjan.id,
      referenceCode: 'CLI-ABJ-001',
      firstName: 'Aïcha',
      lastName: 'Koné',
      email: 'aicha.kone@gmail.com',
      phone: '+225 07 44 55 66 77',
      whatsapp: '+225 07 44 55 66 77',
      birthDate: new Date('2000-03-12'),
      nationality: 'Ivoirienne',
      address: 'Marcory Résidentiel, Abidjan',
      currentEducationLevel: 'Master 1 Droit des Affaires',
      fieldOfStudy: 'Droit International',
      targetCountry: 'FRANCE',
      targetIntake: 'Septembre 2026',
      tags: JSON.stringify(['Excellent dossier']),
    },
  });

  const appAicha = await prisma.application.create({
    data: {
      agencyId: agencyAbidjan.id,
      clientId: clientAicha.id,
      counselorId: counselorAbidjan.id,
      templateId: templateFrance.id,
      dossierNumber: 'DOS-ABJ-FR-001',
      country: 'FRANCE',
      targetInstitution: 'Université Paris 1 Panthéon-Sorbonne',
      targetProgram: 'Master 2 Droit International Économique',
      intake: 'Septembre 2026',
      status: 'VISA_GRANTED',
      currentStepIndex: 10,
      progressPercentage: 100,
      totalServiceFee: 500000,
      currency: 'FCFA',
      lastActivityAt: new Date(),
    },
  });

  for (let i = 0; i < templateFrance.steps.length; i++) {
    const step = templateFrance.steps[i];
    await prisma.applicationStep.create({
      data: {
        applicationId: appAicha.id,
        stepTitle: step.title,
        stepDescription: step.description,
        orderIndex: step.orderIndex,
        status: 'COMPLETED',
        responsibleUserId: counselorAbidjan.id,
      },
    });
  }

  console.log('✅ Seed terminé avec succès ! Deux agences opérationnelles et complètes.');
}

main()
  .catch((e) => {
    console.error('Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
