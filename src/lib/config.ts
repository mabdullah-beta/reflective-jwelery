import Medusa from "@medusajs/js-sdk"

// Disable Medusa backend connection
const MEDUSA_BACKEND_URL = ""

export const sdk = {
  client: {
    fetch: async () => {
      // Return empty data to prevent errors
      return Promise.resolve({ regions: [], collections: [], customer: null })
    }
  }
}
