import { supabase } from '@/utils/supabase'
import { compressImage } from '@/utils/compressImage'
import { PUBLIC_MEDIA_BUCKET } from '@/utils/storageMedia'

export function useImageUpload() {
  const uploadImage = async (file: File | Blob, folder: string): Promise<string> => {
    try {
      // 1. Konversi Blob ke File (jaga-jaga kalau inputnya berbentuk Blob)
      const fileToCompress = file instanceof File 
        ? file 
        : new File([file], 'image.jpg', { type: file.type })

      // 2. Jalankan kompresi brutal sebelum upload
      const compressedFile = await compressImage(fileToCompress, {
        maxWidth: 1080,   // Resolusi cukup untuk web
        maxHeight: 1080,
        quality: 0.55,    // Kompresi agresif WebP
        mimeType: 'image/webp'
      })

      // Cek ukuran sebelum & sesudah (bisa dihapus nanti kalau sudah aman)
      console.log(`Ukuran asli: ${(file.size / 1024).toFixed(1)} KB`)
      console.log(`Hasil kompresi: ${(compressedFile.size / 1024).toFixed(1)} KB`)

      // 3. Siapkan path (ekstensi otomatis .webp karena sudah dikonversi)
      const path = `${folder}/${crypto.randomUUID()}.webp`

      // 4. Upload file yang sudah sangat ringan ke Supabase
      const { error } = await supabase.storage
        .from(PUBLIC_MEDIA_BUCKET)
        .upload(path, compressedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/webp' // Set content type eksplisit
        })

      if (error) throw error

      // 5. Ambil URL Publik
      const { data } = supabase.storage.from(PUBLIC_MEDIA_BUCKET).getPublicUrl(path)
      
      return data.publicUrl
    } catch (err) {
      console.error('Upload error:', err)
      throw err
    }
  }

  return { uploadImage }
}
