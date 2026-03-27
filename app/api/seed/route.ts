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
    ], { onConflict: 'slug' })
    .select()

  if (catError) return NextResponse.json({ error: catError.message }, { status: 500 })

  const catMap: Record<string, string> = {}
  for (const c of cats || []) catMap[c.slug] = c.id

  // Seed content
  // Check if content already exists
  const { count } = await supabase.from('content').select('*', { count: 'exact', head: true })
  if (count && count > 0) {
    return NextResponse.json({ success: true, categories: cats?.length, message: 'Ya sembrado', skippedContent: true })
  }

  const { error: contentError } = await supabase.from('content').insert([
    {
      title: 'El Poder de los Hábitos',
      description: 'Descubre cómo pequeños cambios diarios pueden transformar tu vida completamente. Un libro esencial sobre la neurociencia detrás de los hábitos.',
      author: 'Charles Duhigg',
      type: 'book',
      category_id: catMap['salud'],
      status: 'published',
      published_at: new Date().toISOString(),
      thumbnail_url: null,
      file_url: null,
      preview_url: null,
    },
    {
      title: 'Mindfulness para Principiantes',
      description: 'Aprende las técnicas de meditación y mindfulness que practican los líderes más exitosos del mundo para reducir el estrés y aumentar la productividad.',
      author: 'Jon Kabat-Zinn',
      type: 'book',
      category_id: catMap['salud'],
      status: 'published',
      published_at: new Date().toISOString(),
      thumbnail_url: null,
      file_url: null,
      preview_url: null,
    },
    {
      title: 'Padre Rico, Padre Pobre',
      description: 'La guía definitiva para entender cómo funciona el dinero y cómo hacer que trabaje para ti. El libro de finanzas más vendido de todos los tiempos.',
      author: 'Robert Kiyosaki',
      type: 'book',
      category_id: catMap['dinero'],
      status: 'published',
      published_at: new Date().toISOString(),
      thumbnail_url: null,
      file_url: null,
      preview_url: null,
    },
    {
      title: 'Libertad Financiera en 12 Meses',
      description: 'Un plan paso a paso para salir de las deudas, construir un fondo de emergencia y empezar a invertir inteligentemente desde cero.',
      author: 'Grant Sabatier',
      type: 'book',
      category_id: catMap['dinero'],
      status: 'published',
      published_at: new Date().toISOString(),
      thumbnail_url: null,
      file_url: null,
      preview_url: null,
    },
    {
      title: 'Los 5 Lenguajes del Amor',
      description: 'Comprende cómo expresar y recibir amor de manera efectiva. Una guía transformadora para mejorar todas tus relaciones personales.',
      author: 'Gary Chapman',
      type: 'book',
      category_id: catMap['amor'],
      status: 'published',
      published_at: new Date().toISOString(),
      thumbnail_url: null,
      file_url: null,
      preview_url: null,
    },
    {
      title: 'Comunicación No Violenta',
      description: 'Aprende a expresarte con claridad y empatía para construir relaciones más auténticas y resolver conflictos de manera efectiva.',
      author: 'Marshall Rosenberg',
      type: 'book',
      category_id: catMap['amor'],
      status: 'published',
      published_at: new Date().toISOString(),
      thumbnail_url: null,
      file_url: null,
      preview_url: null,
    },
  ], { onConflict: 'title' })

  if (contentError) return NextResponse.json({ error: contentError.message }, { status: 500 })

  return NextResponse.json({ success: true, categories: cats?.length, message: 'Base de datos sembrada exitosamente' })
}
