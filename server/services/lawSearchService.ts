import axios from "axios";
import * as cheerio from "cheerio";
import { countries } from "../../shared/countries";

export async function searchLaws(countryCode: string, query: string) {
  const code = countryCode.toUpperCase();
  const country = countries[code];

  if (!country || !country.sources.official) {
    throw new Error("Unknown or unsupported country");
  }

  const url = country.sources.official;

  try {
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    const matches: {
      article: string;
      text: string;
      source: string;
    }[] = [];

    $("body *").each((i, el) => {
      const text = $(el).text().trim();
      if (text.toLowerCase().includes(query.toLowerCase())) {
        const articleMatch = text.match(/Статья\s+(\d+)/i);
        const article = articleMatch ? articleMatch[1] : "неизвестна";

        matches.push({
          article,
          text: text.slice(0, 500),
          source: url,
        });
      }
    });

    return matches.slice(0, 3); // максимум 3 совпадения
  } catch (error) {
    console.error("Ошибка при поиске закона:", error);
    return [];
  }
}
