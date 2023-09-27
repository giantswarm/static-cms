import { Image as ImageIcon } from '@styled-icons/material-outlined/Image';
import React from 'react';

import useMediaAsset from '@staticcms/core/lib/hooks/useMediaAsset';
import classNames from '@staticcms/core/lib/util/classNames.util';
import { isEmpty } from '@staticcms/core/lib/util/string.util';
import { generateClassNames } from '@staticcms/core/lib/util/theming.util';
import { selectEditingDraft } from '@staticcms/core/reducers/selectors/entryDraft';
import { useAppSelector } from '@staticcms/core/store/hooks';
import {isNodeIndexFile} from "@staticcms/core/lib/util/nested.util";

import type {
  BaseField,
  Collection,
  Entry,
  MediaField,
  UnknownField,
} from '@staticcms/core/interface';
import type { CSSProperties } from 'react';

import './Image.css';

export const classes = generateClassNames('Image', ['root', 'empty']);

export interface ImageProps<EF extends BaseField> {
  src?: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  collection?: Collection<EF>;
  field?: MediaField;
  entry?: Entry;
  'data-testid'?: string;
}

const Image = <EF extends BaseField = UnknownField>({
  src,
  alt,
  className,
  style,
  collection,
  field,
  entry,
  'data-testid': dataTestId,
}: ImageProps<EF>) => {
  const editingDraft = useAppSelector(selectEditingDraft);

  const assetSource = useMediaAsset(src, collection, field, entry ?? editingDraft);

  if (isEmpty(src)) {
    return <ImageIcon className={classNames(classes.root, classes.empty, className)} />;
  }

  return (
    <img
      key="image"
      role="presentation"
      src={assetSource}
      alt={alt}
      data-testid={dataTestId ?? 'image'}
      className={classNames(classes.root, className)}
      style={style}
    />
  );
};

export const withMdxImage = <EF extends BaseField = UnknownField>({
  collection,
  field,
  entry,
}: Pick<ImageProps<EF>, 'collection' | 'field' | 'entry'>) => {
  const MdxImage = (props: Omit<ImageProps<EF>, 'collection' | 'field'>) => {

    if (collection?.media_library?.branch_bundle
      && collection
      && entry
      && props.src
      && props.src.startsWith('../')
      && !isNodeIndexFile(collection, entry)) {
      props = {...props, src: props.src.slice(3)};
    }

    return <Image {...props} collection={collection} field={field} />
  };

  return MdxImage;
};

export default Image;
