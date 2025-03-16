import { Pool } from 'pg'
import { Category, getProductCategories } from './categories'

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
}

export function formatProductUrl(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function listNeonProducts(options: {
  limit?: number;
  offset?: number;
  categoryId?: number;
} = {}): Promise<{ products: NeonProduct[]; count: number }> {
  console.log('Starting listNeonProducts');
  const client = await pool.connect()
  try {
    const { limit, offset = 0, categoryId } = options

    let categoryIds = [categoryId];
    
    if (categoryId) {
      const subcategoriesQuery = 'SELECT category_id FROM category WHERE parent_category_id = $1';
      const subcategoriesResult = await client.query(subcategoriesQuery, [categoryId]);
      const subcategoryIds = subcategoriesResult.rows.map(row => row.category_id);
      categoryIds = categoryIds.concat(subcategoryIds);
    }

    const query = `
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
          ) FILTER (WHERE c.category_id IS NOT NULL) as categories
        FROM product p
        ${categoryId ? `
          LEFT JOIN product_category_map pcm ON p.product_id = pcm.product_id
          LEFT JOIN category c ON pcm.category_id = c.category_id
          WHERE p.status = 1 
          AND p.product_name IS NOT NULL
          AND pcm.category_id = ANY($1::int[])
        ` : `
          LEFT JOIN product_category_map pcm ON p.product_id = pcm.product_id
          LEFT JOIN category c ON pcm.category_id = c.category_id
          WHERE p.status = 1 
          AND p.product_name IS NOT NULL
        `}
        GROUP BY p.product_id
      )
      SELECT * FROM product_categories
      ORDER BY created_on DESC
      ${limit ? `LIMIT ${categoryId ? '$2' : '$1'}` : ''}
      ${offset ? `OFFSET ${categoryId ? '$3' : '$2'}` : ''}
    `

    const queryParams = []
    if (categoryId) queryParams.push(categoryIds)
    if (limit) queryParams.push(limit)
    if (offset) queryParams.push(offset)
    
    const result = await client.query(query, queryParams)

    if (!result.rows) {
      return { products: [], count: 0 }
    }

    const countQuery = `
      SELECT COUNT(DISTINCT p.product_id) as count
      FROM product p
      ${categoryId ? `
        LEFT JOIN product_category_map pcm ON p.product_id = pcm.product_id
        WHERE p.status = 1 
        AND p.product_name IS NOT NULL
        AND pcm.category_id = ANY($1::int[])
      ` : `
        WHERE p.status = 1 
        AND p.product_name IS NOT NULL
      `}
    `
    const countResult = await client.query(countQuery, categoryId ? [categoryIds] : [])
    const count = parseInt(countResult.rows[0].count) || 0

    const products: NeonProduct[] = result.rows.map(row => ({
      ...row,
      price: row.price_text || '0',
      old_price: row.old_price_text,
      categories: row.categories || []
    }))

    return { products, count }
  } catch (error) {
    console.error('Error in listNeonProducts:', error)
    throw error
  } finally {
    client.release()
  }
}

export async function getNeonProductByName(handle: string): Promise<NeonProduct | null> {
  if (!handle) {
    console.error('getNeonProductByName called with empty handle')
    return null
  }

  const client = await pool.connect()
  try {
    const normalizedHandle = handle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

    const query = `
      SELECT 
        p.*,
        CAST(p.price AS TEXT) as price_text,
        CAST(p.old_price AS TEXT) as old_price_text
      FROM product p
      WHERE p.status = 1 
        AND p.product_name IS NOT NULL
        AND p.product_id IN (
          SELECT product_id 
          FROM product 
          WHERE LOWER(REPLACE(REGEXP_REPLACE(product_name, '[^a-zA-Z0-9]+', '-', 'g'), '--', '-')) = LOWER($1)
        )
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
    const categoriesResult = await client.query(categoriesQuery, [result.rows[0].product_id])
    
    return {
      ...result.rows[0],
      price: result.rows[0].price_text || '0',
      old_price: result.rows[0].old_price_text,
      categories: categoriesResult.rows || []
    }
  } catch (error) {
    console.error('Error in getNeonProductByName:', error, '\nHandle:', handle)
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
        CAST(p.old_price AS TEXT) as old_price_text
      FROM product p
      WHERE p.product_id = $1
    `
    const result = await client.query(query, [id])
    
    if (!result.rows[0]) {
      return null
    }
    
    return {
      ...result.rows[0],
      price: result.rows[0].price_text || '0',
      old_price: result.rows[0].old_price_text
    }
  } finally {
    client.release()
  }
}

export async function getRelatedNeonProducts(product: NeonProduct): Promise<NeonProduct[]> {
  const relatedIds = [
    product.matching_product_id1,
    product.matching_product_id2,
    product.matching_product_id3
  ].filter(id => id !== null)

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

  return rows.map(row => ({
    ...row,
    price: row.price_text || '0',
    old_price: row.old_price_text
  }))
} 