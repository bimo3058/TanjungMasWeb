interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0.0 - 1.0
  mimeType?: 'image/webp' | 'image/jpeg'
}

/**
  * Kompresi gambar se-agresif mungkin di client-side.
  */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxWidth = 1080,    // Maksimal lebar (px)
    maxHeight = 1080,   // Maksimal tinggi (px)
    quality = 0.55,     // Aggressive compression (55% quality)
    mimeType = 'image/webp'
  } = options

  return new Promise((resolve, reject) => {
    // Jika file bukan gambar, lewati
    if (!file.type.startsWith('image/')) {
      return resolve(file)
    }

    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.src = e.target?.result as string
    }

    reader.onerror = (err) => reject(err)

    img.onload = () => {
      let { width, height } = img

      // Hitung rasio resize agar proporsional
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        } else {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }
      }

      // Buat Canvas untuk render ulang
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return reject(new Error('Gagal mendapatkan konteks Canvas 2D'))
      }

      // Render gambar ke canvas
      ctx.drawImage(img, 0, 0, width, height)

      // Export canvas ke Blob WebP dengan kualitas rendah/agresif
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error('Gagal mengompres gambar'))
          }

          // Ganti ekstensi file menjadi .webp
          const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
          const newFileName = `${originalName}.webp`

          const compressedFile = new File([blob], newFileName, {
            type: mimeType,
            lastModified: Date.now()
          })

          resolve(compressedFile)
        },
        mimeType,
        quality
      )
    }

    img.onerror = (err) => reject(err)
    reader.readAsDataURL(file)
  })
}