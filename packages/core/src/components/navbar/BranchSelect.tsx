import React, {useCallback} from 'react';
import {translate} from 'react-polyglot';

import {useAppSelector} from '@staticcms/core/store/hooks';
import {switchBranch} from "@staticcms/core/actions/config";
import Select from "@staticcms/core/components/common/select/Select";
import {selectBranches} from "@staticcms/core/reducers/selectors/branches";
import {selectConfig} from "@staticcms/core/reducers/selectors/config";

import type {TranslatedProps} from '@staticcms/core/interface';
import type {SelectChangeEventHandler} from "@staticcms/core/components/common/select/Select";
import type {FC} from 'react';


const BranchSelect: FC<TranslatedProps<{}>> = ({t}) => {
  const branchesState = useAppSelector(selectBranches);
  const config = useAppSelector(selectConfig);

  const handleBranchSelection: SelectChangeEventHandler = useCallback(
    (value) => {
      if (value) {
        switchBranch(''+value);
      }
    },
    [],
  );

  return (
    <div>
      <Select
        label={
        <div className="flex-auto w-24">
          {t('ui.branchSelect.branch')}
        </div>
        }
        onChange={handleBranchSelection}
        value={config?.backend?.branch || ''}
        placeholder=''
        options={(branchesState?.branches || []).map(branch => branch.name)}
      />
    </div>
  );
};

export default translate()(BranchSelect) as FC<{}>;
