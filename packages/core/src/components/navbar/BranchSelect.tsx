import React, {useCallback} from 'react';
import {translate} from 'react-polyglot';

import {useAppSelector} from '@staticcms/core/store/hooks';
import {switchBranch} from "@staticcms/core/actions/config";
import Select from "@staticcms/core/components/common/select/Select";
import {selectBranches} from "@staticcms/core/reducers/selectors/branches";
import {selectBackendBranch} from "@staticcms/core/reducers/selectors/config";

import type {TranslatedProps} from '@staticcms/core/interface';
import type {SelectChangeEventHandler} from "@staticcms/core/components/common/select/Select";
import type {FC} from 'react';


const BranchSelect: FC<TranslatedProps<{}>> = ({t}) => {
  const branches = useAppSelector(selectBranches);
  const branch = useAppSelector(selectBackendBranch);

  const handleBranchSelection: SelectChangeEventHandler = useCallback(
(value) => {
        if (typeof value === "string") {
          switchBranch(value);
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
        value={branch}
        placeholder=''
        required={true}
        options={(branches || []).map(branch => branch.name)}
      />
    </div>
  );
};

export default translate()(BranchSelect) as FC<{}>;
