#!/usr/bin/env node
/**
 * UX Flow Audit — navigates the full user journey capturing screenshots
 * and flagging UX issues: dead links, missing CTAs, broken navigation,
 * inconsistent layouts, confusing flows.
 *
 * Run: node scripts/test-ux-flow.mjs
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const BASE = 'http://localhost:3001'
const EMAIL = 'bedr10_capacitacion@hotmail.com'
const PASS = 'Gerlyn35 !'
const SHOTS = '/tmp/allyn-ux-audit'

mkdirSync(SHOTS, { recursive: true })

const issues = []
function issue(severity, area, msg) {
  const icon = severity === 'critical' ? '🔴' : severity === 'major' ? '🟡' : '🔵'
  console.log(`  ${icon} [${area}] ${msg}`)
  issues.push({ severity, area, msg })
}
function ok(msg) { console.log(`  ✅ ${msg}`) }
function section(title) { console.log(`\n\x1b[1m═══ ${title} ═══\x1b[0m`) }

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  // ═══════════════════════════════════════════════════════════════════
  // 1. LANDING — first impression (unauthenticated)
  // ═══════════════════════════════════════════════════════════════════
  section('1. LANDING (sin login)')
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: `${SHOTS}/01-landing.png`, fullPage: true })

  const landingText = await page.locator('body').innerText()

  // Is there a clear CTA for new users?
  const hasRegisterCTA = landingText.includes('Registr') || landingText.includes('Crear cuenta')
  const hasLoginCTA = landingText.includes('Entrar') || landingText.includes('Iniciar')
  if (hasRegisterCTA) ok('Landing: CTA de registro visible')
  else issue('critical', 'Landing', 'No hay CTA de registro para nuevos usuarios')
  if (hasLoginCTA) ok('Landing: CTA de login visible')
  else issue('major', 'Landing', 'No hay CTA de login visible')

  // Can users see content without logging in?
  const anonCards = await page.locator('a[href*="/read/"], a[href*="/content/"], a[href*="/watch/"]').count()
  if (anonCards > 0) ok(`Landing: ${anonCards} links de contenido visibles sin login`)
  else issue('major', 'Landing', 'No se ve contenido sin login — el usuario no sabe qué hay')

  // Is there a hero/featured content?
  const heroEl = await page.locator('section').first().boundingBox()
  if (heroEl && heroEl.height > 200) ok('Landing: hero section presente')
  else issue('minor', 'Landing', 'No hay hero section prominente')

  // Check if "Suscribirse" pricing is visible without scrolling
  const subscribeVisible = await page.locator('text=$499').isVisible().catch(() => false)
  if (subscribeVisible) ok('Landing: precio de suscripción visible above the fold')

  // ═══════════════════════════════════════════════════════════════════
  // 2. NAVIGATION — header links
  // ═══════════════════════════════════════════════════════════════════
  section('2. NAVIGATION')

  // Check nav links
  const navLinks = await page.locator('header a, header button').allTextContents()
  console.log('  Nav items:', navLinks.filter(l => l.trim()).join(' | '))

  // Click each category and verify it loads
  for (const cat of ['Salud', 'Dinero', 'Amor']) {
    const catLink = page.locator(`header a:text("${cat}")`).first()
    if (await catLink.count() > 0) {
      await catLink.click()
      await page.waitForTimeout(2000)
      const catUrl = page.url()
      if (catUrl.includes('/category/')) {
        ok(`Nav → ${cat}: navega correctamente a ${catUrl}`)
      } else {
        issue('major', 'Nav', `Click en "${cat}" no navega a categoría (URL: ${catUrl})`)
      }
      await page.screenshot({ path: `${SHOTS}/02-cat-${cat.toLowerCase()}.png`, fullPage: true })
    } else {
      issue('minor', 'Nav', `Link "${cat}" no visible en header (puede estar en mobile menu)`)
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 3. CATEGORY PAGE — content discovery
  // ═══════════════════════════════════════════════════════════════════
  section('3. CATEGORY PAGE')

  await page.goto(`${BASE}/category/amor`, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `${SHOTS}/03-category-amor.png`, fullPage: true })

  const catPageText = await page.locator('body').innerText()
  const catContentLinks = await page.locator('a[href*="/read/"], a[href*="/content/"]').count()

  if (catContentLinks > 0) ok(`Categoría Amor: ${catContentLinks} items de contenido`)
  else issue('critical', 'Categoría', 'Página de categoría vacía')

  // Is there a back navigation or breadcrumb?
  const hasBackNav = catPageText.includes('Inicio') || catPageText.includes('Volver') ||
    await page.locator('a[href="/"]').count() > 0
  if (hasBackNav) ok('Categoría: tiene navegación de vuelta')
  else issue('minor', 'Categoría', 'Sin breadcrumb o link "Volver al inicio"')

  // Category page has title/description?
  const catH1 = await page.locator('h1, h2').first().innerText().catch(() => '')
  if (catH1) ok(`Categoría: título visible "${catH1}"`)
  else issue('major', 'Categoría', 'Sin título de categoría')

  // ═══════════════════════════════════════════════════════════════════
  // 4. LOGIN FLOW
  // ═══════════════════════════════════════════════════════════════════
  section('4. LOGIN FLOW')

  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(2000)

  // Check login page structure
  const loginText = await page.locator('body').innerText()
  if (loginText.includes('Olvidaste') || loginText.includes('contraseña')) ok('Login: link "Olvidé contraseña" presente')
  else issue('major', 'Login', 'Sin link de recuperación de contraseña')

  if (loginText.includes('Regístr') || loginText.includes('cuenta')) ok('Login: link a registro presente')
  else issue('major', 'Login', 'Sin link a página de registro')

  // Login
  await page.locator('input[type="email"]').click()
  await page.locator('input[type="email"]').fill(EMAIL)
  await page.locator('input[type="password"]').click()
  await page.locator('input[type="password"]').fill(PASS)
  await page.locator('button[type="submit"]').click()
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(2000)

  const afterLoginUrl = page.url()
  if (!afterLoginUrl.includes('/login')) {
    ok(`Login: redirige a ${afterLoginUrl}`)
    // Does it redirect to a sensible place?
    if (afterLoginUrl === `${BASE}/` || afterLoginUrl.includes('/profile')) {
      ok('Login: redirige al homepage (correcto)')
    } else {
      issue('minor', 'Login', `Redirige a ${afterLoginUrl} en vez de homepage`)
    }
  } else {
    issue('critical', 'Login', 'Login falló')
    await browser.close()
    process.exit(1)
  }

  // ═══════════════════════════════════════════════════════════════════
  // 5. HOMEPAGE (authenticated) — content hierarchy
  // ═══════════════════════════════════════════════════════════════════
  section('5. HOMEPAGE (autenticado)')
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: `${SHOTS}/05-home-authed.png`, fullPage: true })

  const homeText = await page.locator('body').innerText()

  // Welcome section
  if (homeText.includes('Hola')) ok('Home: saludo personalizado')
  else issue('major', 'Home', 'Sin saludo personalizado')

  // Content sections order — are they logically organized?
  const sectionTitles = await page.locator('h2').allTextContents()
  console.log('  Secciones en homepage:', sectionTitles.join(' → '))

  if (sectionTitles.length >= 3) ok(`Home: ${sectionTitles.length} secciones de contenido`)
  else issue('major', 'Home', `Solo ${sectionTitles.length} secciones — parece vacío`)

  // Check for empty carousels
  const carousels = await page.locator('section').all()
  let emptyCarousels = 0
  for (const carousel of carousels) {
    const cardCount = await carousel.locator('a[href*="/read/"], a[href*="/watch/"], a[href*="/content/"]').count()
    const title = await carousel.locator('h2').first().innerText().catch(() => '')
    if (title && cardCount === 0) {
      emptyCarousels++
      issue('major', 'Home', `Carousel "${title}" está vacío`)
    }
  }
  if (emptyCarousels === 0) ok('Home: sin carousels vacíos')

  // ═══════════════════════════════════════════════════════════════════
  // 6. CONTENT CARD → DETAIL → READER flow
  // ═══════════════════════════════════════════════════════════════════
  section('6. CARD → DETAIL → READER flow')

  // Click on a book card
  const bookCard = page.locator('a[href*="/read/"]').first()
  if (await bookCard.count() > 0) {
    const bookHref = await bookCard.getAttribute('href')

    // Test 1: Card goes directly to reader (is this good UX?)
    ok(`Card link va a ${bookHref}`)

    // Check if there's ALSO a detail link
    const detailLink = page.locator(`a[href*="/content/${bookHref.split('/read/')[1]}"]`).first()
    const hasDetailLink = await detailLink.count() > 0
    if (hasDetailLink) ok('Card tiene botón de detalle separado')

    // Navigate to the reader
    await page.goto(`${BASE}${bookHref}`, { waitUntil: 'networkidle', timeout: 25000 })
    await page.waitForTimeout(4000)
    await page.screenshot({ path: `${SHOTS}/06-reader.png`, fullPage: true })

    const readerText = await page.locator('body').innerText()

    // Does the reader have back navigation?
    const hasBack = await page.locator('a[href*="/category/"], a[href="/"]').count()
    if (hasBack > 0) ok('Reader: tiene botón de volver')
    else issue('major', 'Reader', 'Sin navegación de vuelta — usuario atrapado')

    // Is the book title visible?
    const readerH1 = await page.locator('h1').first().innerText().catch(() => '')
    if (readerH1) ok(`Reader: título visible "${readerH1}"`)
    else issue('major', 'Reader', 'Sin título del libro')

    // Does the PDF load?
    const iframeCount = await page.locator('iframe').count()
    if (iframeCount > 0) ok('Reader: iframe PDF presente')
    else issue('critical', 'Reader', 'No se carga el PDF')

    // Sidebar present?
    const sidebarPresent = readerText.includes('Experiencia') || readerText.includes('Escuchar')
    if (sidebarPresent) ok('Reader: sidebar con info')
    else issue('minor', 'Reader', 'Sin sidebar informativo')
  }

  // ═══════════════════════════════════════════════════════════════════
  // 7. CONTENT DETAIL PAGE
  // ═══════════════════════════════════════════════════════════════════
  section('7. CONTENT DETAIL PAGE')

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(2000)

  const detailLink = page.locator('a[href*="/content/"]').first()
  if (await detailLink.count() > 0) {
    const detailHref = await detailLink.getAttribute('href')
    await page.goto(`${BASE}${detailHref}`, { waitUntil: 'networkidle', timeout: 25000 })
    await page.waitForTimeout(3000)
    await page.screenshot({ path: `${SHOTS}/07-detail.png`, fullPage: true })

    const detailText = await page.locator('body').innerText()

    // Primary CTA present and clear?
    const primaryBtn = await page.locator('section a[href*="/read/"], section a[href*="/watch/"]').count()
    if (primaryBtn > 0) ok('Detail: CTA primario presente')
    else issue('critical', 'Detail', 'Sin CTA primario (Leer/Ver)')

    // "Mi Lista" button — does it work?
    const miListaBtn = page.locator('button:has-text("Mi Lista")')
    if (await miListaBtn.count() > 0) {
      // Check if it actually does something
      await miListaBtn.first().click()
      await page.waitForTimeout(500)
      // If nothing happened (no toast, no state change), it's a dead button
      const toastVisible = await page.locator('[data-sonner-toast]').count()
      const btnChanged = await miListaBtn.first().innerText()
      if (toastVisible === 0 && btnChanged === 'Mi Lista') {
        issue('major', 'Detail', 'Botón "Mi Lista" no hace nada — dead button')
      } else {
        ok('Detail: botón "Mi Lista" funciona')
      }
    }

    // "Compartir" button — does it work?
    const compartirBtn = page.locator('button:has-text("Compartir")')
    if (await compartirBtn.count() > 0) {
      await compartirBtn.first().click()
      await page.waitForTimeout(500)
      const toastAfterShare = await page.locator('[data-sonner-toast]').count()
      if (toastAfterShare === 0) {
        issue('major', 'Detail', 'Botón "Compartir" no hace nada — dead button')
      } else {
        ok('Detail: botón "Compartir" funciona')
      }
    }

    // Related content present?
    if (detailText.includes('relacionado') || detailText.includes('Relacionado')) {
      ok('Detail: sección de contenido relacionado')
    } else {
      issue('minor', 'Detail', 'Sin sección de contenido relacionado')
    }

    // Metadata present?
    const hasMeta = detailText.includes('Formato') || detailText.includes('Acceso') || detailText.includes('Autor')
    if (hasMeta) ok('Detail: metadata visible')
    else issue('minor', 'Detail', 'Sin metadata (formato, autor, etc.)')
  }

  // ═══════════════════════════════════════════════════════════════════
  // 8. VIDEO FLOW
  // ═══════════════════════════════════════════════════════════════════
  section('8. VIDEO FLOW')

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(2000)

  const videoLink = page.locator('a[href*="/watch/"]').first()
  if (await videoLink.count() > 0) {
    const videoHref = await videoLink.getAttribute('href')
    await page.goto(`${BASE}${videoHref}`, { waitUntil: 'networkidle', timeout: 25000 })
    await page.waitForTimeout(5000)
    await page.screenshot({ path: `${SHOTS}/08-video.png`, fullPage: true })

    const watchText = await page.locator('body').innerText()

    // Video loads?
    const videoEl = await page.locator('video').count()
    if (videoEl > 0) ok('Video: elemento <video> presente')
    else issue('critical', 'Video', 'No se carga el video')

    // Back navigation
    const videoBack = await page.locator('a[href*="/content/"]').count()
    if (videoBack > 0) ok('Video: tiene botón de volver')
    else issue('major', 'Video', 'Sin navegación de vuelta')

    // Video metadata below player
    if (watchText.includes(await page.locator('h1').first().innerText().catch(() => '???'))) {
      ok('Video: título visible debajo del player')
    }
  } else {
    issue('minor', 'Video', 'No hay videos para probar')
  }

  // ═══════════════════════════════════════════════════════════════════
  // 9. PROFILE PAGE
  // ═══════════════════════════════════════════════════════════════════
  section('9. PROFILE PAGE')

  await page.goto(`${BASE}/profile`, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: `${SHOTS}/09-profile.png`, fullPage: true })

  const profileText = await page.locator('body').innerText()

  // Key profile info
  if (profileText.includes('@') || profileText.includes('email')) ok('Profile: email visible')
  else issue('major', 'Profile', 'Email no visible')

  if (profileText.includes('Suscri') || profileText.includes('Miembro') || profileText.includes('activa')) ok('Profile: estado de suscripción visible')
  else issue('major', 'Profile', 'Estado de suscripción no visible')

  // Navigation from profile
  const profileLinks = await page.locator('a').allTextContents()
  const hasHomeLink = profileLinks.some(l => l.includes('Inicio') || l.includes('ALLYN'))
  if (hasHomeLink) ok('Profile: tiene link para volver')
  else issue('minor', 'Profile', 'Sin link claro para volver al contenido')

  // ═══════════════════════════════════════════════════════════════════
  // 10. SUBSCRIBE PAGE
  // ═══════════════════════════════════════════════════════════════════
  section('10. SUBSCRIBE PAGE')

  await page.goto(`${BASE}/subscribe`, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `${SHOTS}/10-subscribe.png`, fullPage: true })

  const subText = await page.locator('body').innerText()

  if (subText.includes('499')) ok('Subscribe: precio visible')
  else issue('critical', 'Subscribe', 'Precio no visible')

  if (subText.includes('99') && subText.includes('año')) ok('Subscribe: precio de renovación visible')
  else issue('major', 'Subscribe', 'No se muestra precio de renovación')

  // Features list
  const featuresList = subText.includes('libro') || subText.includes('video') || subText.includes('audio')
  if (featuresList) ok('Subscribe: features/beneficios listados')
  else issue('major', 'Subscribe', 'Sin lista de beneficios')

  // ═══════════════════════════════════════════════════════════════════
  // 11. FOOTER — links work?
  // ═══════════════════════════════════════════════════════════════════
  section('11. FOOTER')

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(2000)

  // Scroll to footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${SHOTS}/11-footer.png`, fullPage: false })

  const footerLinks = await page.locator('footer a').all()
  for (const link of footerLinks) {
    const href = await link.getAttribute('href')
    const text = await link.innerText()
    if (href && !href.startsWith('mailto:') && !href.startsWith('http')) {
      const res = await page.request.fetch(`${BASE}${href}`, { failOnStatusCode: false })
      if (res.status() === 404) {
        issue('major', 'Footer', `Link "${text}" → ${href} retorna 404`)
      }
    }
  }
  ok('Footer: links verificados')

  // ═══════════════════════════════════════════════════════════════════
  // 12. MOBILE UX
  // ═══════════════════════════════════════════════════════════════════
  section('12. MOBILE (390x844)')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `${SHOTS}/12-mobile-home.png`, fullPage: true })

  // Mobile menu accessible?
  const hamburger = page.locator('button[aria-label*="menú"], button[aria-label*="menu"]')
  if (await hamburger.count() > 0) {
    await hamburger.first().click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${SHOTS}/12b-mobile-menu.png` })
    ok('Mobile: menú hamburger funciona')

    // Check mobile menu has nav links
    const mobileNavLinks = await page.locator('nav a').allTextContents()
    if (mobileNavLinks.length >= 3) ok(`Mobile menu: ${mobileNavLinks.length} links`)
    else issue('major', 'Mobile', 'Menú mobile con pocos links')

    // Close menu
    const closeBtn = page.locator('button[aria-label*="Cerrar"]')
    if (await closeBtn.count() > 0) await closeBtn.first().click()
  } else {
    issue('critical', 'Mobile', 'Sin botón de menú hamburger')
  }

  // Mobile content cards — scrollable?
  const mobileCards = await page.locator('a[href*="/read/"], a[href*="/content/"]').count()
  if (mobileCards > 0) ok(`Mobile: ${mobileCards} cards visibles`)
  else issue('major', 'Mobile', 'Sin cards de contenido visibles')

  // Mobile book reader
  const mobileBookLink = page.locator('a[href*="/read/"]').first()
  if (await mobileBookLink.count() > 0) {
    const mbHref = await mobileBookLink.getAttribute('href')
    await page.goto(`${BASE}${mbHref}`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(3000)
    await page.screenshot({ path: `${SHOTS}/12c-mobile-reader.png`, fullPage: true })

    const mobileIframe = await page.locator('iframe').count()
    if (mobileIframe > 0) ok('Mobile reader: PDF carga')
    else issue('major', 'Mobile', 'PDF no carga en mobile')
  }

  // ═══════════════════════════════════════════════════════════════════
  // 13. DEAD-END CHECK — pages without clear next action
  // ═══════════════════════════════════════════════════════════════════
  section('13. DEAD-END CHECK')

  await page.setViewportSize({ width: 1440, height: 900 })

  // Check /terms page
  await page.goto(`${BASE}/terms`, { waitUntil: 'networkidle', timeout: 10000 })
  const termsStatus = page.url().includes('/terms') ? 'loads' : 'redirects'
  const termsText = await page.locator('body').innerText()
  if (termsText.length > 100) ok('Terms: página con contenido')
  else issue('major', 'Terms', 'Página de términos vacía o placeholder')

  // Check /privacy page
  await page.goto(`${BASE}/privacy`, { waitUntil: 'networkidle', timeout: 10000 })
  const privacyText = await page.locator('body').innerText()
  if (privacyText.length > 100) ok('Privacy: página con contenido')
  else issue('major', 'Privacy', 'Página de privacidad vacía o placeholder')

  // Check /forgot-password
  await page.goto(`${BASE}/forgot-password`, { waitUntil: 'networkidle', timeout: 10000 })
  await page.screenshot({ path: `${SHOTS}/13-forgot-password.png` })
  const fpText = await page.locator('body').innerText()
  if (fpText.includes('correo') || fpText.includes('email') || fpText.includes('contraseña')) {
    ok('Forgot password: formulario presente')
  } else {
    issue('major', 'Forgot password', 'Página sin formulario de recuperación')
  }

  // ═══════════════════════════════════════════════════════════════════
  // RESUMEN
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(60))
  console.log('\x1b[1mRESUMEN — AUDITORÍA UX\x1b[0m')
  console.log('═'.repeat(60))

  const critical = issues.filter(i => i.severity === 'critical')
  const major = issues.filter(i => i.severity === 'major')
  const minor = issues.filter(i => i.severity === 'minor')

  if (critical.length > 0) {
    console.log(`\n🔴 CRÍTICOS: ${critical.length}`)
    critical.forEach(i => console.log(`   • [${i.area}] ${i.msg}`))
  }

  if (major.length > 0) {
    console.log(`\n🟡 IMPORTANTES: ${major.length}`)
    major.forEach(i => console.log(`   • [${i.area}] ${i.msg}`))
  }

  if (minor.length > 0) {
    console.log(`\n🔵 MENORES: ${minor.length}`)
    minor.forEach(i => console.log(`   • [${i.area}] ${i.msg}`))
  }

  const totalOk = issues.length === 0 ? 'perfecto' : ''
  console.log(`\n📊 Total: ${issues.length} issues encontrados`)
  console.log(`📸 Screenshots: ${SHOTS}`)
  console.log()

  await browser.close()
  process.exit(critical.length > 0 ? 1 : 0)
})()
