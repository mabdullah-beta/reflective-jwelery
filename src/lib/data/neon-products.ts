import { Pool } from 'pg'
import { Category, getProductCategories } from './categories'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export type NeonProduct = {
  id: number
  product_id: number
  product_name: string
  full_description: string | null
  price: string
  old_price: string | null
  stock_quantity: number | null
  created_on: Date
  updated_on: Date
  matching_product_id1: number | null
  matching_product_id2: number | null
  matching_product_id3: number | null
  status: number
  dimension: string | null
  dimension_name: string | null
  sku_number: string | null
  free_shipping: number
  for_gender: string | null
  categories?: Category[]
}

export function formatProductUrl(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function listNeonProducts(limit?: number): Promise<NeonProduct[]> {
  const client = await pool.connect()
  try {
    const query = limit 
      ? 'SELECT *, CAST(price AS TEXT) as price, COALESCE(dimension, \'\') as dimension, COALESCE(dimension_name, \'\') as dimension_name, COALESCE(sku_number, \'\') as sku_number, COALESCE(free_shipping, 0) as free_shipping, COALESCE(for_gender, \'\') as for_gender FROM product WHERE status = 1 AND product_name IS NOT NULL ORDER BY created_on DESC LIMIT $1'
      : 'SELECT *, CAST(price AS TEXT) as price, COALESCE(dimension, \'\') as dimension, COALESCE(dimension_name, \'\') as dimension_name, COALESCE(sku_number, \'\') as sku_number, COALESCE(free_shipping, 0) as free_shipping, COALESCE(for_gender, \'\') as for_gender FROM product WHERE status = 1 AND product_name IS NOT NULL ORDER BY created_on DESC'
    
    const values = limit ? [limit] : undefined
    console.log('Executing query:', query)
    console.log('With values:', values)
    
    const result = await client.query(values ? { text: query, values } : query)
    console.log('Database Results:', JSON.stringify(result.rows, null, 2))
    
    // Fetch categories for each product
    const productsWithCategories = await Promise.all(
      result.rows.map(async (product) => {
        const categories = await getProductCategories(product.product_id)
        return { ...product, categories }
      })
    )
    
    return productsWithCategories
  } finally {
    client.release()
  }
}

export async function getNeonProductByName(handle: string): Promise<NeonProduct | null> {
  const client = await pool.connect()
  try {
    // First get all products
    const result = await client.query('SELECT *, CAST(price AS TEXT) as price, COALESCE(dimension, \'\') as dimension, COALESCE(dimension_name, \'\') as dimension_name, COALESCE(sku_number, \'\') as sku_number, COALESCE(free_shipping, 0) as free_shipping, COALESCE(for_gender, \'\') as for_gender FROM product WHERE status = 1 AND product_name IS NOT NULL')
    
    // Then find the one where the formatted name matches the handle
    const product = result.rows.find(
      (product) => formatProductUrl(product.product_name) === handle
    )
    
    if (product) {
      // Fetch categories for the product
      const categories = await getProductCategories(product.product_id)
      return { ...product, categories }
    }
    
    return null
  } finally {
    client.release()
  }
}

export async function getNeonProduct(id: number): Promise<NeonProduct | null> {
  const client = await pool.connect()
  try {
    const query = 'SELECT *, CAST(price AS TEXT) as price, COALESCE(dimension, \'\') as dimension, COALESCE(dimension_name, \'\') as dimension_name, COALESCE(sku_number, \'\') as sku_number, COALESCE(free_shipping, 0) as free_shipping, COALESCE(for_gender, \'\') as for_gender FROM product WHERE product_id = $1'
    const result = await client.query(query, [id])
    return result.rows[0] || null
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
    'SELECT *, CAST(price AS TEXT) as price FROM product WHERE product_id = ANY($1)',
    [relatedIds]
  )

  return rows
} 