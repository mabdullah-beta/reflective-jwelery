// Import the image URL mapping
const imageUrlMap = require("../../../image-urls.json")

export const getImageUrl = (image: any) => {
  if (!image || typeof image !== "object") {
    console.log("No valid image data provided")
    return null
  }

  if (!image.filename || typeof image.filename !== "string") {
    console.log("No valid filename provided")
    return null
  }

  // Clean up the filename - remove any path-like characters and trim
  const cleanFilename = image.filename.trim().replace(/^[./\\]+/, "")

  // First check if we have a Vercel Blob URL for this image
  const blobUrl = imageUrlMap[`products/${cleanFilename}`]
  if (blobUrl) {
    console.log("Using Vercel Blob URL:", blobUrl)
    return blobUrl
  }

  // If no Blob URL found, try to find a matching key in the map
  const matchingKey = Object.keys(imageUrlMap).find((key) =>
    key.toLowerCase().includes(cleanFilename.toLowerCase())
  )

  if (matchingKey) {
    console.log("Found matching Blob URL:", imageUrlMap[matchingKey])
    return imageUrlMap[matchingKey]
  }

  // Fallback to local paths if no Blob URL exists
  if (
    image.file_path &&
    image.file_path.includes("MerchantShoppingCartImages/MGenImages_1/")
  ) {
    const url = `/images/artisans/${encodeURIComponent(cleanFilename)}`
    console.log("Fallback to local artisan image URL:", url)
    return url
  }

  const url = `/images/products/${encodeURIComponent(cleanFilename)}`
  console.log("Fallback to local product image URL:", url)
  return url
}
