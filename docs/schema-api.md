# Contrat de données Airtable ↔ app

Base « Gestion ferme 24/25 » (`appBQC8ofEfy8kvbD`).

19/11/2026, mis à jour le 20/11 (automations), 21/11 (Ventilation achat → Travaux), 24/11 (Produit, Résultat exploitation) et 25/11/2026 (écrans Synthèse, Livraisons, Ventes ; nettoyage legacy). Seuls les champs listés ici sont lus/écrits par l'app. Tout autre champ est ignoré (allow-list).

## Principe : Airtable calcule, l'app affiche (décision 24-25/11/2026)

Chaque chiffre de gestion affiché par un écran (totaux, résultats, parts, valeurs, y compris les lignes Total) existe comme champ Airtable (formule / rollup / lookup). L'app lit, met en forme et écrit les saisies.

**Exception : calcul d'affichage pur**, autorisé mais à limiter au strict minimum. L'app peut calculer quand le résultat n'est qu'une présentation de données déjà lues, impossible ou peu fiable à faire dans Airtable, et jamais réutilisé ailleurs (ni stocké, ni exporté). Chaque cas est listé ici :

- largeur des barres de progression (proportion par rapport à la plus grande valeur affichée) ;
- écran Ventes : colonnes « Total vendu » (cumul progressif des tonnes vendues, ventes triées par date, même jour : ordre de création) et « Part de la récolte vendue » par ligne (= cumul ÷ Synthèse.Livraison en T, « — » si pas de livraison). Raison : Airtable ne sait pas faire de cumul progressif (un rollup ne peut pas filtrer « ventes antérieures à celle-ci ») ; une automation serait fausse après suppression d'une vente. Le total final reste lu dans Airtable (Synthèse.Vente en T).

Tout nouveau cas doit être ajouté à cette liste ; en cas de doute → créer le champ dans Airtable.

- Calculs liés à la saisie (ex. Montant = Quantité × Prix unitaire dans Travaux, prorata proposé dans un formulaire) : côté serveur, écrits dans Airtable.
- Un écran qui a besoin d'un chiffre de gestion manquant → on crée le champ dans Airtable, puis on l'ajoute ici.
- Couleur, ordre d'affichage et visibilité des cultures sont des données (table Cultures), pas des constantes du code.

## Règles de lecture (côté serveur, Zod)

- Appeler l'API avec `returnFieldsByFieldId=true` et ne demander que les champs ci-dessous (`fields[]=fld…`). Les IDs de champs et de tables ne changent pas quand un champ ou une table est renommé → toujours coder par ID.
- Cellule vide = clé absente dans la réponse JSON → tout champ non obligatoire est `optional()` dans Zod.
- Liens (multipleRecordLinks) = tableau d'IDs, même pour un lien « unique » → prendre `[0]` après validation `array().min(1)`.
- Lookups (multipleLookupValues) = tableau de valeurs → prendre `[0]`. Lookup de case à cocher (Se livre) : absent, vide, `null` ou `false` = faux.
- Formules / rollups : peuvent renvoyer `{ "specialValue": "NaN" }` ou `{ "error": "#ERROR!" }` → schéma `number().or(objet erreur)` puis convertir en `null`.
- Single select = nom de l'option (string). Valider contre l'enum attendue ; valeur inattendue → garder la valeur brute, marquer la ligne « à vérifier » (listée sur la page de contrôle, totaux signalés). Jamais remplacée silencieusement par « inconnu ».
- Monnaie / nombre = number brut (le format €/décimales réglé dans Airtable n'a aucun effet sur l'API). Pourcentages = ratio (1 = 100 %). Dates = `"YYYY-MM-DD"`.
- Arrondir à l'affichage (flottants type 9722.460000000001).

## Liaison à la Synthèse : faite par automations Airtable (pas par l'app)

3 automations actives : lien assolement synthèse, lien livraison synthèse, lien vente synthèse.

- Déclencheur : création d'une ligne dans Assolement / Livraison / Vente.
- Action : écrit le texte `<Nom culture>-<Année de récolte>` dans le lien Synthèse ; Airtable relie la ligne Synthèse dont le nom (ID culture année = Culture & "-" & Récolte) correspond.
- L'année vient du lookup Année de récolte (via le lien Campagne → Campagnes.Année de récolte).

Conséquences pour l'app :

- Créer la ligne en un seul appel avec Culture ET Campagne remplies. Ne PAS écrire Synthèse : c'est l'automation qui le fait.
- Le lien arrive quelques secondes après la création → ne pas relire la Synthèse juste après l'écriture.
- Synthèse est donc optionnel à la lecture sur Assolement / Livraison / Vente.
- Limite : si la ligne Synthèse culture × récolte n'existe pas, aucun lien n'est fait. Créer les lignes Synthèse (liens Culture + Campagne) en début de campagne, avant toute saisie.
- Une ligne créée à la main dans la grille (vide puis remplie case par case) ne sera pas liée.
- Contrôle : filtrer Synthèse vide sur chaque table pour repérer les oublis.
- Aucune automation ne touche la table Travaux : ses liens sont écrits par l'app.

## Tables et champs utilisés

### Campagnes `tblzF5J2JD4XvVt39`

| Champ | ID | Type | Note |
|---|---|---|---|
| Name | `fld73PdoxlqqM6pVU` | text | ✔ (« Campagne 2024/2025 ») |
| Date de début | `fldkY1ocQalwQdl9Z` | date | ✔ |
| Date de fin | `fld6mcpqjeFiH5Kyz` | date | ✔ |
| Status | `fldyzICmt6jreGSVM` | select : Terminé / En cours | ✔ |
| Année de récolte | `fldF48eGyOQCZKZtC` | formule nombre | ✔ |
| Synthèse | `fldKx7bL9KgNcOyRR` | lien → Synthèse | lignes culture × récolte de la campagne |

Totaux de l'écran Synthèse (lecture seule, rollups sur Synthèse sauf mention) :

| Champ | ID | Type | Valeur 24/25 |
|---|---|---|---|
| Total surface PAC (ha) | `fldtyjBvYGX6qo2in` | Σ Surface PAC | 63,98 |
| Total livré (t) | `flda1ZdG0mpdGQrZY` | Σ Livraison en T | 294,995 |
| Total ventes (€) | `fldTXgbpwUsZrKRp7` | Σ Ventes (€) | 72 913,65 |
| Total autres recettes (€) | `fldWhsuy8UBfBFyTJ` | Σ Autres recettes (€) | 31 119,56 |
| Total charges (€) | `fldrRmQeGISWWdTGc` | Σ Charges (€) | 94 310,75 |
| Résultat cultures (€) | `fldYowSXtxHjzyxCz` | Σ Résultat (€) | 9 722,46 |
| Hors culture (€) | `fldsXsLjFyV6rTlUX` | rollup Achat → Hors culture (€) | 1 518,45 |
| Résultat exploitation (€) | `fldb5fssfrKmWY9Ud` | formule = Résultat cultures − Hors culture | 8 204,01 |
| Total travaux agricoles (€) | `fldWwmsLFaAedUE73` | Σ Charges travaux agricoles (€) | 24 120,88 |
| Total travail du sol (€) | `fldWX4vINTxbl6vn2` | Σ Travail du sol (€) | 12 746,00 |
| Total récolte (€) | `fldjcliKJ0Ey58QnW` | Σ Récolte (€) | 6 759,80 |
| Total travaux divers à répartir (€) | `flddCg6cQ6pgqKUxT` | Σ Travaux divers à répartir (€) | 2 688,00 |
| Total autres travaux (€) | `fldYWCjnXFO5ABS2k` | Σ Autres travaux (€) | 1 453,79 |
| Total clause gasoil (€) | `flddMwCRqxGI6tcFm` | Σ Clause gasoil (€) | 473,29 |

Écran Synthèse, ligne Total : surface / livré / ventes / autres recettes / charges / Résultat cultures, puis « Hors culture » et « Résultat exploitation » (chiffre de référence).

### Cultures `tblTH279hEyd0MJes`

| Champ | ID | Type | Note |
|---|---|---|---|
| Nom culture | `fld3yEvGEYYCPoH6k` | text | ✔ |
| Couleur | `fldMphyj8LkYiko0l` | text (hex) | Blé #C2410C, Orge Hiver #2563EB, Orge Printemps #0891B2, Colza #CA8A04, Mais #A21CAF, Tournesol #65A30D, Luzerne #059669, Jachère #6B7280 |
| Ordre | `fldEyOzSMav4w62i2` | number | ordre d'affichage (Jachère = 99, en dernier) |
| Se livre | `fld73PsJ8tD5WTEFp` | checkbox | décochée = masquée sur les pages Livraisons et Ventes (Jachère) |

Nouvelle culture (ex. Soja) : la créer avec Couleur, Ordre, Se livre, avant de créer ses lignes Synthèse. App : couleur grise par défaut si Couleur vide.

### Synthèse (culture × récolte) `tblEVz7qwJpWsuP29` — lecture seule sauf Encaissé

| Champ | ID | Type | Note |
|---|---|---|---|
| ID culture année | `fldAz5caYwDTrnq3W` | formule texte | Culture-Récolte, clé des automations de liaison |
| Culture | `fldmztUZG0nrmDDTH` | lien | ✔ |
| Campagne | `fldCOjkmgRZXvpUd9` | lien | ✔ |
| Nom culture | `fldx6onkyNIr7yfdU` | lookup Cultures | affichage |
| Couleur | `fldpRyBbEanq4tp7d` | lookup Cultures | affichage |
| Ordre | `fldrfIbvJtZayK3r6` | lookup Cultures | tri |
| Se livre | `fld2f1RcLT1qLUYxr` | lookup Cultures (checkbox) | filtre pages Livraisons / Ventes |
| Livraison | `fldWGoYG82PvhZ99r` | lien → Livraison | liste des livraisons de la culture × récolte |
| Vente | `fldUxmEkVCGktf6kg` | lien → Vente | liste des ventes de la culture × récolte |
| Travaux | `fldYTa7EyEBFucwES` | lien → Travaux | |
| Surface PAC (ha) | `fldxtkblc8rX9Kx71` | rollup | base des prorata |
| Livraison en T | `fldqol4POHF9d6tJ1` | formule | |
| Nombre de livraison | `fldtf2PCSFMYFHpjY` | count | tuile Livraisons |
| Valeur livrée estimée (€) | `fldh2LUEzi1dXIkYk` | rollup Σ Livraison.Valeur estimée | tuile / en-tête Livraisons (≠ Ventes : valorise le livré au prix moyen des contrats) |
| Vente en T | `fldDYRBDIkl6064Zj` | rollup | tuile + ligne Total Ventes |
| Part vendue (%) | `fld800eu8FJQGSHgp` | formule = Vente en T ÷ Livraison en T (ratio) | tuile Ventes « 100 % vendu » ; absent si pas de livraison (→ afficher Alerte) |
| Nombre de vente | `fld1xoQnsvHZ7FxzH` | count | tuile Ventes (« Aucune vente enregistrée ») |
| Dernière date de vente | `fldBfeoBU03QFHe4W` | rollup MAX date | |
| Stock | `fldxC99x8pdbfuGRc` | formule | négatif possible (maïs 2025 sans BL) |
| Alerte | `fld7jrymKy9GECw0E` | formule texte | « à vérifier » si Stock < 0 ou Travaux non classés ≠ 0 ; absent sinon |
| Rendement en T/Ha | `fld8gjkGcYNtS77pJ` | formule | absent si pas de livraison |
| Prix moyen de vente en €/T | `fldDjuFeEN9gDmnym` | formule | en-tête Ventes ; absent si pas de vente |
| Valeur contrats (€) | `fldpmvywmtG3WxBvt` | rollup | tuile + ligne Total Ventes (page Ventes = contrats, ne pas utiliser Ventes (€) qui bascule sur l'encaissé) |
| Encaissé (€) | `fldg5ZEgoT3ECSlMr` | currency | écrit par l'app (paiements) ; vide en 24/25 |
| Ventes (€) | `fldBs9O4wBhWCCpFK` | formule | encaissé sinon contrats (écran Synthèse) |
| Écart encaissé / contrats (€) | `fldsOGAYMxXZXduwc` | formule | |
| Autres recettes (€) | `fldpdUMlwWNgksYG9` | rollup | colonne « Aides et autres » |
| Charges (€) | `fldcl0ZXA1Qr6js35` | rollup (Travaux → Montant) | colonne « Dépenses » |
| Charges intrants (€) | `fldojw7I45LU2r2dl` | rollup | |
| Charges travaux agricoles (€) | `fld6yp9bLsP4xYPeo` | rollup | = Σ des 5 familles |
| Charges diverses (€) | `fldwHFRt5JGYG49cj` | rollup | |
| Travail du sol (€) | `fldJjRPqvRmRyBZyF` | rollup Travaux, Catégorie = Travail du sol | |
| Récolte (€) | `fldbj2ywtOGCpBWzk` | rollup, Catégorie = Récolte | |
| Travaux divers à répartir (€) | `fldStWQUpver99EGb` | rollup, Catégorie = Travaux divers à répartir | |
| Autres travaux (€) | `fldFDgs1mYGSltCCa` | rollup, Catégorie = Autres travaux | |
| Clause gasoil (€) | `fldE0LEDdBjTwXoV2` | rollup, Catégorie = Clause gasoil | |
| Travaux non classés (€) | `fldvz6Hizgky4h6IL` | formule contrôle | doit valoir 0 |
| Résultat (€) | `fldGq7DCC9mCwob9B` | formule | Ventes + Autres recettes − Charges |

> ⚠️ Familles de travaux = colonnes fixes (les automations Airtable ne peuvent pas créer de champs). Nouvelle catégorie « Travaux agricoles » dans Achat.Catégorie → Travaux non classés ≠ 0 et Alerte « à vérifier » → créer à la main le rollup dans Synthèse (dupliquer un existant) + son total dans Campagnes.

### Assolement `tblHlqDJmZIJ4Js4E`

| Champ | ID | Type | Obligatoire |
|---|---|---|---|
| ID Assolement | `fldwSh9PhllMgPRR5` | formule | |
| Champ | `fld5geAC3lBiw8e7Z` | lien | ✔ |
| Campagne | `fldkMJEirky92LUka` | lien | ✔ |
| Culture | `fldxvyMS9izLdAHm3` | lien | ✔ |
| Synthèse | `fldtSu1CB9DORDzZK` | lien | rempli par automation (ne pas écrire) |
| Surface PAC (ha) | `fldEer1RsLVaOKyUB` | number | ✔ |

(Tonnage / Rendement par champ existent mais ne sont pas encore utilisés : ils supposent Livraison.Assolement renseigné.)

### Achat (facture) `tblUXDAbvcT8OoBeV`

| Champ | ID | Type | Obligatoire |
|---|---|---|---|
| ID Achat | `fldThX54vVLNpXQ3m` | formule | — |
| Libellé | `fldMHDbovuRxq2wTq` | text | ✔ |
| Date | `fld8tZFONDHO2cjDV` | date | ✔ à la saisie (6 lignes 24/25 sans date : tolérer) |
| Campagne | `fldFQ0TX5hJlnxVvn` | lien | ✔ |
| Statut campagne | `flddwBKrUOuRVRdt8` | lookup Campagne → Status | — |
| Section | `fldW2yA9zqFyEVyrW` | select : Intrants / Report stock N-1 / Travaux agricoles / Charges diverses | ✔ |
| Catégorie | `fldxgzUuKv66YqrRR` | select (rubriques FARM) | ✔ |
| Montant HT | `fldacqZfm7ro5zpdE` | currency (négatif = avoir) | ✔ |
| Montant TTC | `fldFP8WowOuWbNOpP` | currency | non (facultatif à la saisie ; utile export comptable / TVA) |
| Produit | `fldrK2iMUohcu1uqI` | lien | non (vide si non stockable) |
| Quantité | `fldJe5zT70QN4S2yf` | number | non |
| Unité | `fldah3SlSKVHrFr6y` | lookup Produit → Unité | — |
| Prix unitaire (€) | `fldKDsEN7CSEpoqzi` | formule | vide si pas de qté |
| Hors culture (€) | `fldvE72DNRtyD3JlS` | currency | non |
| Stock fin de campagne (€) | `fldg9qGpURCgrZk4y` | currency | non |
| Stock fin (qté) | `fldA14XsJuWiWD4GX` | number | non |
| Note | `fldZWoFPXSkjdDcDa` | long text | non |
| facture | `fldzR8pSVids63jO9` | pièces jointes | non |
| Travaux | `fld5Od89BxYsjaPAU` | lien → Travaux | |
| Total ventilé (€) | `flduFuGKzMpqdcWyF` | rollup (Travaux → Montant) | — |
| Reste à répartir (€) | `fldCrg2sWVyYwW2Hg` | formule | — (≠ 0 = facture pas encore entièrement utilisée / répartie) |
| Quantité utilisée | `fldxNDOWa8OQUtgYZ` | rollup Travaux → Quantité | — |
| Quantité restante | `fldWK1y9fYzP18gGy` | formule | — |

### Travaux (ex-« Ventilation achat ») `tblkauSao9eEp1bxH`

Une ligne = une utilisation / affectation de tout ou partie d'une facture (Achat) à une culture × récolte, en € et éventuellement en quantité.

| Champ | ID | Type | Obligatoire |
|---|---|---|---|
| N° | `fld2tKj8Vte8nG8JQ` | autonumber | — |
| Achat | `fldORrZiTuyagqCPF` | lien | ✔ |
| Culture × récolte | `fldlyFNtRgcIIHNpy` | lien → Synthèse | ✔ (écrit par l'app) |
| Montant (€) | `fld7oXjUGnMbpYKVi` | currency | ✔ — source des rollups Synthèse / Achat |
| Mode | `fldRKc1yGu6yHzH1k` | select : Montant saisi / Prorata surfaces | ✔ à la saisie ; toléré vide sur les lignes importées 24/25 (141 lignes) |
| Catégorie | `fldhIlMhVvqjZCa2t` | lookup Achat → Catégorie | — |
| Section | `fldUkMiKG4GKTjYkm` | lookup Achat → Section | — |
| Date | `fldtPQ0dcmk9bWwng` | date | non (vide sur les 455 lignes importées 24/25) |
| Quantité | `fldcKHq8ZJBucLEyg` | number | non |
| Unité | `fldEETC19QtLRgdAd` | lookup Achat → Unité | — |
| Prix unitaire (€) | `fldGKjDIH2rm6tjh3` | lookup Achat → Prix unitaire | — |

Règles serveur :

- Saisie en € ou en quantité. Si une quantité est saisie : Montant (€) = Quantité × Prix unitaire de la facture, calculé par l'app et écrit dans Montant (€).
- Σ Travaux + hors culture + stock fin = Montant HT (à ±0,01 €) au plus tard au 30/06.

### Produit `tblRzSrYpSMVBySyu`

| Champ | ID | Type | Obligatoire |
|---|---|---|---|
| Produit | `fldtlxUldEvNfzsZ6` | text | ✔ |
| Catégorie | `fldiL6RAXx6Y03Eg4` | select | ✔ |
| Unité | `fldjdo0wsdvKeMhxS` | select : kg / t / l / dose / u | ✔ |
| Dernier prix unitaire (€) | `fldsr18E1Hy2xUV5Q` | lookup (0 ou 1 valeur) | — |
| Nb achats | `fldUnUjfX1Q9yQteW` | count | — |
| Total acheté campagne en cours (€) | `fldofrDSMr95tC9jb` | rollup Σ Montant HT, hors Report stock N-1, Statut campagne = En cours | — |
| Quantité achetée campagne en cours | `fldfzRKDT6n2PXgMB` | rollup Σ Quantité, mêmes filtres | — |

### Livraison `tblKl6amijKZRglvV`

| Champ | ID | Type | Note |
|---|---|---|---|
| ID Bon de livraison | `fldUZbvo15JPJWaCB` | text | ✔ |
| Culture | `fldpeYgUwveWpIHwu` | lien | ✔ |
| Campagne | `fldofwlTydD1BcP2T` | lien | ✔ |
| Synthèse | `fld3cDLSgNLkLFQkv` | lien | rempli par automation (ne pas écrire) |
| Date de livraison | `fldv7sAimW2XGyNiO` | date | ✔ |
| Poids net | `fldmbR5bJCu2OeUPQ` | number (kg) | ✔ — saisie |
| Poids net (t) | `fldaia0hymn7S1IVl` | formule | affichage |
| Prix moyen (€/t) | `fldJ9vucSEIEGF5eF` | rollup Synthèse → Prix moyen de vente | absent si aucune vente |
| Valeur estimée (€) | `fldTiCDycisJBQmxj` | formule = Poids net (t) × Prix moyen | estimation ; absente si aucune vente |
| H2O | `fldJ9lQKRVCx3a7xq` | number (%) | « Humidité » |
| PS | `fld2X7Z8cjPZ45xRD` | number | « Poids spécifique » (vide pour le colza) |
| Proteine | `fldSS25o1rC8Xgy0I` | number (%) | « Protéines » (vide pour le colza) |
| Impureté | `fldlc6yOZUjKS9qyT` | number (%) | |
| Tonnage (brut, kg), Calibre, Brasserie, Mouture, Fusariose ou Hagberg | (voir base) | number | non affichés |
| Champ / Assolement | `fld6EiQHRQII21x1C` / `fld7VnjSuluC77ICK` | lien | non |

Contrôle 24/25 : 1ʳᵉ livraison blé 17,741 t × 159,47 = 2 829,16 € ; Valeur livrée estimée blé 24 454,89 € (Ventes 24 451,30 €).

### Vente (contrats) `tblVTL5mesq0HcW7l`

| Champ | ID | Type | Note |
|---|---|---|---|
| Culture | `fldCduoFWLCEiTc0Q` | lien | ✔ |
| Campagne | `fldoRM3PzRv9fwAZB` | lien | ✔ |
| Synthèse | `fldFLQ2k0VwYJxp1j` | lien | rempli par automation (ne pas écrire) |
| Date | `fldqowG8olJlEAXNt` | date | ✔ |
| Quantité en tonne | `fldDXR2X2UCP0O57t` | number | ✔ |
| Prix par tonne | `fldLTJBCBn3pYeGGy` | currency | ✔ |
| Valeur | `fld5nryz70fWqVqTj` | formule | colonne « Montant » |
| Numéro automatique | `fldQB2ws6fc14dDAZ` | autonumber | ordre de création : départage les ventes du même jour sur l'écran Ventes (ne pas supprimer) |

**Écran Ventes** :

- tuiles = Synthèse (Nom culture, Couleur, Vente en T, Valeur contrats (€), Part vendue (%) ou Alerte, filtrées sur Se livre) ;
- en-tête = Prix moyen de vente en €/T ;
- lignes = ventes liées (Synthèse.Vente) triées par date, puis, le même jour, par ordre de création (Numéro automatique) ;
- colonnes « Total vendu » et « Part de la récolte vendue » = calcul d'affichage côté app (voir Principe) ;
- ligne Total = Vente en T + Valeur contrats (€).

Contrôle 24/25 blé : 5 ventes, 153,331 t, 24 451,30 €, prix moyen 159,47 €/t, part vendue 99,99 %.

### Autres recettes `tblzgEtwBP9FNGjXN`

| Champ | ID | Type | Obligatoire |
|---|---|---|---|
| Libellé | `fldjiVn97mhF52qCo` | text | ✔ |
| Type | `fldGpT6k4s8KmBfQv` | select : DPB / primes PAC, Indemnité grêle, Paille / foin, Autre | ✔ |
| Campagne | `fld5IUJse73wopK5d` | lien | ✔ |
| Culture × récolte | `fldF1En6rDLxdIFgc` | lien | ✔ (écrit par l'app) |
| Montant (€) | `fldj0PsExLuAW5TvX` | currency | ✔ |
| Date | `fld5Vu0nEmp2Ri98z` | date | non (vide sur 8/10 lignes 24/25) |
| Note | `fld3MuIo6USJYldum` | long text | non |

### Parcellaire / Champs

Lecture seule pour l'instant. Champs : voir base.

## État de la donnée 24/25

- Aucun lien obligatoire vide dans Travaux, Vente, Livraison, Assolement 24/25.
- Achat : 6 lignes sans date. Autres recettes : 8/10 sans date.
- Synthèse maïs 2025 : pas de livraison → rendement vide, stock −45,763 t, part vendue vide, Alerte « à vérifier ».
- 25/11 : totaux Campagnes 24/25 = maquette écran Synthèse (63,98 ha ; 295,0 t ; 72 914 € ; 31 120 € ; 94 311 € ; 9 722 € ; familles 12 746 / 6 760 / 2 688 / 1 454 / 473 = 24 121 €) ; Livraisons = maquette (2 829 € ; 24 454 €) ; Ventes = maquette (blé 153,3 t, 24 451 €, 159 €/t, 100 %).

## Nettoyage legacy (fait le 25/11/2026)

**Supprimés** : champs « Synthèse copy » / « Performance Cultures Campagnes », cases Update des anciennes automations, colonnes par culture codées en dur (Campagnes Surface/Stock/Livraison/Vente `<culture>`, Livraison Tonnage `<culture>`, Vente Vente `<culture>`), chaîne « dernière / avant-dernière vente », Vente Stock à date / Cumul des ventes / Livraison à date, Synthèse Cumul surface en Ha, Achat Famille / new type achat, Produit OBSOLÈTE ×2, Livraison Created time, Champs Livraison_test. Contrôle après suppression : toutes les formules valides, totaux 24/25 inchangés.

**Restent** (inutilisés, conservés volontairement) : lien Vente.Livraison (vide), Assolement.Tonnage/Rendement + Livraison.Tonnage sec corrigé/Nombre de champs (rendement par champ), Achat.Stock fin (texte d'origine) (trace d'import).

**Ne PAS supprimer** : Vente.Numéro automatique (tri des ventes du même jour), Année de récolte (Assolement / Livraison / Vente, automations), Synthèse.Récolte (clé ID culture année), Synthèse.Cumul des livraison (source de Livraison en T).
