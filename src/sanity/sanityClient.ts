import { createClient } from '@sanity/client'

// создаем клиент Sanity
export const client = createClient({
    projectId: '44ezgbz2',
    dataset: 'production',
    apiVersion: '2026-01-20',
    useCdn: true,
    token: import.meta.env.VITE_SANITY_READ_TOKEN
})

// тип для поля изображения из Sanity
export type SanityImage = {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
}



// генерация URL изображения без использования builder
 
export const urlFor = (image: SanityImage | null | undefined): string => {
  if (!image || !image.asset?._ref) return ''

  const ref = image.asset._ref
  const [, id, dimensions, format] = ref.split('-') // id = abc123, dimensions = 800x600, format = png
  return `https://cdn.sanity.io/images/44ezgbz2/production/${id}-${dimensions}.${format}`
}