import type { NextApiRequest, NextApiResponse } from "next";

// тип карточки WB для слайдера
type WbSlide = {
  id: string;        // nmID карточки
  title: string;     // название товара
  imageUrl: string;  // главное фото
  link: string;      // ссылка на WB
};

type WbApiCard = {
  nmID: number;
  title: string;
  photos: { big: string }[];
};

type WbApiResponse = {
  cards: WbApiCard[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WbSlide[] | { message: string }>
) {
  try {
    const idsQuery = req.query.ids as string;
    if (!idsQuery) return res.status(400).json({ message: "ids not provided" });

    const ids = idsQuery.split(",").map((id) => Number(id));

    const WB_API_KEY = process.env.WB_API_KEY;
    if (!WB_API_KEY)
      return res.status(500).json({ message: "WB_API_KEY not set" });

    const wbResponse = await fetch(
      "https://content-api.wildberries.ru/content/v2/get/cards/list",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: WB_API_KEY,
        },
        body: JSON.stringify({
          settings: { cursor: { limit: ids.length }, filter: { withPhoto: -1 } },
          nmIds: ids,
        }),
      }
    );

    if (!wbResponse.ok) {
      const text = await wbResponse.text();
      return res.status(500).json({ message: `WB API error: ${text}` });
    }

    const wbData: WbApiResponse = await wbResponse.json();

    const slides: WbSlide[] = wbData.cards.map((card) => ({
      id: card.nmID.toString(),
      title: card.title,
      imageUrl: card.photos?.[0]?.big || "",
      link: `https://www.wildberries.ru/catalog/${card.nmID}/detail.aspx`,
    }));

    res.status(200).json(slides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err instanceof Error ? err.message : "unknown error" });
  }
}
