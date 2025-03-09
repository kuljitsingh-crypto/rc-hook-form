import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  EventElement,
  FormState,
  InputType,
  noValueType,
  RegisterExtraProps,
  selectType,
  splActionType,
  UseFormParam,
  VALID,
  ValidationFields,
  validInputType,
  validInputTypeSet,
} from "../types/package";
import {
  addData,
  addObjectData,
  createSingleKeyObj,
  getObjectData,
  isObjEmpty,
  validationCallback,
} from "../util";
import { cloneDeep, isEqual } from "lodash";
import { unstable_batchedUpdates } from "react-dom";

export const useForm = <T extends Record<string, any>>(
  param?: UseFormParam<T>
) => {
  const { initialState } = param || {};
  const [formState, setFormState] = useState<FormState>({
    error: {},
    active: {},
    touched: {},
    pristine: {},
    values: initialState || ({} as T),
  });
  const [formPristine, setFormPristine] = useState(false);
  const localFormState = useRef<Record<string, any> | null>(null);
  const initialLocalFormState = useRef<Record<string, any> | null>(null);
  const elementRef = useRef<Record<string, EventElement | null>>({});
  const isPristineInitialized = useRef<Record<string, boolean>>({});
  const linkedValidationCheck = useRef<
    Record<string, Record<string, ValidationFields>>
  >({});
  if (localFormState.current === null) {
    localFormState.current = createSingleKeyObj({
      target: {},
      source: cloneDeep(initialState) || {},
    }) as Record<string, any>;
  }
  if (initialLocalFormState.current === null) {
    initialLocalFormState.current = cloneDeep(initialState) || {};
  }

  const addToLinkedValidationCheck = (
    name: string,
    validation?: ValidationFields,
    deps?: string[]
  ) => {
    if (deps && deps.length > 0 && validation && !isObjEmpty(validation)) {
      deps.forEach((dep) => {
        if (linkedValidationCheck.current[dep] === undefined) {
          linkedValidationCheck.current[dep] = {};
        }
        linkedValidationCheck.current[dep][name] = validation;
      });
    }
  };

  const runLinkedValidationCheck = (name: string) => {
    if (linkedValidationCheck.current[name]) {
      Object.entries(linkedValidationCheck.current[name]).forEach(
        ([fieldName, validations]) => {
          const value = localFormState.current?.[fieldName];
          validateFieldValues({ name: fieldName, value: value, validations });
        }
      );
    }
  };

  const updateLocalFormState = (
    name: keyof T,
    value: any,
    type: string,
    checked?: boolean,
    initialize?: boolean
  ) => {
    const nameKey = name as string;
    addData({
      ref: localFormState.current || {},
      key: nameKey,
      value,
      targetType: type,
      checked: checked,
      initialize,
    });
  };

  const updateFormState = (stateName: keyof FormState, value: any) => {
    setFormState((formState) => ({ ...formState, [stateName]: value }));
  };

  const updateFieldState = (
    stateName: keyof FormState,
    fieldName: string,
    value: any
  ) => {
    setFormState((formState) => {
      const prevFormState = Object.assign({}, formState[stateName]);
      if (value === undefined) {
        delete prevFormState[fieldName];
      } else {
        prevFormState[fieldName] = value;
      }
      return { ...formState, [stateName]: prevFormState };
    });
  };

  const updatePristineState = (name: string) => {
    const initialValue = getObjectData(
      name,
      initialLocalFormState?.current || {}
    );
    const value = localFormState.current?.[name];
    const isPristine = isEqual(value, initialValue);
    updateFieldState("pristine", name, isPristine);
  };

  const validateFieldValues = ({
    name,
    value,
    validations,
  }: {
    name: string;
    value: any;
    validations: ValidationFields;
  }) => {
    const isFieldFocused = formState.touched[name];
    if (!isFieldFocused) return;
    const errorMsgArr: string[] = [];
    Object.entries(validations || {}).forEach((validation) => {
      const [validationKey, validationValue] = validation as [
        keyof ValidationFields,
        ValidationFields[keyof ValidationFields]
      ];
      {
        const customMsg =
          typeof validationValue === "boolean"
            ? undefined
            : typeof validationValue === "string"
            ? validationValue
            : typeof validationValue === "function"
            ? undefined
            : validationValue?.message;
        const valueMaybe =
          typeof validationValue === "string" ||
          typeof validationValue === "boolean" ||
          typeof validationValue === "function"
            ? undefined
            : validationValue?.value;
        const validationFn = validationCallback[validationKey];
        const msg = validationFn?.(value, customMsg, valueMaybe);
        if (msg !== VALID) {
          errorMsgArr.push(msg);
        }
      }
    });

    updateFieldState(
      "error",
      name,
      errorMsgArr.length > 0 ? errorMsgArr : undefined
    );
  };

  const initializeFieldState = <T>(
    stateName: keyof FormState,
    initialValue: T
  ) => {
    return Object.keys(formState[stateName]).reduce((acc, key) => {
      acc[key] = initialValue;
      return acc;
    }, {} as Record<string, T>);
  };

  const setFormValues = (values: T) => {
    setFormState((formState) => ({ ...formState, values }));
  };
  const updateFormValues = ({
    refObject,
    name,
    value,
    targetType,
    checked,
    initialize,
    shouldCheckPristine,
    shouldSetTouched,
    validations,
  }: {
    refObject: Record<string, any>;
    name: string;
    value: any;
    targetType: InputType;
    validations?: ValidationFields;
    checked?: boolean;
    initialize?: boolean;
    shouldSetTouched?: boolean;
    shouldCheckPristine?: boolean;
  }) => {
    const updatedFormData = addObjectData(refObject, name, {
      value,
      targetType,
      checked,
      initialize,
    });
    updateLocalFormState(name, value, targetType, checked, initialize);
    unstable_batchedUpdates(() => {
      setFormValues(updatedFormData as T);
      if (shouldSetTouched) {
        updateFieldState("touched", name, true);
      }
      if (validations) {
        validateFieldValues({ name: name, value, validations });
      }
      if (shouldCheckPristine) {
        updatePristineState(name);
      }
      runLinkedValidationCheck(name as string);
    });
  };

  const register = useCallback(
    (name: keyof T, type: InputType, extra?: RegisterExtraProps) => {
      const {
        radioFieldValue,
        checkboxFieldValue,
        ref,
        disabled,
        runValidationWhenChangeIn,
        handleOnChange,
        handleOnBlur,
        handleOnFocus,
        ...validations
      } = extra || {};
      if (!validInputTypeSet.has(type)) {
        const allowedTypes = validInputType.join(" | ");
        throw new Error(
          `Argument of type "${type}" is not assignable to parameter of type: ${allowedTypes}`
        );
      }
      if (type === "radio" && !radioFieldValue) {
        throw new Error("Radio value is required for radio input type");
      } else if (type === "checkbox" && !checkboxFieldValue) {
        throw new Error("Checkbox value is required for checkbox input type");
      }
      const onChange = (e: ChangeEvent<EventElement>) => {
        if (disabled) return;
        let value = e.target.value;
        const targetType = e.target.type as InputType;
        const inputEventTarget = e.target as HTMLInputElement;
        const selectEventTarget = e.target as HTMLSelectElement;
        const isCheckedType = splActionType.has(targetType);
        const isSelectType = selectType.has(targetType);
        const strName = name as string;
        const checkedMaybe = isCheckedType
          ? { checked: inputEventTarget.checked }
          : {};
        if (isSelectType) {
          value = Array.from(
            selectEventTarget.selectedOptions,
            (option) => option.value
          ) as any;
          value = targetType === "select-one" ? value[0] : value;
        }
        const initializeMaybe = isSelectType ? { initialize: true } : {};
        updateFormValues({
          refObject: formState.values,
          name: strName,
          value,
          targetType,
          checked: checkedMaybe?.checked,
          initialize: initializeMaybe?.initialize,
          shouldCheckPristine: true,
          validations,
        });
        if (typeof handleOnChange === "function") {
          handleOnChange(e);
        }
      };

      const onFocus = (e: React.FocusEvent<EventElement, Element>) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        unstable_batchedUpdates(() => {
          updateFieldState("touched", name as string, true);
          updateFieldState("active", name as string, true);
        });
        if (typeof handleOnFocus === "function") {
          handleOnFocus(e);
        }
      };

      const onBlur = (e: React.FocusEvent<EventElement, Element>) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        updateFieldState("active", name as string, false);
        validateFieldValues({
          name: name as string,
          value: localFormState.current?.[name as string],
          validations,
        });
        if (typeof handleOnBlur === "function") {
          handleOnBlur(e);
        }
      };
      const refCallback = (e: null | EventElement) => {
        elementRef.current[name as string] = e;
        if (ref && typeof ref.current !== "undefined") {
          ref.current = e;
        }
        if (e && !isPristineInitialized.current[name as string]) {
          isPristineInitialized.current[name as string] = true;
          updateFieldState("pristine", name as string, true);
          addToLinkedValidationCheck(
            name as string,
            validations,
            runValidationWhenChangeIn
          );
        }
        if (selectType.has(e?.type || "") && formState.values[name as string]) {
          let value = formState.values[name as string];
          value = new Set(Array.isArray(value) ? value : [value]) as any;
          e?.childNodes.forEach((element) => {
            const optionElement = element as HTMLOptionElement;
            if (value.has(optionElement.value)) {
              optionElement.selected = true;
            }
          });
        }
      };
      const formValue = formState.values[name as string];
      const valueMaybe = noValueType.has(type)
        ? type === "radio"
          ? { checked: radioFieldValue === formValue, value: radioFieldValue }
          : type === "checkbox"
          ? {
              checked: formValue?.includes(checkboxFieldValue),
              value: checkboxFieldValue,
            }
          : type === "select-multiple"
          ? { multiple: true }
          : {}
        : { value: formValue || "" };

      const disabledMaybe = disabled ? { disabled } : {};

      return {
        name,
        type,
        ...valueMaybe,
        ...disabledMaybe,
        ref: refCallback,
        onChange,
        onBlur,
        onFocus,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formState]
  );

  const reset = () => {
    const initialFormData = cloneDeep(initialLocalFormState.current);
    unstable_batchedUpdates(() => {
      setFormState({
        error: {},
        touched: initializeFieldState("touched", false),
        pristine: initializeFieldState("pristine", true),
        active: initializeFieldState("active", false),
        values: initialFormData || {},
      });
      setFormPristine(true);
    });
  };

  const resetField = (name: keyof T) => {
    const element = elementRef.current[name as string];
    if (!element) return;
    const type = element.type;
    const initialValue = getObjectData(
      name as string,
      initialLocalFormState?.current || {}
    );
    updateLocalFormState(name, initialValue, type, false, true);
    const updatedFormData = addObjectData(formState.values, name as string, {
      value: initialValue,
      targetType: type,
      initialize: true,
    });
    unstable_batchedUpdates(() => {
      setFormValues(updatedFormData as T);
      updateFieldState("error", name as string, undefined);
      updateFieldState("pristine", name as string, true);
      updateFieldState("touched", name as string, false);
      updateFieldState("active", name as string, false);
    });
  };

  const setField = (
    name: string,
    value: any,
    options?: {
      shouldSetTouched?: boolean;
      shouldCheckPristine?: boolean;
      multipleValues?: boolean;
      validations?: ValidationFields;
    }
  ) => {
    const {
      multipleValues,
      shouldSetTouched,
      validations,
      shouldCheckPristine,
    } = options || {};
    const targetType = multipleValues ? "select-multiple" : "select-one";
    if (multipleValues && !Array.isArray(value)) {
      throw new Error("Value should be an array for multiple select fields");
    }
    value = Array.isArray(value) ? (multipleValues ? value : value[0]) : value;
    updateFormValues({
      refObject: formState.values,
      name: name,
      value,
      targetType,
      checked: false,
      initialize: true,
      shouldCheckPristine,
      shouldSetTouched,
      validations,
    });
  };
  const getFormState = () => {
    return {
      values: formState.values,
      active: formState.active,
      touched: formState.touched,
      errors: formState.error,
      invalid: !formValid,
      fieldPristine: formState.pristine,
      formPristine,
    };
  };

  const handleSubmit =
    (submitCallback: (arg: T) => void) =>
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const hasAnyError = !isObjEmpty(formState.error);
      if (hasAnyError) return;
      const hasValues = !isObjEmpty(formState.values);
      if (!hasValues) return;
      setFormPristine(true);
      updateFormState("pristine", initializeFieldState("pristine", true));
      submitCallback(formState.values as T);
    };

  const useInitializeFormState = (initialState: T, deps: any[]) => {
    useEffect(() => {
      initialLocalFormState.current = cloneDeep(initialState);
      localFormState.current = createSingleKeyObj({
        target: {},
        source: cloneDeep(initialState),
      });
      setFormValues(initialState);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps]);
  };

  useEffect(() => {
    const isFormPristine = Object.values(formState.pristine).some(
      (pristine) => !pristine
    );
    setFormPristine(!isFormPristine);
  }, [formState.pristine]);

  useEffect(() => {
    return () => {
      // Clean up refs on unmount
      elementRef.current = {};
    };
  }, []);

  const formValid = useMemo(
    () => isObjEmpty(formState.error),
    [formState.error]
  );
  const isEmpty = useMemo(
    () => isObjEmpty(formState.values),
    [formState.values]
  );

  const formReturn = {
    formState: {
      values: formState.values,
      active: formState.active,
      touched: formState.touched,
      errors: formState.error,
      invalid: !formValid,
      isEmpty,
      fieldPristine: formState.pristine,
      formPristine,
    },
    control: {
      getFormState,
      register,
      resetForm: reset,
      resetField,
      setField,
    },
    useInitializeFormState,
    handleSubmit,
    register,
    resetForm: reset,
    resetField,
    setField,
  };

  return formReturn;
};
