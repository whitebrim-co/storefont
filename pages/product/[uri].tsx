import type {
  GetStaticPathsContext,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from 'next'
import { useRouter } from 'next/router'

import { Layout } from '@components/core'
import { ProductView } from '@components/product'

import { getItems, getItemByUri } from 'whitebrim'

const getAllModels = async (data: {
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
      items: res.data.results,
      totalPages: res.data.total_pages,
      error: false,
    }))
    .catch((err: any) => ({
      items: [],
      totalPages: 0,
      error: true,
    }))
}

const getItem = async (uri: any) => {
  let params = {
    modelName: 'product',
    uri: uri,
  }

  return getItemByUri(params)
    .then((res) => ({
      item: res.data,
      error: false,
    }))
    .catch(() => ({
      item: null,
      error: true,
    }))
}

export async function getStaticProps({
  params,
  locale,
  preview,
}: GetStaticPropsContext<{ uri: string }>) {
  const data = await getItem(params.uri)

  if (!data) {
    throw new Error(`Product with uri '${params!.uri}' not found`)
  }

  return {
    props: data,
    revalidate: 200,
  }
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  let payload = {
    currentPage: 1,
    selectedPageSize: 150,
  }
  const data = await getAllModels(payload)
  return {
    paths: locales
      ? locales.reduce<string[]>((arr, locale) => {
          // Add a product path for every locale
          data.items.forEach((product: { uri: any }) => {
            arr.push(`/${locale}/product/${product.uri}`)
          })
          return arr
        }, [])
      : data.items.map((product: { uri: any }) => `/product/${product.uri}`),
    // If your store has tons of products, enable fallback mode to improve build times!
    fallback: false,
  }
}

export default function Uri({
  item,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter()

  return router.isFallback ? (
    <h1>Loading...</h1> // TODO (BC) Add Skeleton Views
  ) : (
    <ProductView product={item} />
  )
}

Uri.Layout = Layout
