import { Pool } from "pg"
import fs from "fs"
import path from "path"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function verifyImages() {
  const client = await pool.connect()
  try {
    // Get all images from the database with product information
    const query = `
      SELECT 
        p.product_id,
        p.product_name,
        m.media_id,
        m.filename,
        m.media_desc,
        m.file_path,
        m.media_caption,
        m.picture_tag,
        m.brand,
        pmm.sort_order
      FROM product p
      JOIN product_media_map pmm ON p.product_id = pmm.product_id
      JOIN media m ON pmm.media_id = m.media_id
      WHERE p.status = 1
      ORDER BY p.product_id, pmm.sort_order
    `
    const result = await client.query(query)

    const publicDir = path.join(process.cwd(), "public")
    const productsDir = path.join(publicDir, "images", "products")
    const artisansDir = path.join(publicDir, "images", "artisans")

    // Ensure directories exist
    if (!fs.existsSync(productsDir)) {
      fs.mkdirSync(productsDir, { recursive: true })
    }
    if (!fs.existsSync(artisansDir)) {
      fs.mkdirSync(artisansDir, { recursive: true })
    }

    const missingFiles: any[] = []
    const existingFiles: any[] = []
    const productImageMap: { [key: string]: string[] } = {}

    result.rows.forEach((image) => {
      // Track which images belong to which products
      if (!productImageMap[image.product_id]) {
        productImageMap[image.product_id] = []
      }
      productImageMap[image.product_id].push(image.filename)

      const isArtisan = image.file_path.includes(
        "MerchantShoppingCartImages/MGenImages_1/"
      )
      const targetDir = isArtisan ? artisansDir : productsDir
      const expectedPath = path.join(targetDir, image.filename)

      if (!fs.existsSync(expectedPath)) {
        missingFiles.push({
          product_id: image.product_id,
          product_name: image.product_name,
          filename: image.filename,
          expectedPath: expectedPath,
          type: isArtisan ? "artisan" : "product",
          originalPath: image.file_path,
          sort_order: image.sort_order,
        })
      } else {
        existingFiles.push({
          product_id: image.product_id,
          product_name: image.product_name,
          filename: image.filename,
          path: expectedPath,
          type: isArtisan ? "artisan" : "product",
          sort_order: image.sort_order,
        })
      }
    })

    return {
      missingFiles,
      existingFiles,
      productImageMap,
      totalImages: result.rows.length,
      totalProducts: Object.keys(productImageMap).length,
    }
  } finally {
    client.release()
  }
}
