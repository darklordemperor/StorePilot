export const metrics = [
  { label: "Revenue", value: "$48,240", change: "+12.4%", tone: "emerald" },
  { label: "Orders", value: "1,284", change: "+8.1%", tone: "blue" },
  { label: "Low stock", value: "18", change: "Needs review", tone: "amber" },
  { label: "Active branches", value: "6", change: "2 cities", tone: "rose" },
];

export const products = [
  { sku: "CB-001", name: "Cold Brew Coffee", category: "Beverages", stock: 124, price: "$4.50", status: "Active" },
  { sku: "CR-012", name: "Croissant Butter", category: "Bakery", stock: 42, price: "$3.25", status: "Active" },
  { sku: "GR-140", name: "Granola Jar", category: "Pantry", stock: 8, price: "$8.90", status: "Low" },
  { sku: "TE-044", name: "Jasmine Tea Tin", category: "Beverages", stock: 67, price: "$6.40", status: "Active" },
];

export const branches = [
  { name: "Central Market", code: "CTR", city: "Bangkok", manager: "Maya Chen", revenue: "$21,840" },
  { name: "Riverside", code: "RIV", city: "Bangkok", manager: "Noah Smith", revenue: "$14,620" },
  { name: "Airport Kiosk", code: "AIR", city: "Samut Prakan", manager: "Ari Patel", revenue: "$11,780" },
];

export const inventory = [
  { product: "Cold Brew Coffee", branch: "Central Market", onHand: 54, reorder: 20, value: "$243.00" },
  { product: "Croissant Butter", branch: "Riverside", onHand: 18, reorder: 24, value: "$58.50" },
  { product: "Granola Jar", branch: "Airport Kiosk", onHand: 8, reorder: 18, value: "$71.20" },
  { product: "Jasmine Tea Tin", branch: "Central Market", onHand: 41, reorder: 16, value: "$262.40" },
];

export const movements = [
  { type: "SALE", product: "Cold Brew Coffee", branch: "Central Market", qty: "-6", user: "Maya Chen", time: "09:42" },
  { type: "IN", product: "Croissant Butter", branch: "Riverside", qty: "+30", user: "Noah Smith", time: "10:15" },
  { type: "ADJUSTMENT", product: "Granola Jar", branch: "Airport Kiosk", qty: "-2", user: "Ari Patel", time: "11:05" },
  { type: "RETURN", product: "Jasmine Tea Tin", branch: "Central Market", qty: "+1", user: "Maya Chen", time: "12:18" },
];

export const customers = [
  { name: "Lina Wholesale", email: "orders@lina.example", phone: "+66 80 222 1400", spend: "$8,420" },
  { name: "River Cafe", email: "buyer@river.example", phone: "+66 81 555 9801", spend: "$5,130" },
  { name: "Sora Hotel", email: "supply@sora.example", phone: "+66 82 440 7110", spend: "$12,900" },
];

export const orders = [
  { number: "SO-1048", customer: "Sora Hotel", branch: "Central Market", total: "$740.50", status: "Completed" },
  { number: "SO-1047", customer: "River Cafe", branch: "Riverside", total: "$312.20", status: "Completed" },
  { number: "SO-1046", customer: "Walk-in", branch: "Airport Kiosk", total: "$42.70", status: "Draft" },
];

export const activity = [
  "Central Market closed 64 orders today",
  "Granola Jar dropped below reorder level",
  "Riverside received bakery replenishment",
  "Airport Kiosk added a new staff account",
];
