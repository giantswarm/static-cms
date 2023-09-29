import { Image as ImageIcon } from '@styled-icons/material-outlined/Image';
import React from 'react';

import useMediaAsset from '@staticcms/core/lib/hooks/useMediaAsset';
import classNames from '@staticcms/core/lib/util/classNames.util';
import { isEmpty } from '@staticcms/core/lib/util/string.util';
import { generateClassNames } from '@staticcms/core/lib/util/theming.util';
import { selectEditingDraft } from '@staticcms/core/reducers/selectors/entryDraft';
import { useAppSelector } from '@staticcms/core/store/hooks';
import {rewriteNodeBranchBundleRelativeLinkSrc} from "@staticcms/core/lib/util/nested.util";

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
  const MdxImage = (props: Omit<ImageProps<EF>, 'collection' | 'field' | 'entry'>) => {

    if (collection && entry && props.src) {
      props = {...props, src: rewriteNodeBranchBundleRelativeLinkSrc(collection, entry, props.src)};
    }

    return <Image {...props} collection={collection} field={field} entry={entry} />
  };

  return MdxImage;
};

export default Image;
