marked.setOptions({ breaks: true, gfm: true })

/* ─── Theme ─────────────────────────────────────────────────────────────────── */

const THEMES = ['dark', 'light']

function getTheme() {
  const param = new URLSearchParams(window.location.search).get('theme')
  return THEMES.includes(param) ? param : 'dark'
}

function loadTheme(theme) {
  document.getElementById('theme-css').href = `theme-${theme}.css`
}

function renderSwitcher(currentTheme) {
  if (document.getElementById('theme-switcher')) return
  const div = document.createElement('div')
  div.id = 'theme-switcher'
  div.innerHTML = THEMES.map(t => `
    <button data-theme="${t}" class="${t === currentTheme ? 'active' : ''}" onclick="switchTheme('${t}')">
      ${t[0].toUpperCase() + t.slice(1)}
    </button>
  `).join('')
  document.body.appendChild(div)
}

window.switchTheme = function (theme) {
  const url = new URL(window.location)
  url.searchParams.set('theme', theme)
  window.history.pushState({}, '', url)
  loadTheme(theme)
  document.querySelectorAll('#theme-switcher button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme)
  })
}

/* ─── CV ─────────────────────────────────────────────────────────────────────── */

async function loadContact() {
  try {
    const res = await fetch('contact.json')
    return res.ok ? await res.json() : {}
  } catch {
    return {}
  }
}

async function loadCV() {
  try {
    const [cvText, contact] = await Promise.all([
      fetch('cv.md').then(r => {
        if (!r.ok) throw new Error('Impossible de charger cv.md')
        return r.text()
      }),
      loadContact()
    ])

    const match = cvText.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)/)
    if (!match) throw new Error('Frontmatter introuvable dans cv.md')

    const data = { ...jsyaml.load(match[1]), ...contact }
    const body = match[2].trim()

    renderCV(data, body)
  } catch (e) {
    document.getElementById('cv').innerHTML = `<p class="cv-error">Erreur : ${e.message}</p>`
  }
}

function renderContact(data) {
  const items = [
    data.location ? `<li>${data.location}</li>` : '',
    data.phone ? `<li><a href="tel:${data.phone}">${data.phone}</a></li>` : '',
    data.email ? `<li><a href="mailto:${data.email}">${data.email}</a></li>` : '',
    data.linkedin ? `<li><a href="${data.linkedin}" target="_blank" rel="noopener">LinkedIn</a></li>` : '',
    data.github ? `<li><a href="${data.github}" target="_blank" rel="noopener">GitHub</a></li>` : '',
    data.website ? `<li><a href="${data.website}" target="_blank" rel="noopener">${data.website}</a></li>` : '',
  ]
  return `<ul class="contact-list">${items.join('')}</ul>`
}

function renderCompetences(competences) {
  return competences.map(cat => `
    <div class="skill-group">
      <h3>${cat.categorie}</h3>
      <ul>${cat.items.map(item => `<li>${item}</li>`).join('')}</ul>
    </div>
  `).join('')
}

function renderCV(data, body) {
  const photoHtml = data.photo
    ? `<img src="${data.photo}" alt="${data.name}" class="cv-photo">`
    : ''

  document.getElementById('cv').innerHTML = `
    <header class="cv-header">
      <div class="cv-header-name">
        <h1 class="cv-name">${data.name}</h1>
        <p class="cv-title">${data.title}</p>
      </div>
      ${photoHtml}
    </header>

    <div class="cv-columns">
      <aside class="cv-sidebar">
        <section class="cv-section">
          <h2>Contact</h2>
          ${renderContact(data)}
        </section>
        <section class="cv-section">
          <h2>Compétences</h2>
          ${renderCompetences(data.competences)}
        </section>
      </aside>

      <main class="cv-main">
        <section class="cv-section cv-profil">
          <h2>Profil</h2>
          <p>${data.profil}</p>
        </section>
        <div class="cv-body">
          ${marked.parse(body)}
        </div>
      </main>
    </div>
  `
}

/* ─── Init ───────────────────────────────────────────────────────────────────── */

const currentTheme = getTheme()
loadTheme(currentTheme)
renderSwitcher(currentTheme)
loadCV()
