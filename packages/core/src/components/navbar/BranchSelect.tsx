import React, {useCallback} from 'react';
import { translate } from 'react-polyglot';

import {useAppDispatch, useAppSelector} from '@staticcms/core/store/hooks';
import { switchBranch } from '@staticcms/core/actions/config';
import Select from '@staticcms/core/components/common/select/Select';
import Button from "@staticcms/core/components/common/button/Button";
import { selectBranches } from '@staticcms/core/reducers/selectors/branches';
import { selectBackendBranch } from '@staticcms/core/reducers/selectors/config';
import { openPullInNewTab } from "@staticcms/core/actions/globalUI";

import type { TranslatedProps } from '@staticcms/core/interface';
import type { SelectChangeEventHandler } from '@staticcms/core/components/common/select/Select';
import type { FC, MouseEventHandler } from 'react';
import type { Branch } from "@staticcms/core/reducers/branches";

const BranchSelect: FC<TranslatedProps<{}>> = ({ t }) => {
  const dispatch = useAppDispatch();
  const branches = useAppSelector(selectBranches);
  const branch = useAppSelector(selectBackendBranch);

  const handleBranchSelection: SelectChangeEventHandler = useCallback(value => {
    if (typeof value === 'string') {
      switchBranch(value);
    }
  }, []);

  const handlePullOpen: MouseEventHandler = useCallback(() => {
    if (branch) {
      dispatch(openPullInNewTab(branch));
    }
  }, [branch, dispatch]);

  return (
    <div>
      <Select
        label={<div className="flex-auto w-32">{t('ui.branchSelect.branch')}</div>}
        onChange={handleBranchSelection}
        value={branch}
        placeholder=""
        required={true}
        options={branches.map(branch => branch.name)}
      />
      <Button
        color="secondary"
        variant="outlined"
        key="upload"
        onClick={handlePullOpen}
        data-testid="open-pull"
        disabled={!(branches.find((b: Branch) => b.name === branch)?.protected === false)}>
        <div className="flex-auto w-32">{t('ui.branchSelect.openPull')}</div>
      </Button>
    </div>
  );
};

export default translate()(BranchSelect) as FC<{}>;
