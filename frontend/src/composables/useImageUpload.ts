import { supabase } from '@/utils/supabase'

const BUCKET = 'public-media'

export function useImageUpload() {
  async function uploadImage(file: File | Blob, folder: string): Promise<string> {
    const ext = file instanceof File ? file.name.split('.').pop() || 'jpg' : (file.type.split('/')[1] ?? 'jpg')
    const path = `${folder}/${crypto.randomUUID()}.${ext}`

    const { error } = await supabase.storage.from(BUCKET).upload(path, file)
    if (error) throw error

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return data.publicUrl
  }

  return { uploadImage }
}
