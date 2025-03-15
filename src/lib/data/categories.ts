import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export type Category = {
  category_id: number
  parent_category_id: number | null
  category_name: string
}

export type ProductCategory = {
  product_id: number
  category_id: number
}

export async function getAllCategories(): Promise<Category[]> {
  const client = await pool.connect()
  try {
    const result = await client.query('SELECT * FROM category ORDER BY category_name')
    return result.rows
  } finally {
    client.release()
  }
}

export async function getCategoryById(categoryId: number): Promise<Category | null> {
  const client = await pool.connect()
  try {
    const result = await client.query('SELECT * FROM category WHERE category_id = $1', [categoryId])
    return result.rows[0] || null
  } finally {
    client.release()
  }
}

export async function getProductCategories(productId: number): Promise<Category[]> {
  const client = await pool.connect()
  try {
    const query = `
      SELECT c.* 
      FROM category c
      JOIN product_category_map pcm ON c.category_id = pcm.category_id
      WHERE pcm.product_id = $1
      ORDER BY c.category_name
    `
    const result = await client.query(query, [productId])
    return result.rows
  } finally {
    client.release()
  }
}

export async function getCategoryHierarchy(categoryId: number): Promise<Category[]> {
  const client = await pool.connect()
  try {
    // This query will get all parent categories up to the root
    const query = `
      WITH RECURSIVE category_hierarchy AS (
        -- Base case: start with the given category
        SELECT *, 1 as level
        FROM category
        WHERE category_id = $1
        
        UNION ALL
        
        -- Recursive case: join with parent categories
        SELECT c.*, ch.level + 1
        FROM category c
        JOIN category_hierarchy ch ON c.category_id = ch.parent_category_id
      )
      SELECT * FROM category_hierarchy ORDER BY level DESC;
    `
    const result = await client.query(query, [categoryId])
    return result.rows
  } finally {
    client.release()
  }
}

export async function getChildCategories(parentCategoryId: number): Promise<Category[]> {
  const client = await pool.connect()
  try {
    const result = await client.query(
      'SELECT * FROM category WHERE parent_category_id = $1 ORDER BY category_name',
      [parentCategoryId]
    )
    return result.rows
  } finally {
    client.release()
  }
}

export const listCategories = async (query?: Record<string, any>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category",
          limit,
          ...query,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories)
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "*category_children, *products",
          handle,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories[0])
}
