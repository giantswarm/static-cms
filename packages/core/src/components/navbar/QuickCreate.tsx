import { Add as AddIcon } from '@styled-icons/material/Add';
import React, { useMemo } from 'react';
import { translate } from 'react-polyglot';

import { getNewEntryUrl } from '@staticcms/core/lib/urlHelper';
import { selectCollections } from '@staticcms/core/reducers/selectors/collections';
import { useAppSelector } from '@staticcms/core/store/hooks';
import Menu from '../common/menu/Menu';
import MenuGroup from '../common/menu/MenuGroup';
import MenuItemLink from '../common/menu/MenuItemLink';
import { customPathFromSlug } from "@staticcms/core/lib/util/nested.util";

import type { Collection, TranslatedProps } from '@staticcms/core/interface';
import type { FC } from 'react';
import type { MenuProps } from '../common/menu/Menu';

export interface QuickCreateProps extends Pick<
  MenuProps,
  'rootClassName' | 'buttonClassName' | 'hideDropdownIcon' | 'hideLabel' | 'variant'
> {
  collection?: Collection;
  slug?: string;
}

const QuickCreate: FC<TranslatedProps<QuickCreateProps>> = ({ t, collection, slug, ...menuProps }) => {
  const collections = useAppSelector(selectCollections);

  const nestedFieldPath = useMemo(
    () => (collection && slug) ? customPathFromSlug(collection, slug) : '',
    [collection, slug],
  );

  const createableCollections = useMemo(
    () =>
      Object.values(collections).filter(collection =>
        'folder' in collection ? collection.create ?? false : false,
      ),
    [collections],
  );

  return (
    <Menu
      label={t('app.header.quickAdd')}
      startIcon={AddIcon}
      {...menuProps}
      aria-label="create entry options dropdown"
    >
      <MenuGroup>
        {createableCollections.map(collection => (
          <MenuItemLink key={collection.name} href={getNewEntryUrl(collection.name, nestedFieldPath)}>
            {collection.label_singular || collection.label}
          </MenuItemLink>
        ))}
      </MenuGroup>
    </Menu>
  );
};

export default translate()(QuickCreate) as FC<QuickCreateProps>;
