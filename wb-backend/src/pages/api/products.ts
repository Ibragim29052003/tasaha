// wb-backend/src/pages/api/products.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const WB_TOKEN = process.env.WB_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const response = await axios.post(
      "https://content-api.wildberries.ru/content/v2/get/cards/list",
      {
        settings: {
          cursor: { limit: 10 },
          filter: { textSearch: "платье" } // Или по nmId
        }
      },
      {
        headers: {
          "Authorization": WB_TOKEN,
          "Content-Type": "application/json"
        }
      }
    );

    const cards = response.data.cards || [];
    const slides = cards.map((card: any) => ({
      id: card.nmID.toString(),
      title: card.title,
      description: card.description || "",
      newPrice: card.sizes?.[0]?.price || 0,
      oldPrice: card.sizes?.[0]?.oldPrice || undefined,
      imageUrl: card.photos?.[0]?.big || "/placeholder.jpg",
      link: `https://www.wildberries.ru/catalog/${card.nmID}/detail.aspx`,
    }));

    res.status(200).json({ slides });
  } catch (error: any) {
    console.error("WB API error:", error.response?.data || error.message);
    res.status(500).json({ slides: [] });
  }
}
