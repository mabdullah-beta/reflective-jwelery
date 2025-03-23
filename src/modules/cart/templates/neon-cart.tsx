import { Heading, Table, Text } from "@medusajs/ui"
import NeonCartItem from "@modules/cart/components/neon-cart-item"
import { getNeonCart } from "@lib/data/neon-cart"
import EmptyCartMessage from "../components/empty-cart-message"
import { formatPrice } from "@lib/util/format-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function NeonCartTemplate() {
  const cart = await getNeonCart()
  const formattedTotal = formatPrice(cart.total.toString())

  return (
    <div className="py-12">
      <div className="content-container">
        {cart.items.length ? (
          <div className="grid grid-cols-1 small:grid-cols-[1fr_360px] gap-x-8">
            <div className="flex flex-col bg-white p-6 gap-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <Heading className="text-2xl font-bold">Shopping Cart</Heading>
                <Text className="text-gray-600">
                  {cart.items.length}{" "}
                  {cart.items.length === 1 ? "item" : "items"}
                </Text>
              </div>
              <Table>
                <Table.Header className="border-t-0">
                  <Table.Row className="text-gray-600">
                    <Table.HeaderCell className="!pl-0 w-[100px]">
                      Product
                    </Table.HeaderCell>
                    <Table.HeaderCell className="w-full"></Table.HeaderCell>
                    <Table.HeaderCell className="text-right !pr-8">
                      Quantity
                    </Table.HeaderCell>
                    <Table.HeaderCell className="text-right">
                      Price
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {cart.items.map((item) => (
                    <NeonCartItem key={item.product_id} item={item} />
                  ))}
                </Table.Body>
              </Table>
            </div>

            <div className="mt-4 small:mt-0">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <Heading className="text-xl font-bold mb-4">
                  Order Summary
                </Heading>

                <div className="flex flex-col gap-y-4">
                  <div className="flex items-center justify-between">
                    <Text className="text-gray-600">Subtotal</Text>
                    <Text className="font-semibold">
                      ${formattedTotal.value}
                    </Text>
                  </div>

                  <div className="flex items-center justify-between">
                    <Text className="text-gray-600">Shipping</Text>
                    <Text className="font-semibold text-green-600">Free</Text>
                  </div>

                  <div className="h-px bg-gray-200 my-2"></div>

                  <div className="flex items-center justify-between">
                    <Text className="text-lg font-bold">Total</Text>
                    <Text className="text-lg font-bold">
                      ${formattedTotal.value}
                    </Text>
                  </div>

                  <LocalizedClientLink
                    href="/store/checkout"
                    className="bg-black text-white py-3 px-4 rounded-md text-center font-medium hover:bg-gray-900 transition-colors mt-4"
                  >
                    Proceed to Checkout
                  </LocalizedClientLink>

                  <LocalizedClientLink
                    href="/store"
                    className="text-center text-gray-600 hover:text-gray-900 transition-colors mt-2"
                  >
                    Continue Shopping
                  </LocalizedClientLink>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyCartMessage />
        )}
      </div>
    </div>
  )
}
