import { Metadata } from "next"
import Hero from "@modules/home/components/hero"
import { listNeonProducts, NeonProduct } from "@lib/data/neon-products"
import NeonProductPreview from "@modules/products/components/neon-product-preview"

export const metadata: Metadata = {
  title: "Reflective Jewelry Store",
  description: "Browse our collection of beautiful jewelry pieces.",
}

export default async function Home() {
  console.log('Starting Home page render');
  let products: NeonProduct[] = [];

  try {
    console.log('Calling listNeonProducts');
    const result = await listNeonProducts({ limit: 6 });
    console.log('Raw API Response:', JSON.stringify(result, null, 2));

    if (!result) {
      console.log('No result returned');
      throw new Error('No result returned from listNeonProducts');
    }

    products = result.products || [];
    console.log('Successfully assigned products array, length:', products.length);

    return (
      <>
        <Hero />
        <div className="py-12">
          <div className="content-container">
            <div className="flex flex-col items-center text-center mb-16">
              <h2 className="text-2xl-semi">Latest Products</h2>
              <p className="text-base-regular text-gray-600 mt-2">
                Check out our newest jewelry pieces
              </p>
            </div>
            {products.length > 0 ? (
              <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-4 gap-y-8">
                {products.map((product: NeonProduct) => (
                  <li key={product.product_id}>
                    <NeonProductPreview {...product} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center text-center">
                <p className="text-base-regular text-gray-600">
                  No products available at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </>
    )
  } catch (error) {
    console.error('Error in Home page:', error);
    return (
      <>
        <Hero />
        <div className="py-12">
          <div className="content-container">
            <div className="flex flex-col items-center text-center">
              <p className="text-base-regular text-gray-600">
                Unable to load products. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </>
    )
  }
}
