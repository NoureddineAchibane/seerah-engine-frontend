export interface QuranVerse {
  surah: number;
  ayah_start: number;
  ayah_end: number;
  surah_name_ar: string;
  surah_name_en: string;
  text_ar: string;
  revelation_context: string;
}

export interface Hadith {
  text_ar: string;
  text_en: string;
  source: string;
  source_en: string;
  number: string;
}

export interface SeerahEvent {
  id: string;
  year_hijri: number;
  year_ce: string;
  period: string;
  era: string;
  title_ar: string;
  title_en: string;
  location: string;
  location_ar: string;
  coords: [number, number];
  description_ar: string;
  description_en: string;
  quran_verses: QuranVerse[];
  hadith: Hadith[];
  tags: string[];
  significance: number;
  image_query: string;
}

export interface Period {
  label_ar: string;
  label_en: string;
  color: string;
}

export type Periods = Record<string, Period>;
