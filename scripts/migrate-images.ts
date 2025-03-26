const { put } = require("@vercel/blob")
const { readdir, readFile } = require("fs/promises")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

interface UrlMapping {
  [key: string]: string
}

// Function to recursively get all files from a directory
async function getAllFiles(dir: string): Promise<string[]> {
  const files = await readdir(dir)
  const allFiles: string[] = []

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = await fs.promises.stat(filePath)

    if (stat.isDirectory()) {
      const subFiles = await getAllFiles(filePath)
      allFiles.push(...subFiles)
    } else {
      allFiles.push(filePath)
    }
  }

  return allFiles
}

async function migrateImages() {
  try {
    // Path to your images
    const productsPath = path.join(
      process.cwd(),
      "public",
      "images",
      "products"
    )
    const artisansPath = path.join(
      process.cwd(),
      "public",
      "images",
      "artisans"
    )

    // Create a file to store the URLs
    const urlMappingFile = path.join(process.cwd(), "image-urls.json")
    const urlMapping: UrlMapping = {}

    // Get all image files recursively
    const productFiles = await getAllFiles(productsPath)
    const artisanFiles = await getAllFiles(artisansPath)

    console.log(
      `Found ${productFiles.length} product files and ${artisanFiles.length} artisan files`
    )

    // Migrate product images
    console.log("\nUploading product images...")
    for (const filePath of productFiles) {
      try {
        const relativePath = path.relative(productsPath, filePath)
        const fileContent = await readFile(filePath)

        const blob = await put(relativePath, fileContent, {
          access: "public",
          addRandomSuffix: false, // Keep original filename
        })

        urlMapping[`products/${relativePath}`] = blob.url
        console.log(`✓ Uploaded product image: ${relativePath} -> ${blob.url}`)
      } catch (error) {
        console.error(`✗ Failed to upload ${filePath}:`, error)
      }
    }

    // Migrate artisan images
    console.log("\nUploading artisan images...")
    for (const filePath of artisanFiles) {
      try {
        const relativePath = path.relative(artisansPath, filePath)
        const fileContent = await readFile(filePath)

        const blob = await put(relativePath, fileContent, {
          access: "public",
          addRandomSuffix: false, // Keep original filename
        })

        urlMapping[`artisans/${relativePath}`] = blob.url
        console.log(`✓ Uploaded artisan image: ${relativePath} -> ${blob.url}`)
      } catch (error) {
        console.error(`✗ Failed to upload ${filePath}:`, error)
      }
    }

    // Save URL mapping to file
    fs.writeFileSync(urlMappingFile, JSON.stringify(urlMapping, null, 2))
    console.log(`\nMigration completed! URL mapping saved to ${urlMappingFile}`)
  } catch (error) {
    console.error("Migration failed:", error)
  }
}

migrateImages()
