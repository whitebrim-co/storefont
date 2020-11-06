import { FC, useState } from 'react'
import cn from 'classnames'
import Image from 'next/image'
import { NextSeo } from 'next-seo'

import s from './ProductView.module.css'
import { useUI } from '@components/ui/context'
import { Swatch, ProductSlider } from '@components/product'
import { Button, Container } from '@components/ui'
import { HTMLContent } from '@components/core'
// import WishlistButton from '@components/wishlist/WishlistButton'

import {
  // getCurrentVariant,
  // getProductOptions,
  SelectedOptions,
} from '../helpers'

import { addToCart } from 'whitebrim'

interface Props {
  className?: string
  children?: any
  product: any
}

const ProductView: FC<Props> = ({ product }) => {
  const { openSidebar } = useUI()
  const options: any[] = []
  const [loading, setLoading] = useState(false)
  const [choices, setChoices] = useState<SelectedOptions>({
    size: null,
    color: null,
  })

  const addItemToCart = () => {
    setLoading(true)
    let submitValues = {
      addons: [],
      customizations: [],
      model_id: product._id,
      model_name: product.model_name,
      quantity: 1,
      userId: null, // USER ID
    }
    addToCart(submitValues)
      .then((response) => {
        if (response.status === 200) {
          openSidebar()
          setLoading(false)
        } else if (response.status === 304) {
          setLoading(false)
        }
      })
      .catch((err) => {
        if (err && err.response && err.response.status === 304) {
          setLoading(false)
        } else {
          setLoading(false)
        }
      })
  }

  const variant = false

  return (
    <Container className="max-w-none w-full" clean>
      <NextSeo
        title={product.name}
        description={product.description}
        openGraph={{
          type: 'website',
          title: product.name,
          description: product.description,
          images: [
            {
              url: `https:${product.photo.url}`,
              width: 800,
              height: 600,
              alt: product.name,
            },
          ],
        }}
      />
      <div className={cn(s.root, 'fit')}>
        <div className={cn(s.productDisplay, 'fit')}>
          <div className={s.nameBox}>
            <h1 className={s.name}>{product.name}</h1>
            <div className={s.price}>
              {product.price}
              {` `}€
            </div>
          </div>

          <div className={s.sliderContainer}>
            <ProductSlider>
              {product.gallery &&
                product.gallery.map((image: { url: string }, i: number) => (
                  <div key={image.url} className={s.imageContainer}>
                    <Image
                      className={s.img}
                      src={`https:${image.url}`}
                      alt={'Product Image'}
                      width={1050}
                      height={1050}
                      priority={i === 0}
                      quality="85"
                    />
                  </div>
                ))}
            </ProductSlider>
          </div>
        </div>

        <div className={s.sidebar}>
          <section>
            {options?.map((opt: any) => (
              <div className="pb-4" key={opt.displayName}>
                <h2 className="uppercase font-medium">{opt.displayName}</h2>
                <div className="flex flex-row py-4">
                  {opt.values.map((v: any, i: number) => {
                    const active = (choices as any)[opt.displayName]

                    return (
                      <Swatch
                        key={`${v.entityId}-${i}`}
                        active={v.label === active}
                        variant={opt.displayName}
                        color={v.hexColors ? v.hexColors[0] : ''}
                        label={v.label}
                        onClick={() => {
                          setChoices((choices) => {
                            return {
                              ...choices,
                              [opt.displayName]: v.label,
                            }
                          })
                        }}
                      />
                    )
                  })}
                </div>
              </div>
            ))}

            <div className="pb-14 break-words w-full max-w-xl">
              <HTMLContent html={product.description} />
            </div>
          </section>
          <div>
            <Button
              aria-label="Add to Cart"
              type="button"
              className={s.button}
              onClick={addItemToCart}
              loading={loading}
              disabled={!variant} // if (no variant selected and variantLength > 0)
            >
              Add to Cart
            </Button>
          </div>
        </div>

        {/* <WishlistButton
          className={s.wishlistButton}
          productId={product.entityId}
          variant={null}
        /> */}
      </div>
    </Container>
  )
}

export default ProductView
