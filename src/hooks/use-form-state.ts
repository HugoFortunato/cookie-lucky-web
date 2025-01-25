import { FormEvent, useState, useTransition } from 'react';
import { requestFormReset } from 'react-dom';

interface FormState {
  success: boolean;
  message: string | null;
  errors: Record<string, string[]> | null;
}

export function useFormState(
  action: (data: FormData, currentOrg: string) => Promise<FormState>,
  currentOrg?: string,
  onSuccess?: () => Promise<void> | void,
  initialState?: FormState
) {
  const [isPending, startTransition] = useTransition();

  const [formState, setFormState] = useState(
    initialState ?? { success: false, message: null, errors: null }
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);

    startTransition(async () => {
      const state = await action(data, currentOrg ?? '');

      if (state.success && onSuccess) {
        await onSuccess();
      }

      setFormState(state);
    });

    startTransition(() => {
      requestFormReset(form);
    });
  }

  return [formState, handleSubmit, isPending] as const;
}
