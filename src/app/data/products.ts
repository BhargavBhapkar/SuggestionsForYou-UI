import { Bot, BarChart2, Scale, Tag, TrendingUp, Shield } from "lucide-react";

export const DEFAULT_PRODUCT = "Samsung Galaxy S25 Ultra";

const CATEGORY_IMAGES: [RegExp, string][] = [
  [/fold|flip/i, "1721864428881-dbabb9ea0017"],
  [/iphone/i, "1571380401583-72ca84994796"],
  [/galaxy|oneplus|pixel|nothing phone|\b5g\b|redmi|xiaomi/i, "1610945264803-c22b62d2a7b3"],
  [/macbook|laptop|xps|thinkpad|zenbook|ideapad|\bbook\d?\s*pro\b/i, "1517336714731-489689fd1ca8"],
  [/\btv\b|oled|qled|bravia|television|crystal uhd/i, "1593784991095-a205069470b6"],
  [/tablet|ipad|\bpad\b|\btab\b/i, "1561154464-82e9adf32764"],
  [/watch|fenix/i, "1546868871-7041f2a55e12"],
  [/buds|earbuds|airpods/i, "1600294037681-c80b4cb5b434"],
  [/headphone|wh-1000|rockerz/i, "1618366712010-f4ae9c647dcb"],
  [/gopro|hero \d+/i, "1685615359827-aa31d97578e7"],
  [/camera|eos|dslr/i, "1495707902641-75cac588d2e9"],
  [/ps5|playstation|console/i, "1606144042614-b2417e99c4e3"],
  [/washer|washing machine/i, "1626806819282-2c1dc01a5e0c"],
  [/\bac\b|air condition|wind-free/i, "1667983453881-4992fe86ab1b"],
];

// Real product shots (our own photos, Amazon) are shown whole on white; stock photos and icon tiles fill the box.
export const isProductShot = (src?: string) => !!src && (src.startsWith("/product-images/") || src.includes("media-amazon"));
export const imgFit = (src?: string, pad = "p-3") => (isProductShot(src) ? `object-contain ${pad}` : "object-cover");
export const imgBox = (src?: string) => (isProductShot(src) ? "bg-white" : "bg-[#F8FAFC] dark:bg-white/5");

export function getProductImage(productName: string, size = 400): string {
  const match = CATEGORY_IMAGES.find(([pattern]) => pattern.test(productName));
  const id = match ? match[1] : "1610945264803-c22b62d2a7b3";
  return `https://images.unsplash.com/photo-${id}?w=${size}&h=${size}&fit=crop&auto=format`;
}

export const TRENDING = [
  "iPhone 15 Pro",
  "Samsung S24",
  "AirPods Pro",
  "MacBook M3",
  "PS5",
  "RTX 4090",
  "Camera",
];

export const WHY_FEATURES = [
  { icon: Bot,       title: "AI Recommendations",         desc: "Our AI analyzes millions of price points to recommend the right product at the right time, tailored specifically to you."       },
  { icon: BarChart2, title: "Real-Time Price Comparison",  desc: "Prices updated every 15 minutes across 5 verified retailers. Always see where your money goes furthest."                      },
  { icon: Scale,     title: "Side-by-Side Comparison",    desc: "Pick up to four products from the same category and compare price, specs, delivery and offers in one table, with the differences highlighted." },
  { icon: Tag,       title: "Exclusive Coupons",           desc: "We surface hidden coupon codes and cashback offers most shoppers miss, saving you an extra 5–15% at checkout automatically."    },
  { icon: TrendingUp,title: "Price History Charts",        desc: "24-month price history tells you whether today's 'sale' is real or manufactured. Know when to wait and when to strike."          },
  { icon: Shield,    title: "Secure & Verified Shopping",  desc: "Only verified, trusted retailers. Every price is validated. No fake listings, no malicious redirects, no compromised data."      },
];
