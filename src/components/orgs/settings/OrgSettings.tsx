import { FormProvider, useForm } from 'react-hook-form';
import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import styles from './OrgSettings.module.scss';
import { Button } from '../../../commons/components/Button';
import { OrgNameInput } from './OrgNameInput';
import { useEnv } from '../../../providers/EnvProvider';
import { axios } from '../../../providers/axios';
import { InputError } from '../../../commons/components/forms/InputError';
import { COLOR_PATTERN, required } from '../../../commons/components/forms/form-constants';
import { useOrg } from '../OrgView';
import { Org } from '../org';
import { useMountedState } from '../../../commons/hooks/use-mounted-state';

interface Settings {
  name: string;
  color: string; // TODO color picker
}

export function OrgSettings() {
  const env = useEnv();
  const { org, setOrg } = useOrg();

  const methods = useForm<Settings>({
    mode: 'onChange',
  });
  const {
    errors, register, reset, handleSubmit, formState: { isDirty },
  } = methods;

  useEffect(() => {
    if (org && reset) {
      reset(org);
    }
  }, [org, reset]);

  const [loading, setLoading] = useMountedState(false);

  const onSubmit = (settings: Settings) => {
    setLoading(true);
    axios
      .put<Org>(`${env.MELI_API_URL}/api/v1/orgs/${org._id}`, settings)
      .then(({ data }) => data)
      .then(setOrg)
      .then(() => toast('Org saved', {
        type: 'success',
      }))
      .catch(err => toast(`Could not update org: ${err}`, {
        type: 'error',
      }))
      .finally(() => setLoading(false));
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={styles.form}
      >

        <div className="form-group d-flex justify-content-end">
          {/* TODO use http://reactcommunity.org/react-transition-group/css-transition */}
          {isDirty && (
            <button
              type="button"
              className="btn btn-outline-primary animate fadeIn"
              onClick={() => reset(org)}
            >
              Discard
            </button>
          )}
          <Button
            type="submit"
            className="ml-3 btn btn-primary"
            loading={loading}
            disabled={!isDirty}
          >
            Save
          </Button>
        </div>

        <div className="mt-4 card">
          <div className="card-header">
            <strong>Org</strong>
          </div>
          <div className="card-body">
            <OrgNameInput />
            <div className="form-group">
              <label htmlFor="color" className="form-label">Color</label>
              <input
                type="color"
                id="color"
                name="color"
                ref={register({
                  required,
                  pattern: COLOR_PATTERN,
                })}
                className="form-control"
                autoComplete="off"
                defaultValue="#000000"
              />
              <InputError error={errors} path="color" />
            </div>
          </div>
        </div>

      </form>
    </FormProvider>
  );
}
