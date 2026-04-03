#!/usr/bin/env node
/**
 * Playwright admin flow test — captures screenshots and documents gaps
 * Run: node scripts/test-admin-flow.mjs
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const BASE = 'http://localhost:3002'
const EMAIL = 'bedr10_capacitacion@hotmail.com'
const PASS = 'Gerlyn35 !'
const SHOTS = '/tmp/allyn-admin-audit'

mkdirSync(SHOTS, { recursive: true })

const findings = []
function log(emoji, msg) { console.log(`${emoji}  ${msg}`); findings.push(msg) }
function warn(msg) { log('⚠️', `FALTA: ${msg}`) }
function ok(msg) { log('✅', msg) }

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. LOGIN
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n═══ 1. LOGIN ═══')
  await page.goto(`${BASE}/login`, { waitUntil: 'load', timeout: 20000 })
  await page.screenshot({ path: `${SHOTS}/01-login-page.png`, fullPage: true })

  // Wait for React hydration
  await page.waitForTimeout(3000)
  await page.screenshot({ path: `${SHOTS}/01-login-page.png`, fullPage: true })

  const emailInput = page.locator('input[type="email"], input[name="email"]')
  const passInput = page.locator('input[type="password"], input[name="password"]')

  if (await emailInput.count() === 0) {
    warn('No se encontró campo de email en /login')
  } else {
    await emailInput.fill(EMAIL)
    await passInput.fill(PASS)
    await page.screenshot({ path: `${SHOTS}/02-login-filled.png` })

    const submitBtn = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Entrar"), button:has-text("Login")')
    await submitBtn.first().click()
    await page.waitForURL('**', { timeout: 10000 }).catch(() => {})
    await page.waitForTimeout(3000)
    await page.screenshot({ path: `${SHOTS}/03-after-login.png`, fullPage: true })

    const url = page.url()
    if (url.includes('/login')) {
      warn('Login falló — sigue en /login después del submit')
    } else {
      ok(`Login exitoso → redirigido a ${url}`)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. ADMIN DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n═══ 2. ADMIN DASHBOARD ═══')
  await page.goto(`${BASE}/admin`, { waitUntil: 'load', timeout: 20000 })
  await page.waitForTimeout(4000)
  await page.screenshot({ path: `${SHOTS}/04-admin-dashboard.png`, fullPage: true })

  const dashUrl = page.url()
  if (dashUrl.includes('/login') || dashUrl === `${BASE}/`) {
    warn('No se pudo acceder a /admin — redirigido a ' + dashUrl)
  } else {
    ok('Acceso a /admin exitoso')

    // Check dashboard stats
    const statsText = await page.locator('body').innerText()
    const hasStats = ['Usuarios', 'Suscriptor', 'Contenido', 'Ingreso'].some(s => statsText.includes(s))
    if (hasStats) ok('Dashboard muestra estadísticas')
    else warn('Dashboard no muestra estadísticas visibles')

    // Check sidebar nav items
    const sidebarLinks = await page.locator('aside a, nav a').allTextContents()
    console.log('   Nav items:', sidebarLinks.join(', '))

    const expectedNav = ['Dashboard', 'Contenido', 'Usuarios', 'Afiliados', 'Categorías']
    for (const item of expectedNav) {
      if (sidebarLinks.some(l => l.includes(item))) ok(`Nav: "${item}" presente`)
      else warn(`Nav: "${item}" ausente en sidebar`)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. CONTENT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n═══ 3. GESTIÓN DE CONTENIDO ═══')
  await page.goto(`${BASE}/admin/content`, { waitUntil: 'load', timeout: 20000 })
  await page.waitForTimeout(4000)
  await page.screenshot({ path: `${SHOTS}/05-admin-content.png`, fullPage: true })

  const contentRows = await page.locator('tbody tr').count()
  if (contentRows > 0) {
    ok(`Lista de contenido: ${contentRows} ítems`)
  } else {
    warn('No se ven ítems de contenido en la tabla')
  }

  // Check for upload button
  const uploadLink = page.locator('a[href*="upload"], button:has-text("Subir")')
  if (await uploadLink.count() > 0) ok('Botón "Subir Contenido" presente')
  else warn('No hay botón de subir contenido')

  // Check for edit buttons (pencil icons)
  const editBtns = page.locator('a[href*="/edit"]')
  if (await editBtns.count() > 0) ok(`Botones de edición: ${await editBtns.count()} encontrados`)
  else warn('No hay botones de edición en la lista')

  // Check publish/unpublish toggle
  const toggleBtns = page.locator('button[title*="ublicar"], button[title*="Publicar"]')
  if (await toggleBtns.count() > 0) ok('Toggle publicar/despublicar presente')
  else warn('No hay toggle de publicar/despublicar')

  // Check drag handles
  const dragHandles = page.locator('button[class*="grab"]')
  if (await dragHandles.count() > 0) ok('Drag handles para reordenar presentes')
  else warn('No hay drag handles para reordenar')

  // Check filter buttons
  const filters = page.locator('button:has-text("Todo"), button:has-text("Libros")')
  if (await filters.count() > 0) ok('Filtros por tipo presentes')
  else warn('No hay filtros por tipo')

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. UPLOAD PAGE
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n═══ 4. SUBIR CONTENIDO ═══')
  await page.goto(`${BASE}/admin/content/upload`, { waitUntil: 'load', timeout: 20000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${SHOTS}/06-admin-upload.png`, fullPage: true })

  const uploadPageText = await page.locator('body').innerText()

  // Check form fields
  const formChecks = [
    ['Tipo selector', 'Libro'],
    ['Título input', 'Título'],
    ['Autor input', 'Autor'],
    ['Descripción', 'Descri'],
    ['Categoría select', 'Categoría'],
    ['Estado select', 'Estado'],
    ['Archivo principal', 'principal'],
    ['Vista previa', 'previa'],
    ['Portada', 'Portada'],
  ]
  for (const [name, keyword] of formChecks) {
    if (uploadPageText.includes(keyword)) ok(`Upload form: "${name}" presente`)
    else warn(`Upload form: "${name}" ausente`)
  }

  // Check free content toggle
  if (uploadPageText.includes('gratuito') || uploadPageText.includes('free')) ok('Toggle "contenido gratuito" presente')
  else warn('No hay toggle de contenido gratuito')

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. EDIT PAGE (first content item)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n═══ 5. EDITAR CONTENIDO ═══')
  await page.goto(`${BASE}/admin/content`, { waitUntil: 'load', timeout: 20000 })
  await page.waitForTimeout(1500)

  const firstEditLink = page.locator('a[href*="/edit"]').first()
  if (await firstEditLink.count() > 0) {
    const href = await firstEditLink.getAttribute('href')
    await page.goto(`${BASE}${href}`, { waitUntil: 'load', timeout: 20000 })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: `${SHOTS}/07-admin-edit.png`, fullPage: true })

    const editText = await page.locator('body').innerText()
    if (editText.includes('Editar') || editText.includes('Guardar')) ok('Página de edición carga correctamente')
    else warn('Página de edición no muestra contenido esperado')

    // Check if form is pre-populated
    const titleInput = page.locator('input[placeholder*="Nombre"], input[type="text"]').first()
    const titleValue = await titleInput.inputValue().catch(() => '')
    if (titleValue) ok(`Form pre-populated con título: "${titleValue}"`)
    else warn('Form de edición NO está pre-populated')

    // Check delete button
    if (editText.includes('Eliminar')) ok('Botón de eliminar presente')
    else warn('No hay botón de eliminar')

    // Check file indicators
    if (editText.includes('Archivo actual') || editText.includes('guardado')) ok('Indicador de archivo existente visible')
    else warn('No hay indicador de archivos actuales')

    // Check warning about file size
    if (editText.includes('50 MB') || editText.includes('línea de comandos')) ok('Aviso de límite de archivo visible')
    else warn('No hay aviso sobre límite de tamaño de archivos')
  } else {
    warn('No se encontró link de edición para probar')
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. USERS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n═══ 6. GESTIÓN DE USUARIOS ═══')
  await page.goto(`${BASE}/admin/users`, { waitUntil: 'load', timeout: 20000 })
  await page.waitForTimeout(4000)
  await page.screenshot({ path: `${SHOTS}/08-admin-users.png`, fullPage: true })

  const usersText = await page.locator('body').innerText()
  if (usersText.includes('@') || usersText.includes('email') || usersText.includes('Email')) ok('Página de usuarios muestra datos')
  else warn('Página de usuarios vacía o sin datos')

  // Check for subscription status column
  if (usersText.includes('Suscri') || usersText.includes('activ')) ok('Estado de suscripción visible')
  else warn('No se ve estado de suscripción de usuarios')

  // Check for role management
  if (usersText.includes('admin') || usersText.includes('Rol')) ok('Gestión de roles visible')
  else warn('No hay gestión de roles de usuario')

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. AFFILIATES
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n═══ 7. GESTIÓN DE AFILIADOS ═══')
  await page.goto(`${BASE}/admin/affiliates`, { waitUntil: 'load', timeout: 20000 })
  await page.waitForTimeout(4000)
  await page.screenshot({ path: `${SHOTS}/09-admin-affiliates.png`, fullPage: true })

  const affText = await page.locator('body').innerText()
  if (affText.includes('Afiliado') || affText.includes('comisi') || affText.includes('Comisi')) ok('Página de afiliados carga')
  else warn('Página de afiliados vacía o sin contenido')

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. CATEGORIES
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n═══ 8. GESTIÓN DE CATEGORÍAS ═══')
  await page.goto(`${BASE}/admin/categories`, { waitUntil: 'load', timeout: 20000 })
  await page.waitForTimeout(4000)
  await page.screenshot({ path: `${SHOTS}/10-admin-categories.png`, fullPage: true })

  const catText = await page.locator('body').innerText()
  if (catText.includes('Salud') || catText.includes('Dinero') || catText.includes('Amor')) ok('Categorías (Salud/Dinero/Amor) visibles')
  else warn('Categorías no visibles')

  // Check for CRUD operations on categories
  if (catText.includes('Editar') || catText.includes('Crear') || catText.includes('Agregar') || catText.includes('+')) ok('CRUD de categorías disponible')
  else warn('No hay acciones CRUD para categorías')

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. USER-FACING FLOW (home → content → reader)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n═══ 9. FLOW PÚBLICO (home → content) ═══')
  await page.goto(BASE, { waitUntil: 'load', timeout: 20000 })
  await page.waitForTimeout(4000)
  await page.screenshot({ path: `${SHOTS}/11-home.png`, fullPage: true })

  // Check hero section
  const homeText = await page.locator('body').innerText()
  if (homeText.includes('ALLYN') || homeText.includes('Suscr')) ok('Home page carga con branding')
  else warn('Home page sin branding ALLYN')

  // Check content cards
  const cards = await page.locator('[class*="card"], [class*="Card"], a[href*="/content/"]').count()
  if (cards > 0) ok(`${cards} cards/links de contenido en home`)
  else warn('No hay cards de contenido visibles en home')

  // Check thumbnails rendering
  const thumbs = await page.locator('img[src*="thumbnail"], img[src*="supabase"]').count()
  if (thumbs > 0) ok(`${thumbs} thumbnails de contenido visibles`)
  else warn('Thumbnails no visibles en home')

  // Navigate to a content page
  const contentLink = page.locator('a[href*="/content/"]').first()
  if (await contentLink.count() > 0) {
    await contentLink.click()
    await page.waitForTimeout(3000)
    await page.screenshot({ path: `${SHOTS}/12-content-detail.png`, fullPage: true })
    ok(`Navegación a contenido: ${page.url()}`)

    const detailText = await page.locator('body').innerText()
    // Check reader/viewer
    if (detailText.includes('iframe') || await page.locator('iframe').count() > 0) ok('Viewer/iframe de contenido presente')
    else warn('No hay viewer de contenido en la página de detalle')

    // Check audio player
    if (detailText.includes('Audio') || detailText.includes('Escuchar') || await page.locator('[data-audio-status]').count() > 0) ok('Sección de audio presente')
    else warn('No hay sección de audio en detalle de contenido')
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. API ROUTES CHECK
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n═══ 10. API ROUTES ═══')
  const apiChecks = [
    ['/api/auth/signout', 'POST', 'Sign out'],
    ['/api/stripe/webhook', 'POST', 'Stripe webhook'],
  ]
  for (const [path, method, name] of apiChecks) {
    try {
      const res = await page.request.fetch(`${BASE}${path}`, { method, failOnStatusCode: false })
      const status = res.status()
      // 405 = route exists but wrong method, 200/302 = works, 401 = auth required
      if (status < 500) ok(`API ${name} (${path}): ${status}`)
      else warn(`API ${name} (${path}): error ${status}`)
    } catch {
      warn(`API ${name} (${path}): no responde`)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 11. RESPONSIVE CHECK
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n═══ 11. RESPONSIVE (mobile) ═══')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${BASE}/admin`, { waitUntil: 'load', timeout: 20000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${SHOTS}/13-admin-mobile.png`, fullPage: true })

  const sidebarVisible = await page.locator('aside').isVisible().catch(() => false)
  if (sidebarVisible) warn('Sidebar visible en mobile — debería colapsarse o ser hamburger menu')
  else ok('Sidebar no visible en mobile (correcto)')

  await page.goto(BASE, { waitUntil: 'load', timeout: 20000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${SHOTS}/14-home-mobile.png`, fullPage: true })
  ok('Home mobile capturada')

  // ═══════════════════════════════════════════════════════════════════════════
  // 12. SECURITY CHECKS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n═══ 12. SEGURIDAD ═══')

  // Test unauthenticated admin access
  const ctx2 = await browser.newContext()
  const anonPage = await ctx2.newPage()
  await anonPage.goto(`${BASE}/admin`, { waitUntil: 'load', timeout: 20000 })
  await anonPage.waitForTimeout(2000)
  const anonUrl = anonPage.url()
  if (anonUrl.includes('/login') || !anonUrl.includes('/admin')) ok('Admin protegido — redirige a login sin auth')
  else warn('SEGURIDAD: /admin accesible sin autenticación!')

  // Test direct content API without auth
  await anonPage.goto(`${BASE}/admin/content`, { waitUntil: 'load', timeout: 20000 })
  await anonPage.waitForTimeout(1500)
  const anonContentUrl = anonPage.url()
  if (anonContentUrl.includes('/login')) ok('Admin/content protegido sin auth')
  else warn('SEGURIDAD: /admin/content accesible sin auth!')

  await ctx2.close()

  // ═══════════════════════════════════════════════════════════════════════════
  // RESUMEN
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(60))
  console.log('RESUMEN DE AUDITORÍA')
  console.log('═'.repeat(60))

  const warnings = findings.filter(f => f.startsWith('FALTA:'))
  const passes = findings.filter(f => !f.startsWith('FALTA:'))

  console.log(`\n✅ APROBADOS: ${passes.length}`)
  passes.forEach(p => console.log(`   • ${p}`))

  console.log(`\n⚠️  FALTANTES: ${warnings.length}`)
  warnings.forEach(w => console.log(`   • ${w.replace('FALTA: ', '')}`))

  console.log(`\n📸 Screenshots guardados en: ${SHOTS}`)
  console.log()

  await browser.close()
})()
