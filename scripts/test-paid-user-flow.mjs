#!/usr/bin/env node
/**
 * Playwright paid-user flow test
 * Tests the complete experience for a subscribed user (admin):
 *   Login -> Homepage -> Books -> PDF Reader -> Videos -> Content Detail
 *
 * Run: node scripts/test-paid-user-flow.mjs
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const BASE = 'http://localhost:3001'
const EMAIL = 'bedr10_capacitacion@hotmail.com'
const PASS = 'Gerlyn35 !'
const SHOTS = '/tmp/allyn-paid-user-audit'

mkdirSync(SHOTS, { recursive: true })

const results = { pass: [], fail: [], warn: [] }
function pass(msg) { console.log(`  \x1b[32m✓\x1b[0m ${msg}`); results.pass.push(msg) }
function fail(msg) { console.log(`  \x1b[31m✗\x1b[0m ${msg}`); results.fail.push(msg) }
function warn(msg) { console.log(`  \x1b[33m⚠\x1b[0m ${msg}`); results.warn.push(msg) }
function section(title) { console.log(`\n\x1b[1m═══ ${title} ═══\x1b[0m`) }

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  // ═══════════════════════════════════════════════════════════════════
  // 1. LOGIN como usuario pago (admin)
  // ═══════════════════════════════════════════════════════════════════
  section('1. LOGIN (usuario pago/admin)')
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `${SHOTS}/01-login.png`, fullPage: true })

  const emailInput = page.locator('input[type="email"]')
  const passInput = page.locator('input[type="password"]')

  if (await emailInput.count() === 0) {
    fail('No se encontro campo de email en /login')
    await browser.close()
    process.exit(1)
  }

  await emailInput.click()
  await emailInput.fill(EMAIL)
  await passInput.click()
  await passInput.fill(PASS)
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${SHOTS}/02-login-filled.png` })

  await page.locator('button[type="submit"]').click()
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `${SHOTS}/03-after-login.png`, fullPage: true })

  const loginUrl = page.url()
  if (loginUrl.includes('/login')) {
    // Check for error message
    const bodyText = await page.locator('body').innerText()
    const errorMatch = bodyText.match(/error|incorrecto|invalid|no confirmado/i)
    fail(`Login fallo — sigue en /login${errorMatch ? `: "${errorMatch[0]}"` : ''}`)
    await browser.close()
    process.exit(1)
  }
  pass(`Login exitoso → ${loginUrl}`)

  // ═══════════════════════════════════════════════════════════════════
  // 2. HOMEPAGE — verificar experiencia de usuario pago
  // ═══════════════════════════════════════════════════════════════════
  section('2. HOMEPAGE (usuario pago)')
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: `${SHOTS}/04-home-paid.png`, fullPage: true })

  const homeText = await page.locator('body').innerText()

  // 2a. Welcome section muestra "Miembro Activo"
  if (homeText.includes('Miembro Activo')) pass('Welcome: muestra "Miembro Activo"')
  else if (homeText.includes('Modo Preview')) fail('Welcome: muestra "Modo Preview" en vez de "Miembro Activo"')
  else warn('Welcome: no se encontro indicador de estado de membresia')

  // 2b. No debe mostrar CTA de suscripcion
  if (homeText.includes('Activar Acceso Completo')) fail('CTA "Activar Acceso Completo" visible para usuario pago')
  else pass('No se muestra CTA de suscripcion innecesario')

  // 2c. Header no muestra precio
  const headerText = await page.locator('header').innerText().catch(() => '')
  if (headerText.includes('$499')) fail('Header muestra "$499" a usuario pago')
  else pass('Header: no muestra precio de suscripcion')

  // 2d. Header muestra "Miembro"
  if (headerText.includes('Miembro')) pass('Header: muestra badge "Miembro"')
  else warn('Header: no muestra badge "Miembro"')

  // 2e. Carousels de contenido presentes
  const carouselSections = await page.locator('section').count()
  if (carouselSections >= 3) pass(`${carouselSections} secciones de contenido en homepage`)
  else warn(`Solo ${carouselSections} secciones en homepage`)

  // 2f. Videos exclusivos para miembros visibles
  if (homeText.includes('Videos') || homeText.includes('exclusivas para miembros')) {
    pass('Carousel de videos exclusivos visible para usuario pago')
  } else {
    warn('Carousel de videos exclusivos no encontrado (puede no haber videos pagos)')
  }

  // 2g. No hay candados en las cards
  const lockIcons = await page.locator('[class*="lock"], svg[class*="Lock"]').count()
  // Some lock icons might exist in unrelated UI, so only flag if many
  if (lockIcons > 2) warn(`${lockIcons} iconos de candado visibles en homepage`)
  else pass('Sin candados excesivos en homepage')

  // ═══════════════════════════════════════════════════════════════════
  // 3. LIBROS PDF — verificar que se ven los 6 libros
  // ═══════════════════════════════════════════════════════════════════
  section('3. LIBROS PDF')

  // Count book cards (links to /read/)
  const bookLinks = await page.locator('a[href*="/read/"]').count()
  const contentLinks = await page.locator('a[href*="/content/"]').count()

  if (bookLinks >= 6) pass(`${bookLinks} links a libros (/read/) encontrados`)
  else if (bookLinks > 0) warn(`Solo ${bookLinks} links a libros (se esperan 6)`)
  else fail('No se encontraron links a libros (/read/)')

  pass(`${contentLinks} links a paginas de detalle (/content/)`)

  // Scroll to capture full page
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${SHOTS}/05-home-scrolled.png`, fullPage: true })

  // ═══════════════════════════════════════════════════════════════════
  // 4. ABRIR UN LIBRO — PDF Reader
  // ═══════════════════════════════════════════════════════════════════
  section('4. PDF READER')

  const firstBookLink = page.locator('a[href*="/read/"]').first()
  if (await firstBookLink.count() > 0) {
    const bookHref = await firstBookLink.getAttribute('href')
    await page.goto(`${BASE}${bookHref}`, { waitUntil: 'networkidle', timeout: 25000 })
    await page.waitForTimeout(4000)
    await page.screenshot({ path: `${SHOTS}/06-book-reader.png`, fullPage: true })

    const readerUrl = page.url()
    if (readerUrl.includes('/read/')) pass(`Navegacion a reader: ${readerUrl}`)
    else fail(`No se abrio el reader — URL: ${readerUrl}`)

    // 4a. PDF iframe presente
    const iframe = page.locator('iframe')
    if (await iframe.count() > 0) pass('iframe del PDF presente')
    else fail('No hay iframe del PDF')

    // 4b. Verificar que el PDF proxy responde OK
    const pdfRes = await page.request.fetch(`${BASE}/api/content/${bookHref.split('/read/')[1]}/pdf`, {
      failOnStatusCode: false,
    })
    if (pdfRes.status() === 200) {
      const contentType = pdfRes.headers()['content-type'] || ''
      if (contentType.includes('pdf')) pass('API /pdf retorna PDF correctamente (200, application/pdf)')
      else warn(`API /pdf retorna 200 pero content-type: ${contentType}`)
    } else {
      fail(`API /pdf retorna ${pdfRes.status()}`)
    }

    // 4c. Audio section
    const readerText = await page.locator('body').innerText()
    if (readerText.includes('Escuchar completo') || readerText.includes('Audio')) {
      pass('Seccion de audio presente en reader')
    } else {
      warn('Seccion de audio no encontrada')
    }

    // 4d. Boton "Abrir aparte" (solo suscriptores)
    if (readerText.includes('Abrir aparte')) pass('Boton "Abrir aparte" visible (feature de suscriptor)')
    else warn('Boton "Abrir aparte" no encontrado')

    // 4e. Titulo del libro visible
    const h1Text = await page.locator('h1').first().innerText().catch(() => '')
    if (h1Text.length > 2) pass(`Titulo del libro: "${h1Text}"`)
    else warn('Titulo del libro no visible')
  } else {
    fail('No hay libros para probar el reader')
  }

  // ═══════════════════════════════════════════════════════════════════
  // 5. CONTENT DETAIL PAGE (de un libro)
  // ═══════════════════════════════════════════════════════════════════
  section('5. CONTENT DETAIL PAGE')

  const firstContentLink = page.locator('a[href*="/content/"]').first()
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(2000)

  if (await page.locator('a[href*="/content/"]').count() > 0) {
    const contentHref = await page.locator('a[href*="/content/"]').first().getAttribute('href')
    await page.goto(`${BASE}${contentHref}`, { waitUntil: 'networkidle', timeout: 25000 })
    await page.waitForTimeout(3000)
    await page.screenshot({ path: `${SHOTS}/07-content-detail.png`, fullPage: true })

    const detailText = await page.locator('body').innerText()

    // 5a. Muestra "Acceso completo"
    if (detailText.includes('Acceso completo') || detailText.includes('Lectura completa') || detailText.includes('Escucha completa')) {
      pass('Content detail: muestra label de acceso completo')
    } else if (detailText.includes('Solo miembros')) {
      fail('Content detail: muestra "Solo miembros" a usuario pago')
    } else {
      warn('Content detail: label de acceso no encontrado')
    }

    // 5b. Boton primario NO dice "Suscribirse"
    const primaryBtn = page.locator('a[href*="/subscribe"] button, a[href="/subscribe"]')
    const subscribeBtns = await primaryBtn.count()
    if (subscribeBtns > 0) {
      const btnText = await primaryBtn.first().innerText().catch(() => '')
      if (btnText.includes('Suscrib') || btnText.includes('Ver planes')) {
        fail(`Content detail: boton de suscripcion visible ("${btnText}")`)
      }
    } else {
      pass('Content detail: sin boton de suscripcion')
    }

    // 5c. No muestra bloque "Contenido exclusivo para miembros"
    if (detailText.includes('Contenido exclusivo para miembros')) {
      fail('Content detail: bloque de paywall visible para usuario pago')
    } else {
      pass('Content detail: sin paywall visible')
    }

    // 5d. Boton primario funcional
    const primaryAction = await page.locator('section a[href*="/read/"], section a[href*="/watch/"]').count()
    if (primaryAction > 0) pass('Boton primario lleva a /read/ o /watch/')
    else warn('No se encontro boton primario que lleve a contenido')
  } else {
    warn('No hay links de contenido para probar detalle')
  }

  // ═══════════════════════════════════════════════════════════════════
  // 6. VIDEO PLAYER — usuario pago
  // ═══════════════════════════════════════════════════════════════════
  section('6. VIDEO PLAYER')

  // Find a video or course content via API
  const videosRes = await page.request.fetch(`${BASE}/api/content`, { failOnStatusCode: false })
  let videoId = null

  // Try to find video links on the page
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(2000)
  const watchLinks = await page.locator('a[href*="/watch/"]').all()

  if (watchLinks.length > 0) {
    const watchHref = await watchLinks[0].getAttribute('href')
    videoId = watchHref.split('/watch/')[1]
    pass(`${watchLinks.length} links a videos (/watch/) en homepage`)

    // Navigate to video
    await page.goto(`${BASE}${watchHref}`, { waitUntil: 'networkidle', timeout: 25000 })
    await page.waitForTimeout(5000)
    await page.screenshot({ path: `${SHOTS}/08-video-player.png`, fullPage: true })

    const watchUrl = page.url()
    if (watchUrl.includes('/watch/')) pass(`Navegacion a video: ${watchUrl}`)
    else fail(`No se abrio el player — URL: ${watchUrl}`)

    const videoText = await page.locator('body').innerText()

    // 6a. Video element presente
    const videoEl = page.locator('video')
    if (await videoEl.count() > 0) {
      pass('Elemento <video> presente')

      // Check if video has source
      const videoSrc = await videoEl.first().getAttribute('src').catch(() => '')
      const sourceSrc = await page.locator('video source').first().getAttribute('src').catch(() => '')
      if (videoSrc || sourceSrc) pass('Video tiene source URL cargada')
      else warn('Video sin source URL visible')
    } else {
      // Might show lock overlay if stream failed
      if (videoText.includes('Cargando')) warn('Video aun cargando...')
      else if (videoText.includes('Contenido Premium') || videoText.includes('Fragmento finalizado')) {
        fail('Lock overlay visible para usuario pago')
      } else {
        fail('No hay elemento <video> en la pagina')
      }
    }

    // 6b. No debe mostrar badge de "Fragmento" o "Vista previa"
    if (videoText.includes('Fragmento') && !videoText.includes('finalizado')) {
      fail('Badge de "Fragmento" visible para usuario pago')
    } else {
      pass('Sin badge de preview/fragmento')
    }

    // 6c. No debe mostrar boton de suscripcion
    if (videoText.includes('$499') && videoText.includes('primer año')) {
      fail('CTA de precio visible en video player para usuario pago')
    } else {
      pass('Sin CTA de precio en video player')
    }

    // 6d. No hay lock overlay
    if (videoText.includes('Contenido Premium') || videoText.includes('Solo para suscriptores')) {
      fail('Lock overlay visible para usuario pago')
    } else {
      pass('Sin lock overlay en video')
    }

    // 6e. Stream API responds 200
    const streamRes = await page.request.fetch(`${BASE}/api/content/${videoId}/stream`, {
      failOnStatusCode: false,
    })
    if (streamRes.status() === 200) {
      pass('API /stream retorna 200 (acceso completo)')
      const streamData = await streamRes.json().catch(() => ({}))
      if (streamData.url) pass('API /stream retorna URL de video')
      else fail('API /stream no retorna URL')
    } else {
      fail(`API /stream retorna ${streamRes.status()} (deberia ser 200 para usuario pago)`)
    }
  } else {
    warn('No hay videos en homepage — verificar si hay contenido de video subido')

    // Try to check if there are any video/course records
    const contentCheck = await page.request.fetch(`${BASE}/api/content/check`, { failOnStatusCode: false })
    warn('No se pudo verificar contenido de video por API')
  }

  // ═══════════════════════════════════════════════════════════════════
  // 7. PROFILE PAGE
  // ═══════════════════════════════════════════════════════════════════
  section('7. PROFILE PAGE')

  await page.goto(`${BASE}/profile`, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: `${SHOTS}/09-profile.png`, fullPage: true })

  const profileText = await page.locator('body').innerText()

  if (profileText.includes('activa') || profileText.includes('Activa') || profileText.includes('Miembro')) {
    pass('Perfil: membresia mostrada como activa')
  } else {
    warn('Perfil: no se encontro indicador de membresia activa')
  }

  if (profileText.includes('Referidos') || profileText.includes('referido') || profileText.includes('Afiliado')) {
    pass('Perfil: seccion de programa de afiliados visible')
  } else {
    warn('Perfil: seccion de afiliados no encontrada')
  }

  // ═══════════════════════════════════════════════════════════════════
  // 8. SUBSCRIBE PAGE — debe mostrar que ya es miembro
  // ═══════════════════════════════════════════════════════════════════
  section('8. SUBSCRIBE PAGE (ya suscrito)')

  await page.goto(`${BASE}/subscribe`, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: `${SHOTS}/10-subscribe-already-paid.png`, fullPage: true })

  const subText = await page.locator('body').innerText()

  if (subText.includes('activa') || subText.includes('Tu membresía')) {
    pass('Subscribe: muestra que la membresia ya esta activa')
  } else if (subText.includes('Pagar')) {
    fail('Subscribe: muestra boton "Pagar" a usuario ya suscrito')
  } else {
    warn('Subscribe: no se encontro mensaje claro de estado')
  }

  // ═══════════════════════════════════════════════════════════════════
  // 9. CATEGORY PAGES
  // ═══════════════════════════════════════════════════════════════════
  section('9. CATEGORY PAGES')

  for (const cat of ['salud', 'dinero', 'amor']) {
    await page.goto(`${BASE}/category/${cat}`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: `${SHOTS}/11-category-${cat}.png`, fullPage: true })

    const catUrl = page.url()
    if (catUrl.includes(`/category/${cat}`)) {
      const catBooks = await page.locator('a[href*="/read/"], a[href*="/content/"]').count()
      if (catBooks > 0) pass(`/category/${cat}: ${catBooks} items de contenido`)
      else warn(`/category/${cat}: sin items de contenido`)
    } else {
      fail(`/category/${cat}: redirigido a ${catUrl}`)
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 10. MOBILE RESPONSIVE
  // ═══════════════════════════════════════════════════════════════════
  section('10. RESPONSIVE (mobile 390x844)')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `${SHOTS}/12-home-mobile.png`, fullPage: true })

  const mobileText = await page.locator('body').innerText()
  if (mobileText.includes('Miembro Activo') || mobileText.includes('Hola')) {
    pass('Mobile: homepage carga con estado de usuario pago')
  } else {
    warn('Mobile: no se detecto estado de usuario pago')
  }

  // Mobile book reader
  const mobileBookLink = page.locator('a[href*="/read/"]').first()
  if (await mobileBookLink.count() > 0) {
    const mobileBookHref = await mobileBookLink.getAttribute('href')
    await page.goto(`${BASE}${mobileBookHref}`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(3000)
    await page.screenshot({ path: `${SHOTS}/13-reader-mobile.png`, fullPage: true })

    if (await page.locator('iframe').count() > 0) pass('Mobile: PDF reader funciona')
    else warn('Mobile: iframe de PDF no encontrado')
  }

  // ═══════════════════════════════════════════════════════════════════
  // RESUMEN
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(60))
  console.log('\x1b[1mRESUMEN — FLUJO USUARIO PAGO\x1b[0m')
  console.log('═'.repeat(60))

  console.log(`\n\x1b[32m✓ PASS: ${results.pass.length}\x1b[0m`)
  results.pass.forEach(p => console.log(`   • ${p}`))

  if (results.warn.length > 0) {
    console.log(`\n\x1b[33m⚠ WARNINGS: ${results.warn.length}\x1b[0m`)
    results.warn.forEach(w => console.log(`   • ${w}`))
  }

  if (results.fail.length > 0) {
    console.log(`\n\x1b[31m✗ FAIL: ${results.fail.length}\x1b[0m`)
    results.fail.forEach(f => console.log(`   • ${f}`))
  }

  console.log(`\n📸 Screenshots: ${SHOTS}`)
  console.log()

  await browser.close()
  process.exit(results.fail.length > 0 ? 1 : 0)
})()
