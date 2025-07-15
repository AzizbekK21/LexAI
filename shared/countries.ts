export type CountrySource = {
  [key: string]: string;
};

export type Country = {
  name: string;
  languages: string[];
  sources: CountrySource;
};

export const countries: Record<string, Country> = {
  US: {
    name: "United States",
    languages: ["en"],
    sources: {
      federal: "https://www.law.cornell.edu/uscode"
    }
  },
  RU: {
    name: "Russia",
    languages: ["ru"],
    sources: {
      official: "http://pravo.gov.ru"
    }
  },
  TJ: {
    name: "Tajikistan",
    languages: ["ru", "tg"],
    sources: {
      official: "http://mmk.tj",
      alt: "http://adlia.tj"
    }
  }
};
