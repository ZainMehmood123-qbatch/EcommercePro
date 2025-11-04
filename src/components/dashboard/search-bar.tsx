'use client';

import React from 'react';

import { Input } from 'antd';

interface GenericSearchProps<T> {
  searchTerm: T;
  setSearchTerm: (value: T) => void;
  placeholder?: string;
  className?: string;
}

const SearchComponent = <T extends string | number>({
  searchTerm,
  setSearchTerm,
  placeholder = 'Search...',
  className = ''
}: GenericSearchProps<T>) => {
  return (
    <div className={`w-full sm:max-w-md lg:max-w-lg xl:max-w-xl ${className}`}>
      <Input.Search
        allowClear
        // eslint-disable-next-line react/jsx-curly-brace-presence
        className="!text-black border border-[#E2E8F0] rounded-lg
          [&_.ant-input]:!bg-white 
          [&_.ant-input-search-button_svg]:!text-black"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value as T)}
      />
    </div>
  );
};

export default SearchComponent;
