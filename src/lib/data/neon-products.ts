import { Pool } from "pg"
import { Category, getProductCategories } from "./categories"
import { formatProductUrl } from "../util/format-product-url"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export type NeonProduct = {
  product_id: number
  product_name: string
  full_description: string | null
  price: string
  price_backup?: string | null
  old_price: string | null
  notify_admin_for_quantity_below?: number | null
  weight?: number | null
  free_shipping: number
  price_1507300013?: string | null
  stock_quantity: number | null
  top_seller?: boolean | null
  rij_favorite?: boolean | null
  ref_id?: string | null
  matching_product_id1: number | null
  matching_product_id2: number | null
  matching_product_id3: number | null
  status: number
  sku_number: string | null
  meta_keywords?: string | null
  meta_description?: string | null
  meta_title?: string | null
  brand?: string | null
  addtn_attributes?: string | null
  dimension: string | null
  dimension_name: string | null
  for_gender: string | null
  size?: string | null
  size_unit?: string | null
  source?: string | null
  metal_string_temp?: string | null
  created_on: Date
  updated_on: Date
  categories?: Category[]
  tags?: string[]
  options?: ProductOption[]
  images?: {
    media_id: number
    filename: string
    media_desc: string
    file_path: string
    media_caption: string | null
    picture_tag: string | null
    brand: string | null
  }[]
}

export type ProductOption = {
  option_id: number
  option_name: string
  option_code: string
  display_name: string
  display_order: number
  brand?: string
  values: ProductOptionValue[]
}

export type ProductOptionValue = {
  option_value_id: number
  option_value_name: string
  option_value_code: string
  option_value_code2?: string
  display_name: string
  option_value_abbreviation: string
  option_value_abbreviation2?: string
  price_adjustment: string
  price_adjustment_addtn?: string
  price_adjustment_type: string
  apply_sale: boolean
  display_order: number
}

export type ListNeonProductsParams = {
  limit?: number
  offset?: number
  categoryId?: number
  search?: string
  sortBy?: string
}

export async function listNeonProducts({
  limit,
  offset = 0,
  categoryId,
  search,
  sortBy = "created_on",
}: ListNeonProductsParams = {}): Promise<{
  products: NeonProduct[]
  count: number
}> {
  const client = await pool.connect()
  try {
    let queryParams: any[] = []
    let paramCounter = 1

    const baseQuery = `
      WITH product_categories AS (
        SELECT 
          p.*,
          CAST(p.price AS TEXT) as price_text,
          CAST(p.old_price AS TEXT) as old_price_text,
          jsonb_agg(
            DISTINCT jsonb_build_object(
              'category_id', c.category_id,
              'category_name', c.category_name,
              'parent_category_id', c.parent_category_id
            )
          ) FILTER (WHERE c.category_id IS NOT NULL) as categories,
          jsonb_agg(
            DISTINCT jsonb_build_object(
              'media_id', m.media_id,
              'filename', m.filename,
              'media_desc', m.media_desc,
              'file_path', m.file_path,
              'media_caption', m.media_caption,
              'picture_tag', m.picture_tag,
              'brand', m.brand
            )
          ) FILTER (WHERE m.media_id IS NOT NULL) as images
        FROM product p
        LEFT JOIN product_category_map pcm ON p.product_id = pcm.product_id
        LEFT JOIN category c ON pcm.category_id = c.category_id
        LEFT JOIN product_media_map pmm ON p.product_id = pmm.product_id
        LEFT JOIN media m ON pmm.media_id = m.media_id
        WHERE p.status = 1 
        AND p.product_name IS NOT NULL
        AND TRIM(p.product_name) != ''
    `

    let whereClause = ""
    if (categoryId) {
      whereClause += ` AND pcm.category_id = $${paramCounter}`
      queryParams.push(categoryId)
      paramCounter++
    }

    if (search) {
      whereClause += ` AND (
        p.product_name ILIKE $${paramCounter}
        OR p.full_description ILIKE $${paramCounter}
        OR p.sku_number ILIKE $${paramCounter}
        OR p.brand ILIKE $${paramCounter}
        OR p.meta_keywords ILIKE $${paramCounter}
        OR p.meta_description ILIKE $${paramCounter}
        OR p.meta_title ILIKE $${paramCounter}
        OR p.dimension ILIKE $${paramCounter}
        OR p.dimension_name ILIKE $${paramCounter}
        OR p.size ILIKE $${paramCounter}
        OR p.for_gender ILIKE $${paramCounter}
        OR p.source ILIKE $${paramCounter}
        OR p.metal_string_temp ILIKE $${paramCounter}
        OR p.addtn_attributes ILIKE $${paramCounter}
      )`
      queryParams.push(`%${search}%`)
      paramCounter++
    }

    // Build the main query
    let mainQuery = `
      ${baseQuery}
      ${whereClause}
      GROUP BY p.product_id
      )
      SELECT * FROM product_categories
      ORDER BY ${sortBy} DESC
    `

    // Add pagination only if limit is provided
    const paginationParams: any[] = []
    if (typeof limit === "number") {
      mainQuery += ` LIMIT $${paramCounter}`
      paginationParams.push(limit)
      paramCounter++

      // Only add offset if limit is also provided
      if (typeof offset === "number" && offset > 0) {
        mainQuery += ` OFFSET $${paramCounter}`
        paginationParams.push(offset)
        paramCounter++
      }
    }

    // Combine all parameters
    const mainQueryParams = [...queryParams, ...paginationParams]
    const result = await client.query(mainQuery, mainQueryParams)

    // Log the results for debugging
    console.log(
      "Products with null or empty names:",
      result.rows.filter((p) => !p.product_name || p.product_name.trim() === "")
    )

    // Count query (excluding pagination parameters)
    const countQuery = `
      SELECT COUNT(DISTINCT p.product_id) as count
      FROM product p
      LEFT JOIN product_category_map pcm ON p.product_id = pcm.product_id
      WHERE p.status = 1 
      AND p.product_name IS NOT NULL
      ${whereClause}
    `

    const countResult = await client.query(countQuery, queryParams)
    const count = parseInt(countResult.rows[0].count) || 0

    const products: NeonProduct[] = result.rows.map((row) => ({
      ...row,
      price: row.price_text || null,
      old_price: row.old_price_text,
      categories: row.categories || [],
      images: row.images || [],
    }))

    return { products, count }
  } catch (error) {
    console.error("Error in listNeonProducts:", error)
    return { products: [], count: 0 }
  } finally {
    client.release()
  }
}

export async function getNeonProductByName(
  handle: string
): Promise<NeonProduct | null> {
  if (!handle) {
    console.error("getNeonProductByName called with empty handle")
    return null
  }

  const client = await pool.connect()
  try {
    const normalizedHandle = handle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    const query = `
      SELECT 
        p.*,
        CAST(p.price AS TEXT) as price_text,
        CAST(p.old_price AS TEXT) as old_price_text,
        jsonb_agg(
          DISTINCT jsonb_build_object(
            'media_id', m.media_id,
            'filename', m.filename,
            'media_desc', m.media_desc,
            'file_path', m.file_path,
            'media_caption', m.media_caption,
            'picture_tag', m.picture_tag,
            'brand', m.brand
          )
        ) FILTER (WHERE m.media_id IS NOT NULL) as images
      FROM product p
      LEFT JOIN product_media_map pmm ON p.product_id = pmm.product_id
      LEFT JOIN media m ON pmm.media_id = m.media_id
      WHERE p.status = 1 
        AND p.product_name IS NOT NULL
        AND p.product_id IN (
          SELECT product_id 
          FROM product 
          WHERE LOWER(REPLACE(REGEXP_REPLACE(product_name, '[^a-zA-Z0-9]+', '-', 'g'), '--', '-')) = LOWER($1)
        )
      GROUP BY p.product_id
      LIMIT 1
    `

    const result = await client.query(query, [normalizedHandle])

    if (!result.rows[0]) {
      return null
    }

    const categoriesQuery = `
      SELECT 
        c.category_id,
        c.category_name,
        c.parent_category_id
      FROM category c
      JOIN product_category_map pcm ON c.category_id = pcm.category_id
      WHERE pcm.product_id = $1
    `
    const categoriesResult = await client.query(categoriesQuery, [
      result.rows[0].product_id,
    ])

    return {
      ...result.rows[0],
      price: result.rows[0].price_text || null,
      old_price: result.rows[0].old_price_text,
      categories: categoriesResult.rows || [],
      images: result.rows[0].images || [],
    }
  } catch (error) {
    console.error("Error in getNeonProductByName:", error, "\nHandle:", handle)
    throw error
  } finally {
    client.release()
  }
}

export async function getNeonProduct(id: number): Promise<NeonProduct | null> {
  const client = await pool.connect()
  try {
    const query = `
      SELECT 
        p.*,
        CAST(p.price AS TEXT) as price_text,
        CAST(p.old_price AS TEXT) as old_price_text,
        jsonb_agg(
          DISTINCT jsonb_build_object(
            'media_id', m.media_id,
            'filename', m.filename,
            'media_desc', m.media_desc,
            'file_path', m.file_path,
            'media_caption', m.media_caption,
            'picture_tag', m.picture_tag,
            'brand', m.brand
          )
        ) FILTER (WHERE m.media_id IS NOT NULL) as images
      FROM product p
      LEFT JOIN product_media_map pmm ON p.product_id = pmm.product_id
      LEFT JOIN media m ON pmm.media_id = m.media_id
      WHERE p.product_id = $1
      GROUP BY p.product_id
    `
    const result = await client.query(query, [id])

    if (!result.rows[0]) {
      return null
    }

    const product = {
      ...result.rows[0],
      price: result.rows[0].price_text || null,
      old_price: result.rows[0].old_price_text,
      images: result.rows[0].images || [],
    }

    // Fetch tags and options
    const [tags, options] = await Promise.all([
      getProductTags(id),
      getProductOptions(id),
    ])

    return {
      ...product,
      tags,
      options,
    }
  } finally {
    client.release()
  }
}

export async function getRelatedNeonProducts(
  product: NeonProduct
): Promise<NeonProduct[]> {
  const relatedIds = [
    product.matching_product_id1,
    product.matching_product_id2,
    product.matching_product_id3,
  ].filter((id) => id !== null)

  if (relatedIds.length === 0) {
    return []
  }

  const { rows } = await pool.query(
    `SELECT 
      p.*,
      CAST(p.price AS TEXT) as price_text,
      CAST(p.old_price AS TEXT) as old_price_text
    FROM product p
    WHERE p.product_id = ANY($1)`,
    [relatedIds]
  )

  return rows.map((row) => ({
    ...row,
    price: row.price_text || "0",
    old_price: row.old_price_text,
  }))
}

export async function getProductTags(productId: number): Promise<string[]> {
  const client = await pool.connect()
  try {
    const query = `
      SELECT tag_name 
      FROM product_tag_map 
      WHERE product_id = $1
      ORDER BY tag_name
    `
    const result = await client.query(query, [productId])
    return result.rows.map((row) => row.tag_name)
  } finally {
    client.release()
  }
}

export async function getProductOptions(
  productId: number
): Promise<ProductOption[]> {
  const client = await pool.connect()
  try {
    // First get all options for the product
    const optionsQuery = `
      SELECT DISTINCT 
        mo.option_id,
        mo.option_name,
        mo.option_code,
        mo.display_name,
        mo.display_order,
        mo.brand
      FROM master_option mo
      JOIN master_option_value mov ON mo.option_id = mov.option_id
      WHERE EXISTS (
        SELECT 1 
        FROM product_option_map pom 
        WHERE pom.product_id = $1 
        AND pom.option_id = mo.option_id
      )
      ORDER BY mo.display_order
    `
    const optionsResult = await client.query(optionsQuery, [productId])

    // Then get all option values for these options
    const options: ProductOption[] = []
    for (const option of optionsResult.rows) {
      const valuesQuery = `
        SELECT 
          option_value_id,
          option_value_name,
          option_value_code,
          option_value_code2,
          display_name,
          option_value_abbreviation,
          option_value_abbreviation2,
          CAST(price_adjustment AS TEXT) as price_adjustment,
          CAST(price_adjustment_addtn AS TEXT) as price_adjustment_addtn,
          price_adjustment_type,
          apply_sale,
          display_order
        FROM master_option_value
        WHERE option_id = $1
        ORDER BY display_order
      `
      const valuesResult = await client.query(valuesQuery, [option.option_id])

      options.push({
        ...option,
        values: valuesResult.rows.map((row) => ({
          ...row,
          apply_sale: row.apply_sale === 1,
          price_adjustment: row.price_adjustment || "0",
          price_adjustment_addtn: row.price_adjustment_addtn,
        })),
      })
    }

    return options
  } finally {
    client.release()
  }
}
