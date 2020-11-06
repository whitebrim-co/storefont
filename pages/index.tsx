import { useMemo } from 'react'
import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next'
import rangeMap from '@lib/range-map'

import { Layout } from '@components/core'
import { Grid, Marquee, Hero } from '@components/ui'
import { ProductCard } from '@components/product'
import HomeAllProductsGrid from '@components/core/HomeAllProductsGrid'

import { getItems } from 'whitebrim'

const fetchData = async (data: {
  currentPage: number
  selectedPageSize: number
  selectedFilterOption?: { name: null; id: null }
  multi?: boolean
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

export async function getStaticProps({
  preview,
  locale,
}: GetStaticPropsContext) {
  let payload1 = {
    currentPage: 1,
    selectedPageSize: 6,
    selectedFilterOption: { name: null, id: null },
    multi: false,
  }
  let payload2 = {
    currentPage: 1,
    selectedPageSize: 6,
    selectedFilterOption: { name: null, id: null },
    multi: false,
  }

  const { items: featuredProducts } = await fetchData(payload1)
  const { items: bestSellingProducts } = await fetchData(payload1)

  const { items: newestProducts } = await fetchData(payload2)

  const categories = null
  const brands = null

  return {
    props: {
      featuredProducts,
      bestSellingProducts,
      newestProducts,
      categories,
      brands,
    },
    revalidate: 10,
  }
}

const nonNullable = (v: any) => v

export default function Home({
  featuredProducts,
  bestSellingProducts,
  newestProducts,
  categories,
  brands,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { featured, bestSelling } = useMemo(() => {
    // Create a copy of products that we can mutate
    const products = [...newestProducts]
    // If the lists of featured and best selling products don't have enough
    // products, then fill them with products from the products list, this
    // is useful for new commerce sites that don't have a lot of products
    return {
      featured: rangeMap(6, (i) => featuredProducts[i] ?? products.shift())
        .filter(nonNullable)
        .sort((a, b) => a.price - b.price)
        .reverse(),
      bestSelling: rangeMap(
        6,
        (i) => bestSellingProducts[i] ?? products.shift()
      ).filter(nonNullable),
    }
  }, [newestProducts, featuredProducts, bestSellingProducts])

  return (
    <div>
      <Grid>
        {featured.slice(0, 3).map((item, i) => (
          <ProductCard
            key={item.uri}
            product={item}
            // The first image is the largest one in the grid
            imgWidth={i === 0 ? 1600 : 820}
            imgHeight={i === 0 ? 1600 : 820}
            priority
          />
        ))}
      </Grid>
      <Marquee variant="secondary">
        {bestSelling.slice(3, 6).map((item, i) => (
          <ProductCard
            key={item.uri}
            product={item}
            variant="slim"
            imgWidth={320}
            imgHeight={320}
          />
        ))}
      </Marquee>
      <Hero
        headline="Release Details: The Yeezy BOOST 350 V2 ‘Natural'"
        description="
        The Yeezy BOOST 350 V2 lineup continues to grow. We recently had the
        ‘Carbon’ iteration, and now release details have been locked in for
        this ‘Natural’ joint. Revealed by Yeezy Mafia earlier this year, the
        shoe was originally called ‘Abez’, which translated to ‘Tin’ in
        Hebrew. It’s now undergone a name change, and will be referred to as
        ‘Natural’."
      />
      <Grid layout="B">
        {featured.slice(3, 6).map((item, i) => (
          <ProductCard
            key={item.uri}
            product={item}
            // The second image is the largest one in the grid
            imgWidth={i === 1 ? 1600 : 820}
            imgHeight={i === 1 ? 1600 : 820}
          />
        ))}
      </Grid>
      <Marquee>
        {bestSelling.slice(0, 3).map((item, i) => (
          <ProductCard
            key={item.uri}
            product={item}
            variant="slim"
            imgWidth={320}
            imgHeight={320}
          />
        ))}
      </Marquee>
      <HomeAllProductsGrid
        categories={categories ? categories : []}
        brands={brands ? brands : []}
        newestProducts={newestProducts}
      />
    </div>
  )
}

Home.Layout = Layout
