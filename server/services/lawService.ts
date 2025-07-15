import { countries } from "../../shared/countries";
import axios from "axios";
import * as cheerio from "cheerio";

export async function getLawByCountryAndArticle(countryCode: string, article: string) {
  const code = countryCode.toUpperCase() as keyof typeof countries;
  const country = countries[code];

  if (!country) return null;

  // TODO: Реальные парсеры для каждой страны
  switch (countryCode.toUpperCase()) {
    case "TJ":
      return await parseTajikistanLaw(article, country.sources.official);
    case "RU":
      return await parseRussiaLaw(article, country.sources.official);
    case "US":
      return await parseUSLaw(article, country.sources.federal);
    default:
      return null;
  }
}

// 🇹🇯 Пример парсера для Таджикистана
async function parseTajikistanLaw(article: string, url: string) {
  try {
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    // Здесь ты укажешь реальный селектор для текста закона
    const text = $(`body:contains("Статья ${article}")`).text();

    return {
      country: "Tajikistan",
      article,
      title: `Статья ${article}`,
      text: text || "Закон не найден",
      source: url
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}

// 🇷🇺 Пример парсера для России
async function parseRussiaLaw(article: string, url: string) {
  // Аналогично реализуем парсинг с pravo.gov.ru
  return {
    country: "Russia",
    article,
    title: `Статья ${article}`,
    text: "Временная заглушка — добавим парсер",
    source: url
  };
}

// 🇺🇸 Пример парсера для США
async function parseUSLaw(article: string, url: string) {
  return {
    country: "United States",
    article,
    title: `Title ${article}`,
    text: "Текст закона США будет подключен",
    source: url
  };
}
