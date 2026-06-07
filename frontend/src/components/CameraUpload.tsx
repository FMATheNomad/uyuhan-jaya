import { useState, useRef } from 'react'
import api from '@/services/api'

interface Props {
  onUploaded: (url: string) => void
  label?: string
}

export default function CameraUpload({ onUploaded, label = 'Upload Foto' }: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const upload = async (file: File) => {
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    try {
      const { data } = await api.post('/upload/image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setPreview(data.url)
      onUploaded(data.url)
    } catch {
      alert('Gagal upload foto')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          📸 Ambil Foto
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
        >
          📁 Pilih File
        </button>
      </div>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />

      {uploading && <p className="text-sm text-gray-400">Mengupload...</p>}
      {preview && (
        <img
          src={preview}
          alt="preview"
          className="w-32 h-32 object-cover rounded-lg border"
        />
      )}
    </div>
  )
}
