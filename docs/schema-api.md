# Contrat de données Airtable ↔ app

Base de référence : « Gestion ferme 24/25 » (sélectionnée par AIRTABLE_BASE_ID, jamais en dur). 19/11/2026, mis à jour le 20/11/2026 (automations) et le 21/11/2026 (Ventilation achat → Travaux).

Seuls les champs listés ici sont lus/écrits par l'app. Tout autre champ est ignoré (allow-list) → un champ legacy cassé ne peut pas faire tomber l'API. Dans le code, les IDs ci-dessous ne doivent apparaître que dans src/lib/airtable/fields.ts (généré par npm run airtable:champs).

## Règles de lecture (côté serveur, Zod)

- Appeler l'API avec returnFieldsByFieldId=true et ne demander que les champs ci-dessous (fields[]=fld…). Les IDs de champs et de tables ne changent pas quand un champ ou une table est renommé → toujours coder par ID.
- Cellule vide = clé absente dans la réponse JSON → tout champ non obligatoire est optional() dans Zod.
- Liens (multipleRecordLinks) = tableau d'IDs, même pour un lien « unique » → valider array().min(1) puis prendre [0].
- On préfère un calcul, un rollup ou un lookup Airtable à du code dans l'app (y compris une jointure simple). Un lookup listé ici est donc autorisé.
- Lookups (multipleLookupValues) = tableau de valeurs, même pour une seule → brique `lookupNombre` / `lookupTexte` / `lookupChoixParmi` (0 ou 1 valeur ; plusieurs → « à vérifier »).
- Formules / rollups : peuvent renvoyer { "specialValue": "NaN" } ou { "error": "#ERROR!" } → schéma number().or(objet erreur) puis convertir en null.
- Single select = nom de l'option (string). Lecture : la valeur brute est gardée. Une valeur hors de la liste attendue (brique `choixParmi`) est **signalée** : la ligne reste comptée, elle est listée sur la page de contrôle, et les totaux qui la contiennent indiquent qu'ils contiennent des lignes à vérifier. Rien de visible sur les écrans de saisie. Pas de valeur de repli « inconnu ».
- Écriture : un single select n'accepte que les valeurs de la liste (schéma strict).
- Monnaie / nombre = number. Dates = "YYYY-MM-DD".
- Rollups de la Synthèse : arrondir côté app (flottants type 7e-15).

## Liaison à la Synthèse : faite par automations Airtable (pas par l'app)

3 automations actives dans la base : lien assolement synthèse, lien livraison synthèse, lien vente synthèse.

- Déclencheur : création d'une ligne dans Assolement / Livraison / Vente.
- Action : écrit le texte <Nom culture>-<Année de récolte> dans le lien Synthèse ; Airtable relie la ligne Synthèse dont le nom (ID culture année = Culture & "-" & Récolte) correspond.
- L'année vient du lookup Année de récolte (via le lien Campagne → Campagnes.Année de récolte).

Conséquences pour l'app :

- Créer la ligne en un seul appel avec Culture ET Campagne remplies. Ne PAS écrire Synthèse : c'est l'automation qui le fait.
- Le lien arrive quelques secondes après la création (automation asynchrone) → ne pas relire la Synthèse juste après l'écriture pour afficher un stock / résultat à jour ; confirmer la saisie avec les valeurs du formulaire.
- Synthèse est donc optionnel à la lecture sur Assolement / Livraison / Vente (peut être vide juste après création).
- Limite : si la ligne Synthèse culture × récolte n'existe pas encore (nouvelle culture ou nouvelle récolte), aucun lien n'est fait. La ligne Synthèse (liens Culture + Campagne) doit exister en début de campagne, avant toute saisie. Pour l'instant elle est créée à la main ; sa création par l'app est prévue avec la future fonction « nouvelle campagne ».
- Une ligne créée à la main dans la grille (vide puis remplie case par case) ne sera pas liée : l'automation se lance avant que Culture / Campagne soient remplies.
- Contrôle : filtrer Synthèse vide sur chaque table pour repérer les oublis (l'app les met dans « à vérifier »).
- Aucune automation ne touche la table Travaux (ex-Ventilation achat) ni Autres recettes : leurs liens vers la Synthèse sont écrits par l'app.

## Tables et champs utilisés

### Campagnes `tblzF5J2JD4XvVt39`

| Champ | ID | Type | Obligatoire |
|---|---|---|---|
| Name | `fld73PdoxlqqM6pVU` | text | ✔ |
| Date de début | `fldkY1ocQalwQdl9Z` | date | ✔ |
| Date de fin | `fld6mcpqjeFiH5Kyz` | date | ✔ |
| Status | `fldyzICmt6jreGSVM` | select | ✔ |
| Année de récolte | `fldF48eGyOQCZKZtC` | formule nombre | ✔ |
| Hors culture (€) | `fldsXsLjFyV6rTlUX` | rollup (Achat → Hors culture (€), SUM) | — (ajouté le 24/11) ; charges niveau exploitation (ex. bonus TSA) |
| Résultat cultures (€) | `fldYowSXtxHjzyxCz` | rollup (Synthèse → Résultat (€), SUM) | — (ajouté le 24/11) |
| Résultat exploitation (€) | `fldb5fssfrKmWY9Ud` | formule : Résultat cultures (€) − Hors culture (€) | — (ajouté le 24/11) ; chiffre mis en avant sur l'écran Résultat, lu tel quel (aucun calcul dans l'app) |
| Total surface PAC (ha) | `fldtyjBvYGX6qo2in` | rollup (Synthèse → Surface PAC (ha), SUM) | — (ajouté le 25/11) ; ligne Total de l'écran Synthèse |
| Total livré (t) | `flda1ZdG0mpdGQrZY` | rollup (Synthèse → Livraison en T, SUM) | — (25/11) |
| Total ventes (€) | `fldTXgbpwUsZrKRp7` | rollup (Synthèse → Ventes (€), SUM) | — (25/11) |
| Total autres recettes (€) | `fldWhsuy8UBfBFyTJ` | rollup (Synthèse → Autres recettes (€), SUM) | — (25/11) |
| Total charges (€) | `fldrRmQeGISWWdTGc` | rollup (Synthèse → Charges (€), SUM) | — (25/11) |
| Total travaux agricoles (€) | `fldWwmsLFaAedUE73` | rollup (Synthèse → Charges travaux agricoles (€), SUM) | — (25/11) |
| Total travail du sol / récolte / travaux divers à répartir / autres travaux / clause gasoil (€) | `fldWX4vINTxbl6vn2` / `fldjcliKJ0Ey58QnW` / `flddCg6cQ6pgqKUxT` / `fldYWCjnXFO5ABS2k` / `flddMwCRqxGI6tcFm` | rollups (Synthèse → famille, SUM) | — (25/11) ; colonne Total du tableau « Travaux agricoles par culture » |

Campagne = 01/07 → 30/06.

### Cultures `tblTH279hEyd0MJes`

| Champ | ID | Type | Obligatoire |
|---|---|---|---|
| Nom culture | `fld3yEvGEYYCPoH6k` | text | ✔ |
| Couleur | `fldMphyj8LkYiko0l` | text « #RRGGBB » | — (25/11) ; couleur de la culture sur les écrans (gris si vide ou mal écrite) |
| Ordre | `fldEyOzSMav4w62i2` | number | — (25/11) ; ordre d'affichage (vide : à la fin) |
| Se livre | `fld73PsJ8tD5WTEFp` | checkbox | — (25/11) ; non coché (ex. Jachère) : absente de l'écran Livraisons |

### Synthèse (culture × récolte) `tblEVz7qwJpWsuP29` — lecture seule

| Champ | ID | Type | Note |
|---|---|---|---|
| ID culture année | `fldAz5caYwDTrnq3W` | formule texte | Culture-Récolte, sert de clé aux automations de liaison |
| Culture | `fldmztUZG0nrmDDTH` | lien | ✔ |
| Nom culture | `fldx6onkyNIr7yfdU` | lookup Culture → Nom culture | — (25/11) ; nom affiché |
| Couleur / Ordre / Se livre | `fldpRyBbEanq4tp7d` / `fldrfIbvJtZayK3r6` / `fld2f1RcLT1qLUYxr` | lookups Culture → … | — (25/11) ; « Se livre » non coché renvoie `[null]` |
| Campagne | `fldCOjkmgRZXvpUd9` | lien | ✔ |
| Travaux | `fldYTa7EyEBFucwES` | lien → Travaux | ex-« Ventilation achat » |
| Surface PAC (ha) | `fldxtkblc8rX9Kx71` | rollup | base des prorata |
| Livraison en T | `fldqol4POHF9d6tJ1` | formule |  |
| Nombre de livraison | `fldtf2PCSFMYFHpjY` | count | écran Livraisons |
| Valeur livrée estimée (€) | `fldh2LUEzi1dXIkYk` | rollup (Livraison → Valeur estimée (€), SUM) | — (25/11) ; écran Livraisons |
| Vente en T | `fldDYRBDIkl6064Zj` | rollup |  |
| Stock | `fldxC99x8pdbfuGRc` | formule | négatif possible (maïs 2025 sans BL) |
| Rendement en T/Ha | `fld8gjkGcYNtS77pJ` | formule | vide si pas de livraison |
| Prix moyen de vente en €/T | `fldDjuFeEN9gDmnym` | formule | vide si pas de vente |
| Valeur contrats (€) | `fldpmvywmtG3WxBvt` | rollup |  |
| Encaissé (€) | `fldg5ZEgoT3ECSlMr` | currency | lecture seule pour l'instant (formulaire paiement hors scope) ; vide en 24/25 |
| Ventes (€) | `fldBs9O4wBhWCCpFK` | formule | encaissé sinon contrats |
| Écart encaissé / contrats (€) | `fldsOGAYMxXZXduwc` | formule |  |
| Autres recettes (€) | `fldpdUMlwWNgksYG9` | rollup |  |
| Charges (€) | `fldcl0ZXA1Qr6js35` | rollup (Travaux → Montant) |  |
| Charges intrants (€) | `fldojw7I45LU2r2dl` | rollup |  |
| Charges travaux agricoles (€) | `fld6yp9bLsP4xYPeo` | rollup |  |
| Charges diverses (€) | `fldwHFRt5JGYG49cj` | rollup |  |
| Résultat (€) | `fldGq7DCC9mCwob9B` | formule | Ventes + Autres recettes − Charges |
| Travail du sol / Récolte / Travaux divers à répartir / Autres travaux / Clause gasoil (€) | `fldJjRPqvRmRyBZyF` / `fldbj2ywtOGCpBWzk` / `fldStWQUpver99EGb` / `fldFDgs1mYGSltCCa` / `fldE0LEDdBjTwXoV2` | rollups (Travaux → Montant, filtrés sur la Catégorie) | — (25/11) ; tableau « Travaux agricoles par culture » |
| Travaux non classés (€) | `fldvz6Hizgky4h6IL` | formule : Charges travaux agricoles − Σ familles, arrondi 2 déc. | — (25/11) ; ≠ 0 = une catégorie de travaux n'est dans aucune famille |
| Alerte | `fld7jrymKy9GECw0E` | formule texte : « à vérifier » si Stock < 0 ou Travaux non classés ≠ 0 | — (25/11) ; affichée à côté du nom de la culture |

Stock à une date donnée (historique) : pas stocké.

### Assolement `tblHlqDJmZIJ4Js4E`

| Champ | ID | Type | Obligatoire |
|---|---|---|---|
| ID Assolement | `fldwSh9PhllMgPRR5` | formule | — |
| Champ | `fld5geAC3lBiw8e7Z` | lien | ✔ |
| Campagne | `fldkMJEirky92LUka` | lien | ✔ |
| Culture | `fldxvyMS9izLdAHm3` | lien | ✔ |
| Synthèse | `fldtSu1CB9DORDzZK` | lien | rempli par automation (ne pas écrire) |
| Surface PAC (ha) | `fldEer1RsLVaOKyUB` | number | ✔ (surface déclarée de l'année ≠ cadastrale) |

### Achat (facture) `tblUXDAbvcT8OoBeV`

| Champ | ID | Type | Obligatoire |
|---|---|---|---|
| ID Achat | `fldThX54vVLNpXQ3m` | formule | — |
| Libellé | `fldMHDbovuRxq2wTq` | text | ✔ |
| Date | `fld8tZFONDHO2cjDV` | date | ✔ à la saisie (6 lignes 24/25 sans date : tolérer) |
| Campagne | `fldFQ0TX5hJlnxVvn` | lien | ✔ |
| Section | `fldW2yA9zqFyEVyrW` | select : Intrants / Report stock N-1 / Travaux agricoles / Charges diverses | ✔ |
| Catégorie | `fldxgzUuKv66YqrRR` | select (rubriques FARM) | ✔ |
| Montant HT | `fldacqZfm7ro5zpdE` | currency (négatif = avoir) | ✔ |
| Produit | `fldrK2iMUohcu1uqI` | lien | non (vide si non stockable) |
| Quantité | `fldJe5zT70QN4S2yf` | number | non |
| Prix unitaire (€) | `fldKDsEN7CSEpoqzi` | formule | vide si pas de qté |
| Hors culture (€) | `fldvE72DNRtyD3JlS` | currency | non |
| Stock fin de campagne (€) | `fldg9qGpURCgrZk4y` | currency | non |
| Stock fin (qté) | `fldA14XsJuWiWD4GX` | number | non |
| Note | `fldZWoFPXSkjdDcDa` | long text | non |
| facture | `fldzR8pSVids63jO9` | pièces jointes | non |
| Travaux | `fld5Od89BxYsjaPAU` | lien → Travaux | ex-« Ventilation achat » |
| Total ventilé (€) | `flduFuGKzMpqdcWyF` | rollup (Travaux → Montant) | — |
| Reste à répartir (€) | `fldCrg2sWVyYwW2Hg` | formule | — (≠ 0 = facture pas encore entièrement utilisée / répartie) |
| Quantité utilisée | `fldxNDOWa8OQUtgYZ` | rollup (Travaux → Quantité, SUM) | — (ajouté le 24/11) |
| Quantité restante | `fldWK1y9fYzP18gGy` | formule | — (ajouté le 24/11) ; vide si pas de quantité |
| Statut campagne | `flddwBKrUOuRVRdt8` | lookup Campagne → Status | — (ajouté le 24/11) ; sert aux rollups Produit « campagne en cours » |

Reste à répartir (€) = Montant HT − Total ventilé − Hors culture − Stock fin de campagne.

Quantité restante = Quantité − Quantité utilisée − Stock fin (qté), arrondi à 3 décimales. Sert au FIFO : factures du produit de la campagne en cours avec Quantité restante > 0, la plus ancienne d'abord (« Report stock N-1 » en premier). Ne pas l'utiliser sur 24/25 : les lignes Travaux importées sont en € sans quantité, donc la quantité restante y est fausse alors que les factures sont entièrement réparties en €.

### Travaux (ex-« Ventilation achat ») `tblkauSao9eEp1bxH`

Une ligne = une utilisation / affectation de tout ou partie d'une facture (Achat) à une culture × récolte, en € et éventuellement en quantité.

| Champ | ID | Type | Obligatoire |
|---|---|---|---|
| N° | `fld2tKj8Vte8nG8JQ` | autonumber | — |
| Achat | `fldORrZiTuyagqCPF` | lien | ✔ |
| Culture × récolte | `fldlyFNtRgcIIHNpy` | lien → Synthèse | ✔ (écrit par l'app, pas d'automation) |
| Montant (€) | `fld7oXjUGnMbpYKVi` | currency | ✔ — source des rollups Synthèse / Achat |
| Mode | `fldRKc1yGu6yHzH1k` | select : Montant saisi / Prorata surfaces | ✔ à la saisie (vide sur 141 lignes importées 24/25 : tolérer) |
| Date | `fldtPQ0dcmk9bWwng` | date | non (vide sur les 455 lignes importées 24/25) |
| Quantité | `fldcKHq8ZJBucLEyg` | number (2 déc.) | non |
| Catégorie | `fldhIlMhVvqjZCa2t` | lookup Achat → Catégorie | — (famille : tableaux « par famille ») |
| Section | `fldUkMiKG4GKTjYkm` | lookup Achat → Section | — (Intrants / Report stock N-1 / Travaux agricoles / Charges diverses) |
| Unité | `fldEETC19QtLRgdAd` | lookup Achat → Unité | — |
| Prix unitaire (€) | `fldGKjDIH2rm6tjh3` | lookup Achat → Prix unitaire | — (affiché à 0 décimale, valeur stockée exacte) |

Règles serveur :

- Saisie en € ou en quantité. Si une quantité est saisie : Montant (€) = Quantité × Prix unitaire de la facture, calculé par l'app et écrit dans Montant (€) (pas de formule Airtable : les montants saisis à la main restent possibles).
- Σ Travaux + hors culture + stock fin = Montant HT (à ±0,01 €) au plus tard au 30/06. Une facture peut être utilisée en plusieurs fois au cours de la campagne ; Reste à répartir ≠ 0 en cours de campagne = produit pas encore utilisé.

### Produit `tblRzSrYpSMVBySyu`

| Champ | ID | Type | Obligatoire |
|---|---|---|---|
| Produit | `fldtlxUldEvNfzsZ6` | text | ✔ |
| Catégorie | `fldiL6RAXx6Y03Eg4` | select | ✔ |
| Unité | `fldjdo0wsdvKeMhxS` | select : kg / t / l / dose / u | ✔ |
| Dernier prix unitaire (€) | `fldsr18E1Hy2xUV5Q` | lookup (tableau, 0 ou 1 valeur) | — |
| Nb achats | `fldUnUjfX1Q9yQteW` | count | — |
| Total acheté campagne en cours (€) | `fldofrDSMr95tC9jb` | rollup (Achat → Montant HT, SUM) | — (ajouté le 24/11) ; seulement Section ≠ Report stock N-1 et Statut campagne = En cours |
| Quantité achetée campagne en cours | `fldfzRKDT6n2PXgMB` | rollup (Achat → Quantité, SUM) | — (ajouté le 24/11) ; mêmes conditions |

Ces deux rollups valent 0 pour un produit sans achat sur la campagne « En cours » (ex. en travaillant sur 24/25, « Terminé »). Si deux campagnes sont « En cours », les deux sont additionnées.

### Livraison `tblKl6amijKZRglvV`

| Champ | ID | Type | Obligatoire |
|---|---|---|---|
| ID Bon de livraison | `fldUZbvo15JPJWaCB` | text | ✔ |
| Culture | `fldpeYgUwveWpIHwu` | lien | ✔ |
| Campagne | `fldofwlTydD1BcP2T` | lien | ✔ |
| Synthèse | `fld3cDLSgNLkLFQkv` | lien | rempli par automation (ne pas écrire) |
| Date de livraison | `fldv7sAimW2XGyNiO` | date | ✔ |
| Poids net | `fldmbR5bJCu2OeUPQ` | number (kg) | ✔ (base de Synthèse.Livraison en T ; Tonnage n'est pas utilisé) |
| Poids net (t) | `fldaia0hymn7S1IVl` | formule : Poids net / 1000, arrondi 3 déc. | — (25/11) |
| Prix moyen (€/t) | `fldJ9vucSEIEGF5eF` | rollup (Synthèse → Prix moyen de vente en €/T) | — (25/11) ; non lu par l'app (sert à Valeur estimée) |
| Valeur estimée (€) | `fldTiCDycisJBQmxj` | formule : Poids net (t) × Prix moyen (€/t), arrondi 2 déc. | — (25/11) ; vide tant que la culture n'a pas de vente |
| Tonnage, H2O, PS, Calibre, Impureté, Proteine, … | (voir base) | number | non |
| Champ / Assolement | `fld6EiQHRQII21x1C` / `fld7VnjSuluC77ICK` | lien | non |

### Vente (contrats) `tblVTL5mesq0HcW7l`

| Champ | ID | Type | Obligatoire |
|---|---|---|---|
| Culture | `fldCduoFWLCEiTc0Q` | lien | ✔ |
| Campagne | `fldoRM3PzRv9fwAZB` | lien | ✔ |
| Synthèse | `fldFLQ2k0VwYJxp1j` | lien | rempli par automation (ne pas écrire) |
| Date | `fldqowG8olJlEAXNt` | date | ✔ |
| Quantité en tonne | `fldDXR2X2UCP0O57t` | number | ✔ |
| Prix par tonne | `fldLTJBCBn3pYeGGy` | currency | ✔ |
| Valeur | `fld5nryz70fWqVqTj` | formule | — |

### Autres recettes `tblzgEtwBP9FNGjXN`

| Champ | ID | Type | Obligatoire |
|---|---|---|---|
| Libellé | `fldjiVn97mhF52qCo` | text | ✔ |
| Type | `fldGpT6k4s8KmBfQv` | select | ✔ (DPB/primes PAC, indemnités grêle, paille/foin…) |
| Campagne | `fld5IUJse73wopK5d` | lien | ✔ |
| Culture × récolte | `fldF1En6rDLxdIFgc` | lien | ✔ (écrit par l'app, pas d'automation) |
| Montant (€) | `fldj0PsExLuAW5TvX` | currency | ✔ |
| Date | `fld5Vu0nEmp2Ri98z` | date | non (vide sur 8/10 lignes 24/25) |
| Note | `fld3MuIo6USJYldum` | long text | non |

### Parcellaire / Champs

Lecture seule pour l'instant. Champs : voir base.

## État de la donnée 24/25 (contrôlé le 19/11/2026)

- Aucun lien obligatoire vide dans Travaux, Vente, Livraison, Assolement 24/25.
- Achat : 6 lignes sans date (dont broyage de cailloux, assurance grêle, moissonnages, un bail) — ID Achat affiche « … – sans date ».
- Autres recettes : 8/10 sans date.
- Travaux : 455 lignes importées sans date ni quantité ; Mode vide sur 141 d'entre elles (toléré à la lecture, obligatoire à la saisie).
- Synthèse maïs 2025 : pas de livraison → rendement vide, stock −45,763 t.
- Formules corrigées le 19/11 pour ne plus renvoyer d'erreur : ID Achat, Prix moyen de vente en €/T (NaN jachère), Stock, Rendement, Valeur.
- Valeur de contrôle : Campagnes.Résultat exploitation (€) 24/25 = **8 204,01 €** (ventes au prix des contrats, après bonus TSA). L'ancienne référence 8 204,00 € avait 1 centime d'écart dû aux arrondis par culture.

## Champs / objets legacy (ignorés par l'app, à supprimer à la main quand possible)

Tri fait le 24/11/2026, complété le 25/11/2026 (colonnes par culture et champs « dernière vente » supprimés). Restent dans la base :

- Synthèse : Dernière date de vente.
- Livraison : Tonnage, Tonnage sec corrigé.
- Achat : Montant TTC.
- Formulaire Form new livraison : remplacé par l'app → à supprimer.
- Automations : seules restent les 3 « lien … synthèse » (voir plus haut).
