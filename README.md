# ALLYN - Plataforma de Desarrollo Personal

Una plataforma de streaming tipo Netflix enfocada en contenido de desarrollo personal con tres categorías principales: **Salud**, **Dinero** y **Amor**.

## 🚀 Características

- **Diseño tipo Netflix**: Hero section + carruseles horizontales
- **3 Categorías**: Salud, Dinero, Amor
- **Autenticación**: Email/password y Google OAuth
- **Reproductor de video**: Integrado con progreso
- **Responsive**: Mobile-first design
- **Dark Mode**: Tema oscuro elegante

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Animations**: Framer Motion
- **Deployment**: Vercel

## 📁 Estructura del Proyecto

```
my-app/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación
│   ├── (main)/            # Rutas principales
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # Componentes React
│   ├── ui/               # UI components (shadcn)
│   ├── layout/           # Layout components
│   ├── content/          # Content components
│   └── auth/             # Auth components
├── lib/                   # Librerías y utilidades
│   ├── supabase/         # Supabase clients
│   └── utils.ts          # Utilities
├── types/                 # TypeScript types
└── public/               # Static assets
```

## 🚀 Getting Started

### 1. Clonar y preparar

```bash
cd my-app
npm install
```

### 2. Configurar Supabase

1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar el SQL en `docs/supabase-schema.sql` en el SQL Editor
3. Copiar `.env.local.example` a `.env.local`
4. Agregar las credenciales de Supabase

### 3. Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

### 4. Deploy en Vercel

```bash
npm install -g vercel
vercel
```

O conecta tu repo de GitHub a Vercel para deploy automático.

## 🎨 Colores de Marca

- **Primary**: Purple (#6B21A8) - Sabiduría
- **Secondary**: Gold (#F59E0B) - Prosperidad
- **Accent**: Rose (#E11D48) - Amor
- **Dark**: Slate 900 (#0F172A)

## 📚 Categorías

| Categoría | Color | Descripción |
|-----------|-------|-------------|
| Salud | Green (#10B981) | Bienestar físico y mental |
| Dinero | Gold (#F59E0B) | Finanzas y emprendimiento |
| Amor | Rose (#E11D48) | Relaciones y desarrollo emocional |

## 🔐 Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📝 Licencia

Proyecto privado - ALLYN 2024
