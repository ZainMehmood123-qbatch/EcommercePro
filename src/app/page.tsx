'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';

import dynamic from 'next/dynamic';

import { Spin, Skeleton } from 'antd';
import { SortAscendingOutlined, SortDescendingOutlined, CalendarOutlined } from '@ant-design/icons';

import { useAppDispatch, useAppSelector } from '@/store/index';
import { fetchProducts, resetProducts, setSearch, setSort } from '@/store/slice/products-slice';

import Navbar from '@/components/common/navbar';
import SearchComponent from '@/components/dashboard/search-bar';
import DelayedMessage from '@/components/dashboard/delayed-message';
import GenericDropdown, { GenericDropdownItem } from '@/components/dashboard/drop-down';

import type { ProductType } from '@/types/product';

import './dashboard.css';

const DashboardCard = dynamic(() => import('@/components/dashboard/dashboard-card'), {
  ssr: false,
  loading: () => null
});

const productSortItems: GenericDropdownItem[] = [
  { key: 'name_asc', label: 'Name: A to Z', icon: <SortAscendingOutlined /> },
  { key: 'name_desc', label: 'Name: Z to A', icon: <SortDescendingOutlined /> },
  { key: 'newest', label: 'Newest First', icon: <CalendarOutlined /> },
  { key: 'oldest', label: 'Oldest First', icon: <CalendarOutlined /> }
];

// ---------- Component ----------
const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { search, sort, hasMore } = useAppSelector((state) => state.products);

  const [localSearch, setLocalSearch] = useState(search);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [visibleProducts, setVisibleProducts] = useState<ProductType[]>([]);

  const allProductsCache = useRef<ProductType[]>([]);
  const firstPageRef = useRef(1);
  const lastPageRef = useRef(1);
  const fetchDirectionRef = useRef<'append' | 'prepend' | 'reset' | null>(null);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(hasMore);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line no-undef
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const PAGE_SIZE = 8;
  const WINDOW_SIZE = 32;

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(localSearch), 500);

    return () => clearTimeout(handler);
  }, [localSearch]);

  useEffect(() => {
    dispatch(setSearch(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  // ---------- Fetch Products ----------
  const fetchPage = useCallback(
    async (pageNum: number, mode: 'reset' | 'append' | 'prepend' = 'append') => {
      if (isLoadingRef.current) return;

      isLoadingRef.current = true;
      fetchDirectionRef.current = mode;

      try {
        const result = await dispatch(
          fetchProducts({ page: pageNum, search: debouncedSearch, sort })
        ).unwrap();

        const fetchedProducts: ProductType[] = result.data ?? [];
        const newProducts = fetchedProducts.filter(
          (p) => !allProductsCache.current.some((x) => x.id === p.id)
        );

        switch (mode) {
          case 'reset':
            allProductsCache.current = fetchedProducts;
            firstPageRef.current = lastPageRef.current = pageNum;
            break;

          case 'prepend':
            if (newProducts.length) {
              allProductsCache.current = [...newProducts, ...allProductsCache.current];
              firstPageRef.current = pageNum;

              while (allProductsCache.current.length > WINDOW_SIZE) {
                allProductsCache.current.splice(-PAGE_SIZE, PAGE_SIZE);
                lastPageRef.current = Math.max(firstPageRef.current, lastPageRef.current - 1);
              }

              setTimeout(() => {
                scrollContainerRef.current?.scrollTo({
                  top: newProducts.length * 320,
                  behavior: 'auto'
                });
              }, 50);
            }
            break;

          case 'append':
            if (newProducts.length) {
              allProductsCache.current = [...allProductsCache.current, ...newProducts];
              lastPageRef.current = pageNum;

              while (allProductsCache.current.length > WINDOW_SIZE) {
                allProductsCache.current.splice(0, PAGE_SIZE);
                firstPageRef.current = Math.min(lastPageRef.current, firstPageRef.current + 1);
              }
            }
            break;
        }

        setVisibleProducts([...allProductsCache.current]);
        hasMoreRef.current = fetchedProducts.length > 0;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch products:', error);
      } finally {
        isLoadingRef.current = false;
        fetchDirectionRef.current = null;
      }
    },
    [dispatch, debouncedSearch, sort]
  );

  // ---------- Scroll Handler ----------
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      const el = scrollContainerRef.current!;
      const { scrollTop, clientHeight, scrollHeight } = el;

      if (scrollTop < 100 && firstPageRef.current > 1 && !isLoadingRef.current) {
        fetchPage(firstPageRef.current - 1, 'prepend');
      }

      if (
        scrollTop + clientHeight > scrollHeight - 100 &&
        hasMoreRef.current &&
        !isLoadingRef.current
      ) {
        fetchPage(lastPageRef.current + 1, 'append');
      }
    }, 80);
  }, [fetchPage]);

  // ---------- Initial Load ----------
  useEffect(() => {
    allProductsCache.current = [];
    firstPageRef.current = lastPageRef.current = 1;
    setVisibleProducts([]);
    hasMoreRef.current = true;

    dispatch(resetProducts());
    fetchPage(1, 'reset');
  }, [debouncedSearch, sort, dispatch, fetchPage]);

  // ---------- Scroll Event Binding ----------
  useEffect(() => {
    const el = scrollContainerRef.current;

    if (!el) return;

    el.addEventListener('scroll', handleScroll);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [handleScroll]);

  // ---------- Render ----------
  return (
    <>
      {isLoadingRef.current ? (
        <div className={'fixed inset-0 flex items-center justify-center bg-white/60 z-[9999]'}>
          <Spin size={'large'} />
        </div>
      ) : null}

      <Navbar title={'E-commerce'} />

      <div className={'dashboard-whole'}>
        <div className={'dashboard-innerheader'}>
          <p className={'dashboard-title'}>Our Products</p>

          <div className={'dashboard-innerheadericons'}>
            {isLoadingRef.current ? (
              <div className={'flex gap-2'}>
                <Skeleton.Input active size={'small'} style={{ width: 200 }} />
                <Skeleton.Button active size={'small'} style={{ width: 120, height: 32 }} />
              </div>
            ) : (
              <>
                <SearchComponent
                  placeholder={'Search products'}
                  searchTerm={localSearch}
                  setSearchTerm={setLocalSearch}
                />
                <GenericDropdown
                  items={productSortItems}
                  selectedKey={sort}
                  onSelect={(val: string) => dispatch(setSort(val))}
                />
              </>
            )}
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          style={{
            height: 'calc(100vh - 140px)',
            overflow: 'auto',
            paddingRight: '6px'
          }}
        >
          {isLoadingRef.current && fetchDirectionRef.current === 'prepend' ? (
            <div className={'flex justify-center my-4'}>
              <Spin size={'large'} />
            </div>
          ) : null}

          <div className={'dashboard-product'}>
            {visibleProducts.map((product) => (
              <DashboardCard key={product.id} product={product} />
            ))}
          </div>

          {isLoadingRef.current && fetchDirectionRef.current !== 'prepend' ? (
            <div className={'flex justify-center my-6'}>
              <Spin size={'large'} />
            </div>
          ) : null}

          {!hasMoreRef.current && visibleProducts.length > 0 ? (
            <DelayedMessage delay={800}>
              <p className={'dashboard-footercontent'}>No more products</p>
            </DelayedMessage>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
