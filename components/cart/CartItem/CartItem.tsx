import { useEffect, useState } from 'react'
import cn from 'classnames'
import Image from 'next/image'
import Link from 'next/link'

import { Trash, Plus, Minus } from '@components/icons'

import { addToCart, removeFromCart } from 'whitebrim'

import s from './CartItem.module.css'

const CartItem = (props: any) => {
  const [removing, setRemoving] = useState(false)
  const [quantity, setQuantity] = useState(props.item.quantity)

  useEffect(() => {
    // Reset the quantity state if the item quantity changes
    if (props.item.quantity !== Number(quantity)) {
      setQuantity(props.item.quantity)
    }
  }, [props.item.quantity])

  const increaseQuantity = (n = 1) => {
    const val = Number(quantity) + n

    if (Number.isInteger(val) && val >= 0) {
      if (quantity < val) {
        setQuantity(val)
        addItemToCart()
      } else {
        setQuantity(val)
        handleRemove(quantity - val)
      }
    }
  }

  const handleRemove = (removeVal: any) => {
    setRemoving(true)

    if (props.user) {
      let submitValues
      if (
        typeof props.item.variant !== 'undefined' &&
        props.item.variant !== null &&
        props.item.variant !== ''
      ) {
        submitValues = {
          addons: [],
          customizations: [],
          item_id: props.item._id,
          model_id: props.item.object_id,
          model_name: props.item.model_name,
          quantity: removeVal ? removeVal : 0,
          userId: props.user._id, // props. ID
          variant: props.item.variant._id, // SELECTED_VARIANT
        }
      } else {
        submitValues = {
          addons: [],
          customizations: [],
          item_id: props.item._id,
          model_id: props.item.object_id,
          model_name: props.item.model_name,
          quantity: removeVal ? removeVal : 0,
          userId: props.user._id, // USER ID
          variant: null,
        }
      }
      removeFromCart(submitValues)
        .then((response) => {
          if (response.status === 200) {
            let newUser = {
              ...props.user,
              cart: response.data.cart,
            }
            props.setUser(newUser)
            setRemoving(false)
          }
        })
        .catch((err) => {
          console.log(err.response)
        })
    }
  }

  const addItemToCart = () => {
    if (props.user) {
      let submitValues

      if (
        typeof props.item.variant !== 'undefined' &&
        props.item.variant !== null &&
        props.item.variant !== ''
      ) {
        submitValues = {
          addons: [],
          customizations: [],
          model_id: props.item._id,
          model_name: props.item.model_name,
          quantity: 1,
          variant: props.item.variant, // SELECTED_VARIANT
          userId: props.user._id, // USER ID
        }
      } else {
        submitValues = {
          addons: [],
          customizations: [],
          model_id: props.item._id,
          model_name: props.item.model_name,
          quantity: 1,
          userId: props.user._id, // USER ID
        }
      }

      addToCart(submitValues)
        .then((response) => {
          if (response.status === 200) {
            let newUser = {
              ...props.user,
              cart: response.data,
            }
            props.setUser(newUser)
          } else if (response.status === 304) {
          }
        })
        .catch((err) => {
          if (err && err.response && err.response.status === 304) {
            console.log(err)
          } else {
            console.log(err)
          }
        })
    }
  }

  return (
    <li
      className={cn('flex flex-row space-x-8 py-8', {
        'opacity-75 pointer-events-none': removing,
      })}
    >
      <div className="w-16 h-16 bg-violet relative overflow-hidden">
        <Image
          className={s.productImage}
          src={`${props.item.photo.url}`}
          width={150}
          height={150}
          alt={props.item.name}
          // The cart item image is already optimized and very small in size
          unoptimized
        />
      </div>
      <div className="flex-1 flex flex-col text-base">
        <Link href={`/product/${props.item.uri}`}>
          <span className="font-bold mb-5 text-lg cursor-pointer">
            {props.item.name}
          </span>
        </Link>
        <div className="flex items-center">
          <button type="button" onClick={() => increaseQuantity(-1)}>
            <Minus width={18} height={18} />
          </button>
          <input
            type="number"
            max={99}
            min={0}
            className={s.quantity}
            value={quantity}
            disabled
          />
          <button type="button" onClick={() => increaseQuantity(1)}>
            <Plus width={18} height={18} />
          </button>
        </div>
      </div>
      <div className="flex flex-col justify-between space-y-2 text-base">
        <span>{props.item.price.toFixed(2)} €</span>
        <button className="flex justify-end" onClick={() => handleRemove(null)}>
          <Trash />
        </button>
      </div>
    </li>
  )
}

export default CartItem
