import { createAdminClient } from "@/lib/supabase/admin"

const STORAGE_PATH_PATTERN = /\/storage\/v1\/object\/(?:public|sign|authenticated)\/(.+)/

export async function resolveStorageAssetUrl(assetUrl: string): Promise<string> {
  const url = new URL(assetUrl)
  const storageMatch = url.pathname.match(STORAGE_PATH_PATTERN)

  if (url.pathname.includes("/object/public/") || !storageMatch) {
    return assetUrl
  }

  const [bucket, ...rest] = storageMatch[1].split("/")
  const filePath = rest.join("/")

  try {
    const admin = createAdminClient()
    const { data, error } = await admin.storage.from(bucket).createSignedUrl(filePath, 3600)

    if (error || !data?.signedUrl) {
      return assetUrl
    }

    return data.signedUrl
  } catch {
    return assetUrl
  }
}
