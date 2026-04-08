# whoami

CV en ligne de Radouane Baudelot — [radouane.pages.dev](https://radouane.pages.dev) *(à mettre à jour une fois déployé)*

## Stack

Aucune dépendance, aucun build. Site statique pur.

| Fichier | Rôle |
|---|---|
| `cv.md` | Source de vérité — Frontmatter YAML + corps Markdown |
| `index.html` | Coquille HTML, charge les librairies CDN |
| `main.js` | Fetch `cv.md`, parse le frontmatter, injecte le HTML |
| `style.css` | Layout structurel (grille, espacement) |
| `theme-dark.css` | Thème GitHub Dark Dimmed |
| `theme-light.css` | Thème GitHub Light |
| `print.css` | Styles d'impression / export PDF |

Librairies CDN (pas de `node_modules`) :
- [marked](https://marked.js.org/) — rendu Markdown → HTML
- [js-yaml](https://github.com/nodeca/js-yaml) — parsing du frontmatter YAML
- [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) — police monospace

## Utilisation

### Voir le CV en local

```bash
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

### Changer de thème

- `http://localhost:8080` → thème Dark (défaut)
- `http://localhost:8080?theme=light` → thème Light

Le bouton **Dark / Light** en haut à gauche permet de switcher sans recharger la page.

### Exporter en PDF

1. Cliquer sur **Télécharger en PDF** (haut à droite)
2. Dans la boîte de dialogue d'impression Chrome : **Plus de paramètres → décocher "En-têtes et pieds de page"**
3. Choisir **Enregistrer en PDF**

## Modifier le contenu

Tout le contenu est dans `cv.md`. Le fichier est divisé en deux parties :

```
---
# Frontmatter YAML : données structurées
name: ...
competences:
  - categorie: ...
    items: [...]
---

## Corps Markdown : expériences et formations
```

Le YAML est lisible par des scripts externes (PHP, Python, etc.).
Le Markdown est directement utilisable comme contexte pour un LLM.

## Accès programmatique

Le fichier `cv.md` est accessible publiquement une fois déployé :

```
GET https://ton-domaine/cv.md
```

Exemple PHP :

```php
$raw  = file_get_contents('https://ton-domaine/cv.md');
preg_match('/^---\n(.*?)\n---\n(.*)/s', $raw, $m);
$data = yaml_parse($m[1]); // données structurées
$body = $m[2];              // corps markdown
```

Exemple Python (Mistral) :

```python
import httpx, re, yaml

raw = httpx.get("https://ton-domaine/cv.md").text
fm  = re.match(r"^---\n(.*?)\n---\n(.*)", raw, re.DOTALL)
data = yaml.safe_load(fm.group(1))
body = fm.group(2)

# Envoyer body comme contexte à Mistral
```

## Données sensibles

Email et téléphone ne sont **jamais commités**. Ils vivent dans `contact.json` (gitignorné).

```bash
# En local : copier l'exemple et renseigner ses vraies valeurs
cp contact.example.json contact.json
```

`main.js` fusionne automatiquement `contact.json` avec `cv.md` au chargement.
Si le fichier est absent (ex: repo cloné sans le fichier), le CV s'affiche sans ces champs — sans erreur.

Pour Cloudflare Pages, les valeurs sont injectées via variables d'environnement au build (voir section Déploiement).

## Déploiement

Hébergé sur **Cloudflare Pages** (free tier), déploiement automatique à chaque push sur `main`.

### Configuration initiale

1. Créer un repo GitHub et pousser ce projet
2. Dans Cloudflare Pages : **Create a project → Connect to Git → sélectionner le repo**
3. Paramètres de build :
   - **Build command** : `echo '{"email":"'$EMAIL'","phone":"'$PHONE'"}' > contact.json`
   - **Build output directory** : `/` (laisser vide ou mettre `/`)
4. Ajouter les variables d'environnement :
   - `EMAIL` → `nom@domaine.com`
   - `PHONE` → `06 XX XX XX XX`
5. Déployer — l'URL sera `https://[projet].pages.dev`
