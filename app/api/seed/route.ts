/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { secret } = await req.json()
  if (secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const supabase = createAdminClient()

  // Seed categories
  const { data: cats, error: catError } = await supabase
    .from('categories')
    .upsert([
      { name: 'Salud', slug: 'salud', description: 'Transforma tu bienestar físico y mental', color: '#10b981', sort_order: 1 },
      { name: 'Dinero', slug: 'dinero', description: 'Construye tu libertad financiera', color: '#f59e0b', sort_order: 2 },
      { name: 'Amor', slug: 'amor', description: 'Relaciones y conexiones que te elevan', color: '#ec4899', sort_order: 3 },
    ] as any[], { onConflict: 'slug' })
    .select()

  if (catError) return NextResponse.json({ error: catError.message }, { status: 500 })

  const catMap: Record<string, string> = {}
  for (const c of cats || []) catMap[c.slug] = c.id

  // Skip content if already seeded
  const { count } = await supabase.from('content').select('*', { count: 'exact', head: true })
  if (count && count > 0) {
    return NextResponse.json({ success: true, categories: cats?.length, message: 'Categorías sembradas, contenido ya existía' })
  }

  const contentRows: any[] = [
    { title: 'El Poder de los Hábitos', description: 'Descubre cómo pequeños cambios diarios pueden transformar tu vida completamente.', author: 'Charles Duhigg', type: 'book', category_id: catMap['salud'], status: 'published', published_at: new Date().toISOString(), thumbnail_url: 'https://picsum.photos/seed/habitos/480/270' },
    { title: 'Mindfulness para Principiantes', description: 'Aprende las técnicas de meditación que practican los líderes más exitosos del mundo.', author: 'Jon Kabat-Zinn', type: 'book', category_id: catMap['salud'], status: 'published', published_at: new Date().toISOString(), thumbnail_url: 'https://picsum.photos/seed/mindfulness/480/270' },
    { title: 'Padre Rico, Padre Pobre', description: 'La guía definitiva para entender cómo funciona el dinero y cómo hacer que trabaje para ti.', author: 'Robert Kiyosaki', type: 'book', category_id: catMap['dinero'], status: 'published', published_at: new Date().toISOString(), thumbnail_url: 'https://picsum.photos/seed/padrerico/480/270' },
    { title: 'Libertad Financiera en 12 Meses', description: 'Un plan paso a paso para salir de las deudas y empezar a invertir inteligentemente.', author: 'Grant Sabatier', type: 'book', category_id: catMap['dinero'], status: 'published', published_at: new Date().toISOString(), thumbnail_url: 'https://picsum.photos/seed/libertad/480/270' },
    { title: 'Los 5 Lenguajes del Amor', description: 'Comprende cómo expresar y recibir amor de manera efectiva en todas tus relaciones.', author: 'Gary Chapman', type: 'book', category_id: catMap['amor'], status: 'published', published_at: new Date().toISOString(), thumbnail_url: 'https://picsum.photos/seed/lenguajes/480/270' },
    { title: 'Comunicación No Violenta', description: 'Aprende a expresarte con claridad y empatía para construir relaciones más auténticas.', author: 'Marshall Rosenberg', type: 'book', category_id: catMap['amor'], status: 'published', published_at: new Date().toISOString(), thumbnail_url: 'https://picsum.photos/seed/comunicacion/480/270' },
  ]

  const { error: contentError } = await supabase.from('content').insert(contentRows)
  if (contentError) return NextResponse.json({ error: contentError.message }, { status: 500 })

  return NextResponse.json({ success: true, categories: cats?.length, content: contentRows.length, message: 'Base de datos sembrada exitosamente' })
}
