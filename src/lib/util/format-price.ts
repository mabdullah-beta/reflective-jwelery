export type PriceDisplay = {
  display: "Call for Pricing" | "Price"
  value: string
  parsedValue: number
}

export function formatPrice(price: string | null): PriceDisplay {
  if (!price || price.trim() === "" || price === "null") {
    return {
      display: "Call for Pricing",
      value: "Call for Pricing",
      parsedValue: 0,
    }
  }

  const parsedPrice = parseFloat(price.replace(/[^0-9.-]+/g, ""))

  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return {
      display: "Call for Pricing",
      value: "Call for Pricing",
      parsedValue: 0,
    }
  }

  return {
    display: "Price",
    value: parsedPrice.toFixed(2),
    parsedValue: parsedPrice,
  }
}

export function formatOldPrice(price: string | null): string | null {
  if (!price || price.trim() === "" || price === "null") {
    return null
  }

  const parsedPrice = parseFloat(price.replace(/[^0-9.-]+/g, ""))

  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return null
  }

  return parsedPrice.toFixed(2)
}
