import cn from 'classnames'
import { useState } from 'react'
import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getConfig } from '@bigcommerce/storefront-data-hooks/api'
import getAllPages from '@bigcommerce/storefront-data-hooks/api/operations/get-all-pages'
import getSiteInfo from '@bigcommerce/storefront-data-hooks/api/operations/get-site-info'
import useSearch from '@bigcommerce/storefront-data-hooks/products/use-search'
import { Layout } from '@components/core'
import { ProductCard } from '@components/product'
import { Container, Grid, Skeleton } from '@components/ui'

import rangeMap from '@lib/range-map'
import getSlug from '@lib/get-slug'
import {
  filterQuery,
  getCategoryPath,
  getDesignerPath,
  useSearchMeta,
} from '@lib/search'

import { getItems } from 'whitebrim'

const fetchData = (data: {
  currentPage: number
  selectedPageSize: number
  selectedFilterOption?: { name: null; id: null }
  multi?: boolean
  q?: string
}) => {
  let filter = {}
  let params = {
    modelName: 'product',
    q: data.q ? data.q : null, //* search
    filters: filter,
    pagination: {
      page: data.currentPage,
      limit: data.selectedPageSize,
    },
  }
  return getItems(params)
    .then((res) => ({
      items: res.data.results,
      totalPages: res.data.total_pages,
      error: false,
    }))
    .catch(() => ({
      items: null,
      totalPages: 0,
      error: true,
    }))
}

/* export async function getStaticProps({
  preview,
  locale,
}: GetStaticPropsContext) {
  const config = getConfig({ locale })
  const { pages } = await getAllPages({ config, preview })
  const { categories, brands } = await getSiteInfo({ config, preview })

  return {
    props: { pages, categories, brands },
  }
} */

const SORT = Object.entries({
  'latest-desc': 'Latest arrivals',
  'trending-desc': 'Trending',
  'price-asc': 'Price: Low to high',
  'price-desc': 'Price: High to low',
})

export default function Search({}: // categories,
// brands,
InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter()
  const { asPath } = router
  const { q, sort } = router.query
  // `q` can be included but because categories and designers can't be searched
  // in the same way of products, it's better to ignore the search input if one
  // of those is selected
  const query = filterQuery({ sort })
  const [currentQuery, setQuery] = useState(null)
  const [data, setData] = useState(null)

  const { pathname, category, brand } = useSearchMeta(asPath)

  /* const activeCategory = categories.find(
    (cat) => getSlug(cat.path) === category
  )
  const activeBrand = brands.find(
    (b) => getSlug(b.node.path) === `brands/${brand}`
  )?.node */

  const activeCategory = null
  const activeBrand = null

  if (!data || q !== currentQuery) {
    let payload = {
      currentPage: 1,
      selectedPageSize: 150,
      selectedFilterOption: { name: null, id: null },
      multi: false,
      q: typeof q === 'string' ? q : '',
    }
    fetchData(payload)
      .then((res) => {
        setQuery(q)
        setData(res)
      })
      .catch((error) => {
        setQuery(q)
        setData(null)
      })
  }

  return (
    <Container>
      <div className="grid grid-cols-12 gap-4 mt-3 mb-20">
        <div className="col-span-2">
          {/* <ul className="mb-10">
            <li className="py-1 text-base font-bold tracking-wide">
              <Link href={{ pathname: getCategoryPath('', brand), query }}>
                <a>All Categories</a>
              </Link>
            </li>
            {categories.map((cat) => (
              <li
                key={cat.path}
                className={cn('py-1 text-accents-8', {
                  underline: activeCategory?.entityId === cat.entityId,
                })}
              >
                <Link
                  href={{
                    pathname: getCategoryPath(cat.path, brand),
                    query,
                  }}
                >
                  <a>{cat.name}</a>
                </Link>
              </li>
            ))}
          </ul>
          <ul>
            <li className="py-1 text-base font-bold tracking-wide">
              <Link href={{ pathname: getDesignerPath('', category), query }}>
                <a>All Designers</a>
              </Link>
            </li>
            {brands.flatMap(({ node }) => (
              <li
                key={node.path}
                className={cn('py-1 text-accents-8', {
                  underline: activeBrand?.entityId === node.entityId,
                })}
              >
                <Link
                  href={{
                    pathname: getDesignerPath(node.path, category),
                    query,
                  }}
                >
                  <a>{node.name}</a>
                </Link>
              </li>
            ))}
          </ul> */}
        </div>
        <div className="col-span-8">
          {(q || activeCategory || activeBrand) && (
            <div className="mb-12 transition ease-in duration-75">
              {data ? (
                <>
                  <span
                    className={cn('animated', {
                      fadeIn: data,
                      hidden: !data,
                    })}
                  >
                    Showing {data.items.length} results{' '}
                    {q && (
                      <>
                        for "<strong>{q}</strong>"
                      </>
                    )}
                  </span>
                  <span
                    className={cn('animated', {
                      fadeIn: !data,
                      hidden: data,
                    })}
                  >
                    {q ? (
                      <>
                        There are no products that match "<strong>{q}</strong>"
                      </>
                    ) : (
                      <>
                        There are no products that match the selected category &
                        designer
                      </>
                    )}
                  </span>
                </>
              ) : q ? (
                <>
                  Searching for: "<strong>{q}</strong>"
                </>
              ) : (
                <>Searching...</>
              )}
            </div>
          )}

          {data ? (
            <Grid layout="normal">
              {data.items.map((item: any) => (
                <ProductCard
                  variant="simple"
                  key={item.uri}
                  className="animated fadeIn"
                  product={item}
                  imgWidth={480}
                  imgHeight={480}
                />
              ))}
            </Grid>
          ) : (
            <Grid layout="normal">
              {rangeMap(12, (i) => (
                <Skeleton
                  key={i}
                  className="w-full animated fadeIn"
                  height={325}
                />
              ))}
            </Grid>
          )}
        </div>
        <div className="col-span-2">
          <ul>
            <li className="py-1 text-base font-bold tracking-wide">Sort</li>
            <li
              className={cn('py-1 text-accents-8', {
                underline: !sort,
              })}
            >
              <Link href={{ pathname, query: filterQuery({ q }) }}>
                <a>Relevance</a>
              </Link>
            </li>
            {SORT.map(([key, text]) => (
              <li
                key={key}
                className={cn('py-1 text-accents-8', {
                  underline: sort === key,
                })}
              >
                <Link href={{ pathname, query: filterQuery({ q, sort: key }) }}>
                  <a>{text}</a>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Container>
  )
}

Search.Layout = Layout
