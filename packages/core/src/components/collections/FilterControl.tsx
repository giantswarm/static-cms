import React, { useCallback, useMemo } from 'react';
import { translate } from 'react-polyglot';

import Menu from '../common/menu/Menu';
import MenuGroup from '../common/menu/MenuGroup';
import MenuItemButton from '../common/menu/MenuItemButton';

import type { FilterMap, TranslatedProps, ViewFilter } from '@staticcms/core/interface';
import type { MouseEvent } from 'react';

interface FilterControlProps {
  filter: Record<string, FilterMap>;
  viewFilters: ViewFilter[];
  onFilterClick: (viewFilter: ViewFilter) => void;
}

const FilterControl = ({
  viewFilters,
  t,
  onFilterClick,
  filter,
}: TranslatedProps<FilterControlProps>) => {
  const anyActive = useMemo(() => Object.keys(filter).some(key => filter[key]?.active), [filter]);

  const handleFilterClick = useCallback(
    (viewFilter: ViewFilter) => (event: MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      onFilterClick(viewFilter);
    },
    [onFilterClick],
  );

  return (
    <Menu
      label={t('collection.collectionTop.filterBy')}
      variant={anyActive ? 'contained' : 'outlined'}
    >
      <MenuGroup>
        {viewFilters.map(viewFilter => {
          const checked = Boolean(viewFilter.id && filter[viewFilter?.id]?.active) ?? false;
          const labelId = `filter-list-label-${viewFilter.label}`;
          return (
            <MenuItemButton key={viewFilter.id} onClick={handleFilterClick(viewFilter)}>
              <input
                key={`${labelId}-${checked}`}
                id={labelId}
                type="checkbox"
                value=""
                className=""
                checked={checked}
                readOnly
              />
              <label className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-300">
                {viewFilter.label}
              </label>
            </MenuItemButton>
          );
        })}
      </MenuGroup>
    </Menu>
  );
};

export default translate()(FilterControl);
