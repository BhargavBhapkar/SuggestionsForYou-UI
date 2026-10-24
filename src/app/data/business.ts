// The business details and policy numbers shown on the Contact, Shipping & Delivery and
// Cancellation & Refunds pages. Edit the values here; nothing else needs to change.
//
// BUSINESS: an empty value is simply not shown on the Contact page.
// POLICY: these are PROPOSED values. They become promises to customers, so set them to what
// you will really do before you submit the website to Razorpay.
export const BUSINESS = {
  /** Registered name, exactly as on your PAN / registration documents. */
  legalName: "Saroj Rajkumar Omprakash",
  /** Full registered or operating address: street, area, city, state, PIN code. */
  address: "C/O Saroj Omprakash, A-205, PM AVAS YOJNA, Mangal Pandey Road, Sama, PO: Chhani Rd, Vadodara, District: Vadodara, Gujarat – 390024",
  /** Customer-support phone number, e.g. "+91 98765 43210". */
  phone: "+91 87990 67810",
  /** Opening hours for phone and email support, e.g. "Mon–Sat, 10:00–18:00 IST". */
  hours: "",
  /** GST number, if you are registered. */
  gstin: "",
  /** Name of the person who handles complaints. */
  grievanceOfficer: "Saroj Rajkumar Omprakash",
};

export const POLICY = {
  /** Time to pack and hand the order to the courier. */
  processingTime: "1–2 business days",
  /** Courier transit time after dispatch. */
  deliveryTime: "3–7 business days",
  /** Days after delivery within which a damaged, defective or wrong item can be reported. */
  returnWindowDays: 7,
  /** Time to return money to the customer after a refund is approved. */
  refundTime: "5–7 business days",
  /** Whether the prices shown include taxes (GST). */
  pricesIncludeTax: true,
};
