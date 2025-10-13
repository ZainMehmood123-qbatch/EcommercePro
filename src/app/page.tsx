'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import {
  SortAscendingOutlined,
  SortDescendingOutlined,
  CalendarOutlined
} from '@ant-design/icons';

import { useAppDispatch, useAppSelector } from '@/store/index';
import {
  fetchProducts,
  resetProducts,
  setSearch,
  setSort,
  nextPage
} from '@/store/slice/products-slice';

import Navbar from '@/components/common/navbar';
import SearchComponent from '@/components/dashboard/search-bar';
import DelayedMessage from '@/components/dashboard/delayed-message';
import GenericDropdown, { GenericDropdownItem } from '@/components/dashboard/drop-down';

import './dashboard.css';

// DashboardCard dynamically imported
const DashboardCard = dynamic(() => import('@/components/dashboard/dashboard-card'), {
  ssr: false,
  loading: () => <></>
});

// Sort options
const productSortItems: GenericDropdownItem[] = [
  { key: 'name_asc', label: 'Name: A to Z', icon: <SortAscendingOutlined /> },
  { key: 'name_desc', label: 'Name: Z to A', icon: <SortDescendingOutlined /> },
  { key: 'newest', label: 'Newest First', icon: <CalendarOutlined /> },
  { key: 'oldest', label: 'Oldest First', icon: <CalendarOutlined /> }
];

const Dashboardpage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, page, search, sort, loading, loadingMore, hasMore } = useAppSelector(
    state => state.products
  );

  const [localSearch, setLocalSearch] = useState(search);
  const [debouncedSearch, setDebouncedSearch] = useState(localSearch);

  // Fetch products
  const loadProducts = useCallback(
    (pageToLoad: number) => {
      dispatch(fetchProducts({ page: pageToLoad, search: debouncedSearch, sort }));
    },
    [dispatch, debouncedSearch, sort]
  );

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(localSearch);
    }, 500);
    return () => clearTimeout(handler);
  }, [localSearch]);

  useEffect(() => {
    dispatch(setSearch(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  // Reload products when search or sort changes
  useEffect(() => {
    dispatch(resetProducts());
    loadProducts(1);
  }, [debouncedSearch, sort, dispatch, loadProducts]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100 &&
        !loading &&
        !loadingMore &&
        hasMore
      ) {
        dispatch(nextPage());
        loadProducts(page + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch, loading, loadingMore, hasMore, page, loadProducts]);

  return (
    <>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-[9999]">
          <Spin size="large" tip="Loading products..." />
        </div>
      )}

      <Navbar title="E-commerce" />

      <div className="dashboard-whole">
        <div className="dashboard-innerheader">
          <p className="dashboard-title">Our Products</p>

          <div className="dashboard-innerheadericons">
            <SearchComponent
              searchTerm={localSearch}
              setSearchTerm={setLocalSearch}
              placeholder="Search products"
            />

            <GenericDropdown
              items={productSortItems}
              selectedKey={sort}
              onSelect={(val: string) => dispatch(setSort(val))}
            />
          </div>
        </div>

        <div className="dashboard-product">
          {products.map((product, index) => (
            <DashboardCard key={`${product.id}-${index}`} product={product} />
          ))}
        </div>

        <div className="dashboard-footer">
          {loadingMore ? <Spin size="large" /> : null}
          {!hasMore && !loading && !loadingMore ? (
            <DelayedMessage delay={800}>
              <p className="dashboard-footercontent">No more products</p>
            </DelayedMessage>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default Dashboardpage;
