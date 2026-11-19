// FICHIER GÉNÉRÉ par src/scripts/generer-champs.mts — ne pas modifier à la main.
// Relancer `npm run airtable:champs` après un changement de schéma dans Airtable.
// Seul fichier du projet qui contient des IDs Airtable (tbl…, fld…).
//
// Champs volontairement absents (morts, ou écrits en dur pour chaque culture) :
//   - Cultures.Synthèse copy
//   - Campagnes.Surface Totale Blé
//   - Campagnes.Surface Totale Orge Hiver
//   - Campagnes.Surface totale Colza
//   - Campagnes.Surface Totale Mais
//   - Campagnes.Surface Totale Tournesol
//   - Campagnes.Surface totale Jachère
//   - Campagnes.Vente Mais
//   - Campagnes.Stock Ble
//   - Campagnes.Stock Tournesol
//   - Campagnes.Stock Colza
//   - Campagnes.Stock Orge Hiver
//   - Campagnes.Stock Orge Printemps
//   - Campagnes.Stock Mais
//   - Campagnes.Livraison Ble
//   - Campagnes.Livraison Colza
//   - Campagnes.Livraison Orge Hiver
//   - Campagnes.Livraison Orge Printemps
//   - Campagnes.Livraison Tournesol
//   - Campagnes.Livraison Mais
//   - Campagnes.Vente Ble
//   - Campagnes.Vente Colza
//   - Campagnes.Vente Orge Hiver
//   - Campagnes.Vente Orge Printemps
//   - Campagnes.Vente Tournesol
//   - Campagnes.Synthèse copy
//   - Champs.Livraison_test
//   - Assolement.Synthèse copy
//   - Livraison.Tonnage Ble
//   - Livraison.Tonnage Tournesol
//   - Livraison.Tonnage Colza
//   - Livraison.Tonnage Orge Hiver
//   - Livraison.Tonnage Orge Printemps
//   - Livraison.Tonnage Mais
//   - Livraison.Tonnage Luzerne
//   - Livraison.Synthèse copy
//   - Vente.Vente Ble
//   - Vente.Vente Tournesol
//   - Vente.Vente Mais
//   - Vente.Vente Orge Hiver
//   - Vente.Vente Orge Printemps
//   - Vente.Vente Colza
//   - Vente.Vente Luzerne
//   - Vente.Synthèse copy
//   - Achat.new type achat
//   - Produit.Achat 2
//   - Travaux.Travaux effectués sur Blé
//   - Travaux.Travaux effectués sur Orge Hiver
//   - Travaux.Travaux effectués sur Colza
//   - Travaux.Travaux effectués sur Mais
//   - Travaux.Travaux effectués sur Tournesol
//   - Travaux.Field 20
//   - Travaux.Field 22
//   - Travaux.Synthèse copy
//   - Répartition travaux.Synthèse copy

export const tables = {
  parcellaire: {
    id: "tblzbAIGlrjx0Nk5v",
    nom: "Parcellaire",
    champs: {
      idParcellaire: { id: "fldo4jpHchbiB0ei4", nom: "ID Parcellaire", type: "formula" },
      numeroDeSection: { id: "fldZqll83Cmur8KrN", nom: "Numéro de section", type: "singleLineText" },
      commune: { id: "flda7gRg0606KVtWh", nom: "Commune", type: "singleSelect" },
      lieuDit: { id: "fldeZAduEO6aAqQ19", nom: "Lieu-dit", type: "singleSelect" },
      surfaceCadastreEnHa: { id: "fldgWDUXFpXi6kR7n", nom: "Surface Cadastre en Ha", type: "number" },
      surfaceMsaEnHa: { id: "fldbcsTkar1eTRCcA", nom: "Surface MSA en Ha", type: "number" },
      proprietaire: { id: "fldXR7Hc5wiSjp8qF", nom: "Propriétaire", type: "singleLineText" },
      dateDeDebutDeBail: { id: "fldNkC0BHuYdN71Nz", nom: "Date de début de bail", type: "date" },
      dateDeFinDeBail: { id: "fldGD6CraAvct3F49", nom: "Date de fin de bail", type: "date" },
      champs: { id: "fldozGKZYS6WPzGvU", nom: "Champs", type: "multipleRecordLinks" },
    },
  },
  cultures: {
    id: "tblTH279hEyd0MJes",
    nom: "Cultures",
    champs: {
      nomCulture: { id: "fld3yEvGEYYCPoH6k", nom: "Nom culture", type: "singleLineText" },
      assolement: { id: "fldswnZ1iYTSaPoNa", nom: "Assolement", type: "multipleRecordLinks" },
      livraison: { id: "fldvaE60lt4xeiLdP", nom: "Livraison", type: "multipleRecordLinks" },
      vente: { id: "fldFuUywbfomdftTB", nom: "Vente", type: "multipleRecordLinks" },
      derniereDateDeVente: { id: "fldfQn9WGmsSs3LSf", nom: "Dernière date de vente", type: "rollup" },
      derniereVente: { id: "fldQ6G9UX6vmEZtRv", nom: "Dernière vente", type: "multipleLookupValues" },
      avantDerniereVente: { id: "fldCVc3vcrebU9P2X", nom: "Avant dernière vente", type: "formula" },
      synthese: { id: "fldlI8SSNaLTJtOXC", nom: "Synthèse", type: "multipleRecordLinks" },
      travaux: { id: "fldKhYW3xfhQq8JTJ", nom: "Travaux", type: "multipleRecordLinks" },
      performanceCulturesCampagnes: { id: "fldCYOVAOQfIYc12Z", nom: "Performance Cultures Campagnes", type: "singleLineText" },
      repartitionTravaux: { id: "fldNlp9bxnnbBztYk", nom: "Répartition travaux", type: "multipleRecordLinks" },
    },
  },
  campagnes: {
    id: "tblzF5J2JD4XvVt39",
    nom: "Campagnes",
    champs: {
      name: { id: "fld73PdoxlqqM6pVU", nom: "Name", type: "singleLineText" },
      dateDeDebut: { id: "fldkY1ocQalwQdl9Z", nom: "Date de début", type: "date" },
      dateDeFin: { id: "fld6mcpqjeFiH5Kyz", nom: "Date de fin", type: "date" },
      status: { id: "fldyzICmt6jreGSVM", nom: "Status", type: "singleSelect" },
      assolement: { id: "fldOevCPbWP2bWLRT", nom: "Assolement", type: "multipleRecordLinks" },
      anneeDeRecolte: { id: "fldF48eGyOQCZKZtC", nom: "Année de récolte", type: "formula" },
      vente: { id: "flddhbk6gyKSu02Pv", nom: "Vente", type: "multipleRecordLinks" },
      livraison: { id: "fldby6BcF1a43ecUc", nom: "Livraison", type: "multipleRecordLinks" },
      synthese: { id: "fldKx7bL9KgNcOyRR", nom: "Synthèse", type: "multipleRecordLinks" },
      surfaceTotaleExploitee: { id: "fldLJYpKfygzCH7AC", nom: "Surface totale exploitée", type: "rollup" },
      travaux: { id: "fldP97MLijAfBXUuQ", nom: "Travaux", type: "multipleRecordLinks" },
      performanceCulturesCampagnes: { id: "fldzz43CBH5W33hYa", nom: "Performance Cultures Campagnes", type: "singleLineText" },
    },
  },
  synthese: {
    id: "tblEVz7qwJpWsuP29",
    nom: "Synthèse",
    champs: {
      idCultureAnnee: { id: "fldAz5caYwDTrnq3W", nom: "ID culture année", type: "formula" },
      culture: { id: "fldmztUZG0nrmDDTH", nom: "Culture", type: "multipleRecordLinks" },
      campagne: { id: "fldCOjkmgRZXvpUd9", nom: "Campagne", type: "multipleRecordLinks" },
      recolte: { id: "fldCbyTToHf2cYUOM", nom: "Récolte", type: "multipleLookupValues" },
      livraison: { id: "fldWGoYG82PvhZ99r", nom: "Livraison", type: "multipleRecordLinks" },
      assolement: { id: "fldCBtX0oAJPhcJ7f", nom: "Assolement", type: "multipleRecordLinks" },
      vente: { id: "fldUxmEkVCGktf6kg", nom: "Vente", type: "multipleRecordLinks" },
      derniereDateDeVente: { id: "fldBfeoBU03QFHe4W", nom: "Dernière date de vente", type: "rollup" },
      cumulDesLivraison: { id: "fldtoG6FSwwqT36p0", nom: "Cumul des livraison", type: "rollup" },
      livraisonEnT: { id: "fldqol4POHF9d6tJ1", nom: "Livraison en T", type: "formula" },
      venteEnT: { id: "fldDYRBDIkl6064Zj", nom: "Vente en T", type: "rollup" },
      cumulSurfaceEnHa: { id: "fldIWob0WUINqKtXk", nom: "Cumul surface en Ha", type: "rollup" },
      venteEnEuros: { id: "fldpmvywmtG3WxBvt", nom: "Vente en €", type: "rollup" },
      rendementEnTHa: { id: "fld8gjkGcYNtS77pJ", nom: "Rendement en T/Ha", type: "formula" },
      prixMoyenDeVenteEnEurosT: { id: "fldDjuFeEN9gDmnym", nom: "Prix moyen de vente en €/T", type: "formula" },
      derniereVente: { id: "fldLbGmBNGZjatnZM", nom: "Dernière vente", type: "multipleLookupValues" },
      repartitionTravaux: { id: "fldaLZk5lbM0kfgk8", nom: "Répartition travaux", type: "multipleRecordLinks" },
      travaux: { id: "fldS9CdaMLY4Rki6C", nom: "Travaux", type: "multipleRecordLinks" },
      coutTravaux: { id: "fldGU6tnllI6kSRx7", nom: "Cout travaux", type: "formula" },
      profit: { id: "fldGq7DCC9mCwob9B", nom: "Profit", type: "formula" },
      stock: { id: "fldxC99x8pdbfuGRc", nom: "Stock", type: "formula" },
      coutSemence: { id: "fldaE89paedP5NkzP", nom: "Cout Semence", type: "rollup" },
      coutEngrais: { id: "fldnMIHGC6ATedOAT", nom: "Cout Engrais", type: "rollup" },
      coutAntilimace: { id: "fldcK0MBZmmzEZpGN", nom: "Cout Antilimace", type: "rollup" },
      coutDivers: { id: "fld8nRdrPHHDEQJB2", nom: "Cout Divers", type: "rollup" },
      coutFongicide: { id: "fldV4BQ4MszYsnJnj", nom: "Cout Fongicide", type: "rollup" },
      nombreDeLivraison: { id: "fldtf2PCSFMYFHpjY", nom: "Nombre de livraison", type: "count" },
      nombreDeVente: { id: "fld1xoQnsvHZ7FxzH", nom: "Nombre de vente", type: "count" },
      avantDerniereVente: { id: "fldKyW4oSijXo3gIk", nom: "Avant dernière vente", type: "formula" },
      coutInsecticide: { id: "fldZwFB02xJEnzWOW", nom: "Cout Insecticide", type: "rollup" },
    },
  },
  champs: {
    id: "tblCePH7H1Vj3WgAO",
    nom: "Champs",
    champs: {
      idChamp: { id: "fldd7rLAssaGWQf7K", nom: "ID Champ", type: "formula" },
      parcelles: { id: "fldr4vIZxrss2GtfP", nom: "Parcelles", type: "multipleRecordLinks" },
      tailleParcelle: { id: "fldSpULWj2m8eYsr9", nom: "Taille Parcelle", type: "rollup" },
      tailleChamp: { id: "fldEGOmXlshWI4u7C", nom: "Taille champ", type: "number" },
      lieuDit: { id: "fldWZAJ3Xd7T2i4Fy", nom: "Lieu-dit", type: "multipleLookupValues" },
      status: { id: "fldBieb0eL30tNsgh", nom: "Status", type: "singleSelect" },
      assolement: { id: "fldl57cMBWAXnler3", nom: "Assolement", type: "multipleRecordLinks" },
      livraison: { id: "fldIs0POzo7hAGTU7", nom: "Livraison", type: "multipleRecordLinks" },
    },
  },
  assolement: {
    id: "tblHlqDJmZIJ4Js4E",
    nom: "Assolement",
    champs: {
      idAssolement: { id: "fldwSh9PhllMgPRR5", nom: "ID Assolement", type: "formula" },
      champ: { id: "fld5geAC3lBiw8e7Z", nom: "Champ", type: "multipleRecordLinks" },
      campagne: { id: "fldkMJEirky92LUka", nom: "Campagne", type: "multipleRecordLinks" },
      culture: { id: "fldxvyMS9izLdAHm3", nom: "Culture", type: "multipleRecordLinks" },
      haExploites: { id: "fldppek1EdZGSIrjh", nom: "Ha exploités", type: "multipleLookupValues" },
      nomParcelle: { id: "fld59gLqFCKuOOCkx", nom: "Nom parcelle", type: "multipleLookupValues" },
      anneeDeRecolte: { id: "fldMAKsI2XQq0YCt9", nom: "Année de récolte", type: "multipleLookupValues" },
      livraison: { id: "fldpZatJl4frhEVWM", nom: "Livraison", type: "multipleRecordLinks" },
      tonnage: { id: "fldxXuSh2ECxLSK02", nom: "Tonnage", type: "rollup" },
      rendement: { id: "fldQxEGMgoXgNexcj", nom: "Rendement", type: "formula" },
      synthese: { id: "fldtSu1CB9DORDzZK", nom: "Synthèse", type: "multipleRecordLinks" },
      update: { id: "fldoDXgkUgjaP3Iop", nom: "Update", type: "checkbox" },
    },
  },
  livraison: {
    id: "tblKl6amijKZRglvV",
    nom: "Livraison",
    champs: {
      idBonDeLivraison: { id: "fldUZbvo15JPJWaCB", nom: "ID Bon de livraison", type: "singleLineText" },
      culture: { id: "fldpeYgUwveWpIHwu", nom: "Culture", type: "multipleRecordLinks" },
      dateDeLivraison: { id: "fldv7sAimW2XGyNiO", nom: "Date de livraison", type: "date" },
      assolement: { id: "fld7VnjSuluC77ICK", nom: "Assolement", type: "multipleRecordLinks" },
      campagne: { id: "fldofwlTydD1BcP2T", nom: "Campagne", type: "multipleRecordLinks" },
      champ: { id: "fld6EiQHRQII21x1C", nom: "Champ", type: "multipleRecordLinks" },
      tonnage: { id: "fldkOciUQyAjNlQyb", nom: "Tonnage", type: "number" },
      h2o: { id: "fldJ9lQKRVCx3a7xq", nom: "H2O", type: "number" },
      ps: { id: "fld2X7Z8cjPZ45xRD", nom: "PS", type: "number" },
      calibre: { id: "fldnrofoEgnbKi9mA", nom: "Calibre", type: "number" },
      impurete: { id: "fldlc6yOZUjKS9qyT", nom: "Impureté", type: "number" },
      poidsNet: { id: "fldmbR5bJCu2OeUPQ", nom: "Poids net", type: "number" },
      brasserie: { id: "fldTUYGVJs2urZAfi", nom: "Brasserie", type: "number" },
      mouture: { id: "fldvna9BohXXQVRHQ", nom: "Mouture", type: "number" },
      proteine: { id: "fldSS25o1rC8Xgy0I", nom: "Proteine", type: "number" },
      fusarioseOuHagberg: { id: "fld6KXRv7cY4O5lSp", nom: "Fusariose ou Hagberg", type: "number" },
      nombreDeChamps: { id: "fldetbPlJX03tWUJq", nom: "Nombre de champs", type: "count" },
      tonnageSecCorrige: { id: "fldqEjrS2ravWdnpN", nom: "Tonnage sec corrigé", type: "formula" },
      vente: { id: "fldB21kidBtTrzj2R", nom: "Vente", type: "multipleRecordLinks" },
      anneeDeRecolte: { id: "fldu4cOm3MpvQwRCj", nom: "Année de récolte", type: "multipleLookupValues" },
      update: { id: "fldO5tTpEYCiui7Ge", nom: "update", type: "checkbox" },
      synthese: { id: "fld3cDLSgNLkLFQkv", nom: "Synthèse", type: "multipleRecordLinks" },
      createdTime: { id: "fldE9mgQT8U4YX5L5", nom: "Created time", type: "createdTime" },
    },
  },
  vente: {
    id: "tblVTL5mesq0HcW7l",
    nom: "Vente",
    champs: {
      idVente: { id: "fldb1AV9RyQ3NJNAs", nom: "ID Vente", type: "formula" },
      culture: { id: "fldCduoFWLCEiTc0Q", nom: "Culture", type: "multipleRecordLinks" },
      campagne: { id: "fldoRM3PzRv9fwAZB", nom: "Campagne", type: "multipleRecordLinks" },
      date: { id: "fldqowG8olJlEAXNt", nom: "Date", type: "date" },
      quantiteEnTonne: { id: "fldDXR2X2UCP0O57t", nom: "Quantité en tonne", type: "number" },
      prixParTonne: { id: "fldLTJBCBn3pYeGGy", nom: "Prix par tonne", type: "currency" },
      cumulDesVentesPrev: { id: "fldNMinSmSGDt2Quq", nom: "Cumul des ventes prev", type: "number" },
      cumulDesVentesEnQuantite: { id: "fldGk5tF8xb3yAs5m", nom: "Cumul des ventes en quantité", type: "formula" },
      valeur: { id: "fld5nryz70fWqVqTj", nom: "Valeur", type: "formula" },
      anneeDeRecolte: { id: "fldX6zm7Na8HLK7o2", nom: "Année de récolte", type: "multipleLookupValues" },
      livraison: { id: "fldk8EQINTzwnFCyi", nom: "Livraison", type: "multipleRecordLinks" },
      livraisonADate: { id: "fldz83qQ111tnBQSG", nom: "Livraison à date", type: "multipleLookupValues" },
      stockADate: { id: "fldHaFwWOrsb3FOQp", nom: "Stock à date", type: "formula" },
      numeroAutomatique: { id: "fldQB2ws6fc14dDAZ", nom: "Numéro automatique", type: "autoNumber" },
      dateDerniereVente: { id: "fldlpNHycmgjRiMEX", nom: "date dernière vente", type: "multipleLookupValues" },
      numeroAvantDerniereVente: { id: "fldLU6maaJdz8uQ1K", nom: "Numéro avant dernière vente", type: "multipleLookupValues" },
      synthese: { id: "fldFLQ2k0VwYJxp1j", nom: "Synthèse", type: "multipleRecordLinks" },
      updateFigures: { id: "fldg5wtvuBAoajJ4f", nom: "Update figures", type: "checkbox" },
      isLastSale: { id: "flds9FC1TRpQRXKKQ", nom: "is last sale ?", type: "formula" },
      isPrevSale: { id: "fldMcY0IqKib3qgFg", nom: "Is prev sale ?", type: "formula" },
    },
  },
  achat: {
    id: "tblUXDAbvcT8OoBeV",
    nom: "Achat",
    champs: {
      idAchat: { id: "fldThX54vVLNpXQ3m", nom: "ID Achat", type: "formula" },
      name: { id: "fldMHDbovuRxq2wTq", nom: "Name", type: "singleLineText" },
      quantite: { id: "fldJe5zT70QN4S2yf", nom: "quantite", type: "number" },
      unite: { id: "fldfXo4BzG1eMtDXb", nom: "Unite", type: "multipleSelects" },
      date: { id: "fld8tZFONDHO2cjDV", nom: "Date", type: "date" },
      typeAchat: { id: "fldrK2iMUohcu1uqI", nom: "Type Achat", type: "multipleRecordLinks" },
      montantHt: { id: "fldacqZfm7ro5zpdE", nom: "Montant HT", type: "currency" },
      montantTtc: { id: "fldFP8WowOuWbNOpP", nom: "Montant TTC", type: "currency" },
      facture: { id: "fldzR8pSVids63jO9", nom: "facture", type: "multipleAttachments" },
      famille: { id: "fld2Wvutc9bPlx2gJ", nom: "Famille", type: "multipleLookupValues" },
    },
  },
  produit: {
    id: "tblRzSrYpSMVBySyu",
    nom: "Produit",
    champs: {
      produitOuTravaux: { id: "fldtlxUldEvNfzsZ6", nom: "Produit ou travaux", type: "singleLineText" },
      type: { id: "fldNDov7nMSO08Eb3", nom: "Type", type: "singleSelect" },
      quantiteEntrante: { id: "fldXLvpoyPvP3WoJY", nom: "Quantite entrante", type: "rollup" },
      quantiteSortante: { id: "fld87bUCnSum2Slrz", nom: "Quantite sortante", type: "rollup" },
      quantite: { id: "fldbcJ5I3AkuIOY2o", nom: "Quantite", type: "formula" },
      unite: { id: "fldmtRF8EqSfX6Svs", nom: "Unite", type: "multipleLookupValues" },
      achat: { id: "fldSnMsfTUELnuPRD", nom: "Achat", type: "multipleRecordLinks" },
      nombreDAchat: { id: "fldUnUjfX1Q9yQteW", nom: "nombre d'achat", type: "count" },
      travaux: { id: "fld3hTlhfhWkBbqFO", nom: "Travaux", type: "multipleRecordLinks" },
      totalAchat: { id: "fldumxusTCRAxV5MY", nom: "Total Achat", type: "rollup" },
      prixParUnite: { id: "fldwIQQXXPii9X7s8", nom: "Prix par unite", type: "formula" },
      totalTravaux: { id: "fldCiIQnnoEi3yx8b", nom: "Total travaux", type: "rollup" },
    },
  },
  travaux: {
    id: "tblktfYanLd4s4aE0",
    nom: "Travaux",
    champs: {
      idTravaux: { id: "fldcPYwb9u3gvtvl8", nom: "ID travaux", type: "formula" },
      campagne: { id: "fld1VHBwmkP4wtPxY", nom: "Campagne", type: "multipleRecordLinks" },
      anneeDeRecolte: { id: "fldloPGcOpodqncg7", nom: "Année de récolte", type: "multipleLookupValues" },
      date: { id: "fldnmqWl16tdYrk6S", nom: "Date", type: "date" },
      type: { id: "fldZ0aaCqxiNRIqYk", nom: "Type", type: "multipleRecordLinks" },
      quantiteUtilisee: { id: "fldePUiDLVorZmbDq", nom: "Quantite utilisee", type: "number" },
      unite: { id: "fldzO55D5cev0qTTi", nom: "Unite", type: "multipleLookupValues" },
      uniteUtilisee: { id: "fldEhw60giBnHVzzF", nom: "Unite utilisee", type: "singleSelect" },
      prixParUniteFromType: { id: "fldrep0u2F1vrtRQ0", nom: "Prix par unite (from Type)", type: "multipleLookupValues" },
      coutTravaux: { id: "flda3IATycXKPBWcn", nom: "Cout travaux", type: "formula" },
      culturesConcernees: { id: "fld3Vktu6KyVB9jUw", nom: "Cultures concernées", type: "multipleRecordLinks" },
      repartitionTravaux: { id: "fldvUJEjc2lTDtUtv", nom: "Répartition travaux", type: "multipleRecordLinks" },
      synthese: { id: "fldKCKAWNfg0Kijn4", nom: "Synthèse", type: "multipleRecordLinks" },
      cultureConcerneesName: { id: "fldEGEJ3gToAzhKGi", nom: "Culture concernées name", type: "multipleLookupValues" },
      surfaceTotalConcernee: { id: "fldbRzjVlOSiaAbZU", nom: "Surface total concernée", type: "rollup" },
      famille: { id: "fld48Vhm9iBw0OIDj", nom: "Famille", type: "multipleLookupValues" },
    },
  },
  repartitionTravaux: {
    id: "tblp6BDyiCIDFgTSY",
    nom: "Répartition travaux",
    champs: {
      id: { id: "fld4o2iRnm5izZ6lZ", nom: "ID", type: "autoNumber" },
      travaux: { id: "fldRawIR00OnZlBFP", nom: "Travaux", type: "multipleRecordLinks" },
      synthese: { id: "fldxShGvbuSZpb8fg", nom: "Synthèse", type: "multipleRecordLinks" },
      montantHt: { id: "fldMHPyOjFPygb4yC", nom: "Montant HT", type: "formula" },
      surfaceDesTravaux: { id: "fldGsa6vqXRws8zCC", nom: "Surface des travaux", type: "multipleLookupValues" },
      surfaceTotaleDesTravaux: { id: "fld8FitFJwqN3F9My", nom: "Surface totale des travaux", type: "multipleLookupValues" },
      montantTotalDesTravaux: { id: "fldByRT7i5RI7H1xM", nom: "Montant total des travaux", type: "multipleLookupValues" },
      familleFromTravaux: { id: "fldyox7YpEQlczsRf", nom: "Famille (from Travaux)", type: "multipleLookupValues" },
      recolteFromSynthese: { id: "fldrYhJd28OpN19jU", nom: "Récolte (from Synthèse)", type: "multipleLookupValues" },
      manualSort: { id: "fldSajKTeLLHTsLeA", nom: "Manual sort", type: "manualSort" },
      culture: { id: "fldPmT7ISECoVOqDj", nom: "Culture", type: "multipleRecordLinks" },
    },
  },
} as const;

export type Tables = typeof tables;
export type CleTable = keyof Tables;
