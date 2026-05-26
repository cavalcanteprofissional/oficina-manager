'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ImageUploadProps {
  bucket?: string
  path?: string
  onUpload: (url: string) => void
  onRemove?: () => void
  currentUrl?: string | null
  accept?: string
}

export default function ImageUpload({
  bucket = 'fotos-clientes',
  path = 'uploads',
  onUpload,
  onRemove,
  currentUrl,
  accept = 'image/*',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${path}/${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file)

    if (error) {
      console.error('Upload error:', error)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    const publicUrl = urlData.publicUrl
    setPreview(publicUrl)
    onUpload(publicUrl)
    setUploading(false)
  }

  const handleRemove = () => {
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
    onRemove?.()
  }

  return (
    <div className="flex items-center gap-4">
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-24 h-24 object-cover rounded-lg border"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors">
          {uploading ? (
            <Loader2 size={20} className="animate-spin text-gray-400" />
          ) : (
            <>
              <Upload size={20} className="text-gray-400 mb-1" />
              <span className="text-xs text-gray-700">Upload</span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFile}
            className="hidden"
            disabled={uploading}
          />
        </label>
      )}
    </div>
  )
}
