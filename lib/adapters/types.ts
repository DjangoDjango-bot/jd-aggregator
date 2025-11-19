export type ScrapeResult = {
  source: string;
  sourceId: string;
  titleCn: string;
  titleEn?: string;
  descriptionCn?: string;
  descriptionEn?: string;
  price: number;
  currency: 'CNY';
  images: string[];
  shopName?: string;
  shopRating?: number;
  shippingInfoCn?: string;
  shippingInfoEn?: string;
  url: string;
};

export interface SourceAdapter {
  name: string;
  search(query: string): Promise<ScrapeResult[]>;
  getById(id: string): Promise<ScrapeResult | null>;
}
