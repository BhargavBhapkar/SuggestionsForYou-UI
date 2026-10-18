// DRAFT legal text. It describes what the site does today (see the code), but it has
// not been reviewed by a lawyer. Set LEGAL_DRAFT to false only after that review.
export const LEGAL_DRAFT = true;
export const LEGAL_UPDATED = "16 October 2026";
export const CONTACT_EMAIL = "hello@suggestionsforyou.com";

export type LegalSection = { id: string; heading: string; paragraphs?: string[]; bullets?: string[]; after?: string[] };
export type LegalDoc = { intro: string; sections: LegalSection[] };

export const PRIVACY: LegalDoc = {
  intro:
    "SuggestionsForYou (\"we\", \"us\") is a price-comparison website for products sold in India. This policy explains what personal information we collect, why, who else sees it, and the choices you have.",
  sections: [
    {
      id: "collect",
      heading: "What we collect",
      bullets: [
        "Account details: your name, email address and a password. Passwords are stored only as a one-way hash, never in readable form.",
        "Delivery addresses you save: label, address lines, city, state, PIN code and phone number.",
        "Orders you place: the items, prices, delivery address, payment method, and the order status.",
        "Payment confirmations: when you pay online, we receive Razorpay's payment ID and confirmation. We never see or store your card, UPI or bank details.",
        "Your cart and wishlist. While you are signed out these stay in your own browser; when you sign in they are added to your account.",
        "Your email address, if you subscribe to deal updates in the website footer.",
        "Messages you type into the AI shopping assistant.",
        "Technical information such as your IP address and request details, which our servers and hosting providers process to run the site and to limit abuse.",
      ],
    },
    {
      id: "use",
      heading: "How we use it",
      bullets: [
        "To create and run your account, cart, wishlist and orders.",
        "To show you product comparisons and answer your questions in the AI assistant.",
        "To send the deal updates you asked for.",
        "To keep the site secure and prevent abuse, for example by limiting how fast requests can be made.",
        "To reply when you write to us.",
      ],
      after: ["At the time of writing, the site does not use advertising trackers or third-party analytics."],
    },
    {
      id: "storage",
      heading: "Cookies and browser storage",
      paragraphs: [
        "We do not set cookies of our own. Instead the site saves a few small items in your browser's local storage so it can work the way you left it:",
      ],
      bullets: [
        "Sign-in token: keeps you signed in (removed when you sign out).",
        "Guest cart and wishlist: your selections before you sign in.",
        "Recent searches: your last few searches, shown only to you.",
        "Language choice and the dismissal of the \"install app\" prompt.",
        "A service worker caches pages, product photos and recent data so the site loads faster and works with a weak connection.",
      ],
    },
    {
      id: "third-parties",
      heading: "Who else handles your information",
      paragraphs: ["We do not sell your personal information. We use these providers to run the service:"],
      bullets: [
        "Database hosting (MongoDB Atlas): stores accounts, addresses, orders and subscriber emails.",
        "Razorpay: processes online payments. Its payment window loads from Razorpay's servers, and the details you enter there go to Razorpay under its own privacy policy.",
        "Anthropic: the AI assistant sends the messages you type, together with product search results, to Anthropic to generate replies. Please do not type sensitive personal information into the assistant.",
        "Google Fonts: the site's fonts are loaded from Google, which therefore receives your IP address.",
        "Unsplash and Simple Icons: some images and brand logos load from their servers, which therefore receive your IP address.",
        "Voice search: if you use the microphone button, your browser may send the audio to its own speech-recognition service (for example Google in Chrome). We receive only the text.",
        "Retailers: when you follow a link to a retailer you leave our site and their privacy policy applies.",
      ],
    },
    {
      id: "retention",
      heading: "How long we keep it",
      paragraphs: [
        "We keep account, address and order information while your account exists and for as long as we need it to resolve disputes and meet legal obligations. Subscriber emails are kept until you ask us to remove them.",
      ],
    },
    {
      id: "rights",
      heading: "Your choices",
      bullets: [
        "You can edit or delete your saved addresses in your account at any time.",
        "You can clear the items listed above by signing out and clearing your browser's site data.",
        "To see, correct or delete the personal information we hold, or to unsubscribe from deal updates, email us at " + CONTACT_EMAIL + " from the address you registered with.",
      ],
    },
    {
      id: "security",
      heading: "Security and children",
      paragraphs: [
        "We protect passwords with hashing and limit how often sign-in and other sensitive requests can be repeated. No online service can promise perfect security, so please use a strong, unique password.",
        "The site is not intended for anyone under 18, and we do not knowingly collect information from children.",
      ],
    },
    {
      id: "changes",
      heading: "Changes and contact",
      paragraphs: [
        "If we change this policy we will update the date at the top of this page. Questions or requests: " + CONTACT_EMAIL + ".",
      ],
    },
  ],
};

export const TERMS: LegalDoc = {
  intro:
    "These terms apply when you use SuggestionsForYou. By using the site or creating an account you agree to them. If you do not agree, please do not use the site.",
  sections: [
    {
      id: "service",
      heading: "What the service is",
      paragraphs: [
        "SuggestionsForYou helps you compare product prices and details across retailers in India, keep a wishlist and cart, and get suggestions from an AI assistant. Product details, prices and offers come from retailers and third-party data sources.",
        "When you place an order through the site, we record it against your account with the delivery address and payment method you choose (cash on delivery, or online payment through Razorpay), and you can follow its status in your account.",
      ],
    },
    {
      id: "prices",
      heading: "Prices and product information",
      paragraphs: [
        "Prices, stock, delivery times, discounts and offers shown on the site are indicative only. They can be out of date, and some are estimates based on third-party data rather than the retailer's live price. Where a \"price as of\" date is shown, it is the date of the underlying data.",
        "Always check the price and availability on the retailer's own page before you buy. We do not guarantee that any price, offer or specification is accurate, complete or current.",
      ],
    },
    {
      id: "payments",
      heading: "Online payments and refunds",
      paragraphs: [
        "Online payments are processed by Razorpay. We treat an order as paid only after Razorpay's confirmation has been verified by our servers. If money is deducted but your order still shows as unpaid, email us with your order number and we will look into it.",
        "To cancel an order you have already paid for online, email us and we will arrange a refund to the original payment method. The time it takes for a refund to appear depends on your bank or payment provider.",
      ],
    },
    {
      id: "account",
      heading: "Your account",
      bullets: [
        "You must be at least 18 years old and give us accurate information.",
        "Keep your password confidential. You are responsible for activity on your account.",
        "Tell us promptly at " + CONTACT_EMAIL + " if you think someone else has used your account.",
      ],
    },
    {
      id: "ai",
      heading: "AI assistant",
      paragraphs: [
        "The assistant is an automated tool. Its answers can be wrong or incomplete and are not professional advice. Check important details yourself, and do not share sensitive personal information with it.",
      ],
    },
    {
      id: "use",
      heading: "Acceptable use",
      paragraphs: ["Please do not:"],
      bullets: [
        "copy or collect the site's data in bulk, or use automated tools that overload the service;",
        "try to break, probe or bypass the site's security or rate limits;",
        "use the site for anything unlawful, or to harm or deceive others.",
      ],
    },
    {
      id: "third-party",
      heading: "Retailers and other third parties",
      paragraphs: [
        "Links take you to websites we do not control. Their terms and policies apply there, and we are not responsible for their content, products or service.",
      ],
    },
    {
      id: "ip",
      heading: "Content and trademarks",
      paragraphs: [
        "The SuggestionsForYou name, logo and the design and software of the site belong to us. Product names, images and trademarks belong to their respective owners and are shown to identify products.",
      ],
    },
    {
      id: "liability",
      heading: "Availability and liability",
      paragraphs: [
        "We try to keep the site running but provide it \"as is\", without promises that it will be uninterrupted or error-free. To the extent the law allows, we are not liable for losses that result from relying on information on the site, from a retailer's actions, or from the site being unavailable.",
      ],
    },
    {
      id: "ending",
      heading: "Suspension and changes",
      paragraphs: [
        "You can stop using the site at any time. We may suspend or close accounts that break these terms or abuse the service. We may update these terms; the date at the top of this page shows the latest version, and continuing to use the site means you accept the update.",
        "These terms are governed by the laws of India.",
      ],
    },
    {
      id: "contact",
      heading: "Contact",
      paragraphs: ["Questions about these terms: " + CONTACT_EMAIL + "."],
    },
  ],
};
