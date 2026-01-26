// src/pages/api/wb/cards.ts
import type { NextApiRequest, NextApiResponse } from "next"

// тип карты товара, которую вернем на фронт
type WbCard = {
  nmId: number
  title: string
  description: string
  images: string[]       // массив больших изображений
  video: string[]        // ссылки на видео
  price: number          // текущая цена
  oldPrice?: number      // старая цена, если есть
  availability: number   // остаток на складе
  sizes?: string[]
  colors?: string[]
  categories?: string[]  // категории товаров, например платья, рубашки
}

// точный тип ответа WB API
type WbApiPhoto = {
  big: string
  c246x328: string
  c516x688: string
  square: string
  tm: string
}

type WbApiSize = {
  chrtID: number
  techSize: string
  skus?: string[]
}

type WbApiCharacteristic = {
  id: number
  name: string
  value: string[]
}

type WbApiCard = {
  nmID: number
  title: string
  description: string
  photos?: WbApiPhoto[]
  video?: string
  price?: number
  oldPrice?: number
  sizes?: WbApiSize[]
  characteristics?: WbApiCharacteristic[]
  subjectName?: string
}

// handler api
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WbCard[] | { error: string }>
) {
  try {
    // ожидаем список nmId через query: ?nmIds=123,456
    const nmIds = req.query.nmIds
      ? (req.query.nmIds as string).split(",").map(Number)
      : []

    if (!nmIds.length) {
      return res.status(400).json({ error: "nmIds query required" })
    }

    // запрос к wb api через backend, ключ хранится только на сервере
    const response = await fetch(
      "https://content-api.wildberries.ru/content/v2/get/cards/list",
      {
        method: "POST",
        headers: {
          Authorization: process.env.WB_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: { cursor: { limit: 100 } },
          nmIds,
        }),
      }
    )

    const data: { cards: WbApiCard[] } = await response.json()

    // преобразуем данные в формат wbCard для фронта
    const cards: WbCard[] = (data.cards || []).map((c) => ({
      nmId: c.nmID,
      title: c.title,
      description: c.description,
      images: c.photos?.map((p) => p.big) || [],
      video: c.video ? [c.video] : [],
      price: c.price || 0,
      oldPrice: c.oldPrice,
      availability:
        c.sizes?.reduce((acc, s) => acc + (s.skus?.length || 0), 0) || 0,
      sizes: c.sizes?.map((s) => s.techSize),
      colors:
        c.characteristics?.find((ch) => ch.name.toLowerCase() === "цвет")
          ?.value || [],
      categories: c.subjectName ? [c.subjectName] : [],
    }))

    res.status(200).json(cards)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "failed to fetch wb cards" })
  }
}
