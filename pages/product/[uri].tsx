import type {
  GetStaticPathsContext,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from 'next'
import { useRouter } from 'next/router'
import { getConfig } from '@bigcommerce/storefront-data-hooks/api'
import getAllPages from '@bigcommerce/storefront-data-hooks/api/operations/get-all-pages'
import getProduct from '@bigcommerce/storefront-data-hooks/api/operations/get-product'
import { Layout } from '@components/core'
import { ProductView } from '@components/product'
import getAllProductPaths from '@bigcommerce/storefront-data-hooks/api/operations/get-all-product-paths'

import { getItems, getItemByUri } from 'whitebrim'

const fetchAllModels = async (data: {
  currentPage: any
  selectedPageSize: any
}) => {
  let filter = {}

  let params = {
    modelName: 'product',
    filters: filter,
    pagination: {
      page: data.currentPage,
      limit: data.selectedPageSize,
    },
  }

  return getItems(params)
    .then((res: { data: { results: any; total_pages: any } }) => ({
      products: res.data.results ? res.data.results : [],
      totalPages: res.data.total_pages ? res.data.total_pages : 0,
      error: false,
    }))
    .catch((err: any) => ({
      products: [],
      totalPages: 0,
      error: true,
    }))
}

const fetchData = async (uri: any) => {
    let params = {
        modelName: "product",
        uri: uri,
    };

    return getItemByUri(params)
        .then((res) => ({
            product: res.data,
            error: false,
        }))
        .catch(() => ({
            product: null,
            error: true,
        }));
};

export async function getStaticProps({
  params,
  locale,
  preview,
}: GetStaticPropsContext<{ slug: string }>) {
  const config = getConfig({ locale })

  // const { pages } = await getAllPages({ config, preview })
  // const { product } = await getProduct({
    // variables: { slug: params!.slug },
    // config,
    // preview,
  // })

  console.log(params)

  const data = await fetchData(params.uri);

  if (!data) {
    throw new Error(`Product with slug '${params!.uri}' not found`)
  }

  // if (!product) {
    // throw new Error(`Product with slug '${params!.slug}' not found`)
  // }

  return {
    props: data,
    revalidate: 200,
  }
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  // const { products } = await getAllProductPaths();
  let payload = {
    currentPage: 1,
    selectedPageSize: 150,
  }
  const data = await fetchAllModels(payload)

  return {
    paths: locales
      ? locales.reduce<string[]>((arr, locale) => {
          // Add a product path for every locale
          data.products.forEach((product: { uri: any }) => {
            arr.push(`/${locale}/product/${product.uri}`)
          })
          return arr
        }, [])
      : data.products.map((product: { uri: any }) => `/product${product.uri}`),
    // If your store has tons of products, enable fallback mode to improve build times!
    fallback: false,
  }
}

export default function Slug({
  product,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter()

  return router.isFallback ? (
    <h1>Loading...</h1> // TODO (BC) Add Skeleton Views
  ) : (
    <ProductView product={product} />
  )
}

Slug.Layout = Layout
