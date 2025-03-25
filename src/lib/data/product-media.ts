import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function getProductMediaMapping() {
  const client = await pool.connect()
  try {
    const query = `
      SELECT 
        p.product_id,
        p.product_name,
        pmm.media_id,
        m.filename,
        m.file_path,
        pmm.sort_order,
        m.media_desc,
        m.picture_tag
      FROM product p
      JOIN product_media_map pmm ON p.product_id = pmm.product_id
      JOIN media m ON pmm.media_id = m.media_id
      WHERE p.status = 1
      ORDER BY p.product_id, pmm.sort_order;
    `
    const result = await client.query(query)
    return result.rows
  } finally {
    client.release()
  }
}
