'use client';

import React, { useEffect, useState, useCallback } from 'react';

import dynamic from 'next/dynamic';

import { Spin, Skeleton } from 'antd';
import { SortAscendingOutlined, SortDescendingOutlined, CalendarOutlined } from '@ant-design/icons';

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
  // eslint-disable-next-line react/jsx-no-useless-fragment
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
    (state) => state.products
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
      {loading ? (
        <div className={'fixed inset-0 flex items-center justify-center bg-white/60 z-[9999]'}>
          <Spin size={'large'} />
        </div>
      ) : null}

      <Navbar title={'E-commerce'} />

      <div className={'dashboard-whole'}>
        <div className={'dashboard-innerheader'}>
          <p className={'dashboard-title'}>Our Products</p>

          <div className={'dashboard-innerheadericons'}>
            {loading ? (
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

        <div className={'dashboard-product'}>
          {products.map((product, index) => (
            <DashboardCard key={`${product.id}-${index}`} product={product} />
          ))}
        </div>

        <div className={'dashboard-footer'}>
          {loadingMore ? <Spin size={'large'} /> : null}
          {!hasMore && !loading && !loadingMore ? (
            <DelayedMessage delay={800}>
              <p className={'dashboard-footercontent'}>No more products</p>
            </DelayedMessage>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default Dashboardpage;

// 'use client';

// import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
// import { Spin } from 'antd';
// import dynamic from 'next/dynamic';
// import Navbar from '@/components/common/navbar';
// import SearchComponent from '@/components/dashboard/search-bar';
// import GenericDropdown, { GenericDropdownItem } from '@/components/dashboard/drop-down';
// import { useAppDispatch, useAppSelector } from '@/store/index';
// import { fetchProducts, setSearchAndSort } from '@/store/slice/products-slice';
// import './dashboard.css';
// import DelayedMessage from '@/components/dashboard/delayed-message';

// const DashboardCard = dynamic(() => import('@/components/dashboard/dashboard-card'), { ssr: false });

// const SCROLL_TRIGGER_OFFSET = 100;

// const sortItems: GenericDropdownItem[] = [
//   { key: 'name_asc', label: 'Name: A to Z' },
//   { key: 'name_desc', label: 'Name: Z to A' },
//   { key: 'newest', label: 'Newest First' },
//   { key: 'oldest', label: 'Oldest First' }
// ];

// const DashboardPage: React.FC = () => {
//   const dispatch = useAppDispatch();
//   const { products, loading, total, pageWindow, limit, search, sort } = useAppSelector(
//     (state) => state.products
//   );

//   const [localSearch, setLocalSearch] = useState(search);
//   const [topLoading, setTopLoading] = useState(false);
//   const hasFetched = useRef(false);
//   const prevScrollHeight = useRef<number>(0);

//   // Initial fetch when search/sort changes
//   useEffect(() => {
//     hasFetched.current = true;
//     dispatch(setSearchAndSort({ search: localSearch, sort }));
//     dispatch(fetchProducts({ page: 1, search: localSearch, sort, limit }));
//   }, [localSearch, sort, dispatch, limit]);

//   // Scroll position restore when fetching from top
//   useLayoutEffect(() => {
//     if (topLoading && prevScrollHeight.current) {
//       const diff = document.documentElement.scrollHeight - prevScrollHeight.current;
//       window.scrollTo({ top: diff });
//       prevScrollHeight.current = 0;
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [products]);

//   useEffect(() => {
//   let bottomTriggered = false;
//   let topTriggered = false;

//   const handleScroll = async () => {
//     if (loading || total === 0) return;

//     const scrollTop = window.scrollY;
//     const scrollHeight = document.documentElement.scrollHeight;
//     const windowHeight = window.innerHeight;
//     const firstPage = pageWindow[0];
//     const lastPage = pageWindow[pageWindow.length - 1];

//     // ✅ Load next page (bottom)
//     const isBottom =
//       windowHeight + scrollTop >= scrollHeight - SCROLL_TRIGGER_OFFSET &&
//       !loading &&
//       products.length < total;

//     if (isBottom && !bottomTriggered && !loading) {
//       bottomTriggered = true; // mark edge as hit

//       const nextPage = lastPage + 1;
//       const maxPage = Math.ceil(total / limit);

//       if (nextPage <= maxPage) {
//         await dispatch(fetchProducts({ page: nextPage, search: localSearch, sort, limit }));
//       }

//       // small cooldown to prevent repeat triggers
//       setTimeout(() => {
//         bottomTriggered = false;
//       }, 800);
//     }

//     // ✅ Load previous page (top)
//     const isTop = scrollTop <= SCROLL_TRIGGER_OFFSET && firstPage > 1;

//     if (isTop && !topTriggered && !loading) {
//       topTriggered = true; // mark edge as hit
//       setTopLoading(true);
//       prevScrollHeight.current = document.documentElement.scrollHeight;

//       const prevPage = firstPage - 1;
//       await dispatch(fetchProducts({ page: prevPage, search: localSearch, sort, limit }));

//       setTimeout(() => {
//         setTopLoading(false);
//         topTriggered = false;
//       }, 800);
//     }
//   };

//   window.addEventListener('scroll', handleScroll);
//   return () => window.removeEventListener('scroll', handleScroll);
// }, [loading, products.length, total, pageWindow, localSearch, sort, limit, dispatch]);

//   return (
//     <>
//       <Navbar title='E-commerce' />
//       <div className='dashboard-whole'>
//         <div className='dashboard-innerheader'>
//           <p className='dashboard-title'>Our Products</p>
//           <div className='dashboard-innerheadericons'>
//             <SearchComponent
//               searchTerm={localSearch}
//               setSearchTerm={setLocalSearch}
//               placeholder='Search products'
//             />
//             <GenericDropdown
//               items={sortItems}
//               selectedKey={sort}
//               onSelect={(val) => dispatch(setSearchAndSort({ search: localSearch, sort: val }))}
//             />
//           </div>
//         </div>

//         {topLoading && (
//           <div className='fixed top-0 left-0 w-full text-center py-2 bg-white z-[1000]'>
//             <Spin size='small' />
//           </div>
//         )}

//         <div className='dashboard-product'>
//           {products.map((product, i) => (
//             <DashboardCard key={`${product.id}-${i}`} product={product} />
//           ))}
//         </div>

//         {/* Bottom loader */}
//         <div
//           className='grid-loading'
//           style={{
//             textAlign: 'center',
//             padding: products.length === 0 ? '200px 0' : '20px 0',
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: products.length === 0 ? 'center' : 'flex-start',
//             minHeight: products.length === 0 ? '60vh' : 'auto'
//           }}
//         >
//           {(loading && products.length === 0) || (loading && products.length < total) ? (
//             <Spin size='large' />
//           ) : null}
//         </div>

//         {!loading && products.length >= total && (
//           <DelayedMessage delay={800}>
//             <p className='dashboard-footercontent'>No more products</p>
//           </DelayedMessage>
//         )}
//       </div>
//     </>
//   );
// };

// export default DashboardPage;
