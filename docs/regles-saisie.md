# Règles de saisie : livraisons, ventes, achats, travaux

Décidées le 21/11/2026. Maquettes : `docs/mockups/` (écrans 2a Nouvelle livraison, 3a Nouvelle vente, 4a Nouvel achat, 5a Nouveau travail).

## Principe
- **Achat** = la facture (ce qu'on a acheté).
- **Travail** (table `Travaux`, ex-« Ventilation achat ») = l'affectation de tout ou partie d'une facture à une culture × récolte, en € et éventuellement en quantité.
- Pas de liste d'attente « factures à répartir » dans l'app. Une correction exceptionnelle se fait directement dans la base.

## Formulaires : conventions
- Date préremplie avec la date du jour, modifiable ; la campagne en découle (01/07 → 30/06) et s'affiche sous la date.
- Les autres champs sont vides. Un exemple en gris clair (placeholder « ex. … ») seulement sur les champs texte où il aide (fournisseur/libellé, produit) ; aucun exemple sur les champs numériques. Les listes déroulantes commencent vides (« — Choisir — »).
- Livraison : champ(s) d'origine facultatif(s), boutons à sélection multiple parmi les champs de la culture pour la campagne (lien multiple `Livraison.Champ`) ; rien de sélectionné = non renseigné.
- Vente : date, culture, quantité (t), prix (€/t), montant calculé affiché. Les résultats se calculent sur les prix des contrats : pas de saisie du « montant réellement encaissé » pour l'instant (formulaire « J'ai reçu un paiement » hors scope).

## Nouvel achat : 3 types (gros boutons)
| Type | Exemples | Répartition |
|---|---|---|
| Un produit | engrais, semences, phytos | Par défaut, va **en stock** (rien n'est réparti). Raccourci « Déjà utilisé » : on coche les cultures → lignes Travaux créées au prorata des surfaces cochées. |
| Des travaux (entreprise) | moisson, travail du sol | **Toujours répartis à la saisie** : cases à cocher par culture, montant au prorata des surfaces cochées. |
| Une charge | MSA, bail, assurance, téléphone | **Automatique** sur toutes les cultures, prorata surface PAC jachère comprise. Bouton « Modifier la répartition » qui ouvre les cases à cocher. Un seul écran. |

- Bases de prorata : intrants **hors jachère**, charges diverses **jachère comprise** (surface PAC de l'assolement de la campagne). Choisie par l'app selon la famille, sans rien demander.
- Arrondi au centime par ligne, le reste sur la dernière culture (le total de la facture reste exact).
- Champ facultatif « Hors culture (€) » conservé (ex. bonus TSA) : niveau exploitation, pas réparti.
- Champs de la facture : date, fournisseur/libellé, produit (recherche catalogue ; nouveau produit créé côté serveur) + quantité, ou famille si pas de produit, montant HT, montant TTC (facultatif), photo/PDF (facultatif).

## Nouveau travail = toujours un produit du stock, toujours en quantité
- Date, quantité utilisée (dans l'unité du produit), produit (liste des produits en stock avec quantité disponible).
- Cultures à cocher. Répartition **modifiable** : en **%** (préremplie au prorata des surfaces cochées, ex. 67 % / 33 %) ou en **quantité** (ex. 1 000 kg / 500 kg). Le montant en € de chaque culture se calcule en direct ; un contrôle indique si le total fait 100 % (ou la quantité saisie).
- L'app choisit seule la facture : **la plus ancienne facture de ce produit qui a encore du reste** (FIFO ; le report de stock N-1 part en premier).
- `Quantité` de chaque ligne Travaux = part de la culture ; `Montant (€)` = Quantité × Prix unitaire de la facture (calculé par l'app ; `Montant (€)` reste la source des rollups).

## Fin de campagne (30/06)
Ce qui reste non affecté sur les factures de produits = stock de fin de campagne, reporté sur la campagne suivante (lignes « Report stock N-1 »). Pas d'écran de saisie du stock prévu pour l'instant.

Au 30/06, toutes les factures doivent être entièrement réparties (`Reste à répartir (€)` = 0), sinon le résultat par culture est faux.
