"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useRef, useState } from "react"
import { getNeonCart, removeFromNeonCart } from "@lib/data/neon-cart"
import { formatPrice } from "@lib/util/format-price"
import Spinner from "@modules/common/icons/spinner"
import { formatProductUrl } from "@lib/util/format-product-url"
import Image from "next/image"
import { getImageUrl } from "@lib/util/get-image-url"

// Custom event for cart updates
const CART_UPDATE_EVENT = "neon-cart-update"

const NeonCartDropdown = () => {
  const [cart, setCart] = useState<any>(null)
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timer | undefined>(
    undefined
  )
  const [updating, setUpdating] = useState(false)
  const pollingInterval = useRef<NodeJS.Timer>()

  const open = () => setCartDropdownOpen(true)
  const close = () => setCartDropdownOpen(false)

  const loadCart = async () => {
    const cartData = await getNeonCart()
    setCart(cartData)
  }

  // Set up polling and event listeners
  useEffect(() => {
    // Initial load
    loadCart()

    // Set up polling every 2 seconds
    pollingInterval.current = setInterval(loadCart, 2000)

    // Set up custom event listener
    const handleCartUpdate = (event: CustomEvent) => {
      loadCart()
    }
    window.addEventListener(
      CART_UPDATE_EVENT,
      handleCartUpdate as EventListener
    )

    // Cleanup
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current)
      }
      window.removeEventListener(
        CART_UPDATE_EVENT,
        handleCartUpdate as EventListener
      )
    }
  }, [])

  const totalItems =
    cart?.items?.reduce((acc: number, item: any) => {
      return acc + item.quantity
    }, 0) || 0

  const subtotal = cart?.total || 0
  const itemRef = useRef<number>(totalItems || 0)

  const timedOpen = () => {
    open()
    const timer = setTimeout(close, 5000)
    setActiveTimer(timer)
  }

  const openAndCancel = () => {
    if (activeTimer) {
      clearTimeout(activeTimer)
    }
    open()
  }

  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer)
      }
    }
  }, [activeTimer])

  const pathname = usePathname()

  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      timedOpen()
    }
    itemRef.current = totalItems
  }, [totalItems, pathname])

  const handleRemoveItem = async (productId: string) => {
    setUpdating(true)
    try {
      await removeFromNeonCart(productId)
      await loadCart()
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent(CART_UPDATE_EVENT))
    } catch (error) {
      console.error("Error removing item:", error)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div
      className="h-full z-50"
      onMouseEnter={openAndCancel}
      onMouseLeave={close}
    >
      <Popover className="relative h-full">
        <PopoverButton className="h-full">
          <LocalizedClientLink
            className="hover:text-ui-fg-base flex items-center gap-x-2"
            href="/store/cart"
            data-testid="nav-cart-link"
          >
            <span className="text-sm">Cart</span>
            {totalItems > 0 && (
              <span className="bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {totalItems}
              </span>
            )}
          </LocalizedClientLink>
        </PopoverButton>
        <Transition
          show={cartDropdownOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel
            static
            className="hidden small:block absolute top-[calc(100%+1px)] right-0 bg-white border border-gray-200 w-[382px] text-gray-900 shadow-lg rounded-lg"
          >
            <div className="p-4 flex items-center justify-center border-b border-gray-100">
              <h3 className="text-large-semi">Shopping Bag</h3>
            </div>
            {cart && cart.items?.length > 0 ? (
              <>
                <div className="overflow-y-scroll max-h-[402px] px-4 grid grid-cols-1 gap-y-8 no-scrollbar py-4">
                  {cart.items.map((item: any) => (
                    <div
                      className="grid grid-cols-[80px_1fr] gap-x-4"
                      key={item.product_id}
                    >
                      <LocalizedClientLink
                        href={`/store/products/${formatProductUrl(
                          item.product_name
                        )}`}
                        className="w-20"
                      >
                        <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center relative">
                          {(() => {
                            const imageUrl = item.images?.[0]
                              ? getImageUrl(item.images[0])
                              : item.thumbnail
                            if (!imageUrl) {
                              return (
                                <span className="text-gray-400 text-sm">
                                  No image
                                </span>
                              )
                            }
                            return (
                              <Image
                                src={imageUrl}
                                alt={item.product_name}
                                fill
                                className="object-cover rounded-md"
                                sizes="80px"
                              />
                            )
                          })()}
                        </div>
                      </LocalizedClientLink>
                      <div className="flex flex-col justify-between flex-1">
                        <div>
                          <LocalizedClientLink
                            href={`/store/products/${formatProductUrl(
                              item.product_name
                            )}`}
                            className="text-gray-900 font-medium hover:text-gray-700"
                          >
                            {item.product_name}
                          </LocalizedClientLink>
                          <p className="text-gray-500 text-sm mt-1">
                            Quantity: {item.quantity}
                          </p>
                          <p className="text-gray-900 font-medium mt-1">
                            ${formatPrice(item.price.toString()).value}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.product_id)}
                          className="text-gray-500 hover:text-red-500 text-sm font-medium transition-colors flex items-center gap-x-1 disabled:opacity-50"
                          disabled={updating}
                        >
                          {updating ? (
                            <Spinner />
                          ) : (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Remove
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600 text-sm">Subtotal</span>
                    <span className="text-gray-900 font-medium">
                      ${formatPrice(subtotal.toString()).value}
                    </span>
                  </div>
                  <div onClick={close}>
                    <LocalizedClientLink
                      href="/store/checkout"
                      className="bg-black text-white w-full py-2 px-4 rounded-md text-center font-medium hover:bg-gray-900 transition-colors inline-block"
                    >
                      Proceed to Checkout
                    </LocalizedClientLink>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex py-16 flex-col gap-y-4 items-center justify-center">
                <div className="bg-gray-900 text-white flex items-center justify-center w-6 h-6 rounded-full text-small-regular">
                  <span>0</span>
                </div>
                <span>Your shopping bag is empty.</span>
                <div onClick={close}>
                  <LocalizedClientLink
                    href="/store"
                    className="bg-black text-white px-4 py-2 rounded-md text-center font-medium hover:bg-gray-900 transition-colors"
                  >
                    Explore Products
                  </LocalizedClientLink>
                </div>
              </div>
            )}
          </PopoverPanel>
        </Transition>
      </Popover>
    </div>
  )
}

export default NeonCartDropdown
