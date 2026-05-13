export interface Product {
  slug: string;
  name: string;
  brand: string;
  price: string;
  description: string;
  features: string[];
}

export const products: Product[] = [
  {
    slug: "ivermectin-9mg",
    name: "Ivermectin 9mg",
    brand: "Stromectol",
    price: "$3.00",
    description: "Trusted prescription treatment in capsule form.",
    features: [
      "Per capsule pricing",
      "Physician-supervised review",
      "Fast shipping",
    ],
  },
  {
    slug: "vitamin-d3-5000-iu",
    name: "Vitamin D3 5000 IU",
    brand: "Wellness Formula",
    price: "$1.25",
    description: "Supports daily immune and bone health.",
    features: ["Daily wellness support", "High potency", "Easy to take"],
  },
  {
    slug: "omega-3-fish-oil",
    name: "Omega-3 Fish Oil",
    brand: "Pure Health",
    price: "$2.75",
    description: "Helps support heart and joint health.",
    features: ["High EPA+DHA", "Supports circulation", "Supports recovery"],
  },
];

export function getProductBySlug(slug: string) {
  return products.find((item) => item.slug === slug);
}
