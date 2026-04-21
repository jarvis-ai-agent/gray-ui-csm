type CustomerBrandPresentation = {
  className: string
  fallback: string
}

const CUSTOMER_BRAND_BY_ID: Record<string, CustomerBrandPresentation> = {
  "lattice-cloud": {
    className: "bg-sky-600 text-white",
    fallback: "L",
  },
  "northstar-health": {
    className: "bg-emerald-600 text-white",
    fallback: "N",
  },
  aeroloft: {
    className: "bg-indigo-600 text-white",
    fallback: "A",
  },
  "polar-banking": {
    className: "bg-zinc-900 text-white",
    fallback: "P",
  },
  brightharbor: {
    className: "bg-amber-600 text-white",
    fallback: "B",
  },
  "fieldhouse-retail": {
    className: "bg-rose-600 text-white",
    fallback: "F",
  },
  "cinder-ai": {
    className: "bg-fuchsia-600 text-white",
    fallback: "C",
  },
  "summit-grid": {
    className: "bg-violet-600 text-white",
    fallback: "S",
  },
  "verdant-pay": {
    className: "bg-lime-600 text-white",
    fallback: "V",
  },
  "maple-security": {
    className: "bg-orange-600 text-white",
    fallback: "M",
  },
  "orbit-fulfillment": {
    className: "bg-cyan-600 text-white",
    fallback: "O",
  },
  "blueforge-labs": {
    className: "bg-blue-600 text-white",
    fallback: "B",
  },
  "helios-energy": {
    className: "bg-teal-600 text-white",
    fallback: "H",
  },
  "riverbank-insure": {
    className: "bg-slate-700 text-white",
    fallback: "R",
  },
  "nova-ops": {
    className: "bg-green-600 text-white",
    fallback: "N",
  },
  "pinecrest-media": {
    className: "bg-pink-600 text-white",
    fallback: "P",
  },
  "prism-health": {
    className: "bg-red-600 text-white",
    fallback: "P",
  },
  "apex-mobility": {
    className: "bg-indigo-600 text-white",
    fallback: "A",
  },
  "cloudmint-finance": {
    className: "bg-violet-700 text-white",
    fallback: "C",
  },
}

const DEFAULT_BRAND: CustomerBrandPresentation = {
  className: "bg-muted text-muted-foreground",
  fallback: "C",
}

export function getCustomerBrandPresentation(
  customerId: string,
  companyName: string
) {
  const preset = CUSTOMER_BRAND_BY_ID[customerId]
  if (preset) return preset

  return {
    ...DEFAULT_BRAND,
    fallback: companyName.charAt(0).toUpperCase() || DEFAULT_BRAND.fallback,
  }
}

