import React, { useEffect } from "react";
import { useForm } from "..";
import { EventElement, InputType, ValidationFields } from "../types/package";

type RenderProp = {
  field: {
    value: any;
    checked: any;
    multiple: boolean | undefined;
    disabled: boolean | undefined;
    name: string;
    type: InputType;
    onBlur: (e: React.FocusEvent<EventElement, Element>) => void;
    onChange: (e: React.ChangeEvent<EventElement>) => void;
    onFocus: (e: React.FocusEvent<EventElement, Element>) => void;
  };
  fieldState: {
    isTouched: boolean;
    isDirty: boolean;
    invalid: boolean;
    isActive: boolean;
    error: string[];
  };
};
type ControllerProps = {
  name: string;
  type: InputType;
  control: ReturnType<typeof useForm>["control"];
  initialValue?: unknown;
  rules?: ValidationFields;
  disabled?: boolean;
  runValidationWhenChangesIn?: string[];
  controllerRef?: React.MutableRefObject<EventElement | null>;
  radioFieldValue?: string;
  checkboxFieldValue?: string;
  render: (arg: RenderProp) => React.JSX.Element;
};

function Controller(props: ControllerProps) {
  const {
    controllerRef,
    name,
    type,
    rules,
    control,
    initialValue,
    runValidationWhenChangesIn,
    disabled,
    radioFieldValue,
    checkboxFieldValue,
    render,
  } = props;
  const { register, setField, getFormState } = control;
  const {
    onBlur,
    onChange,
    onFocus,
    value,
    checked,
    multiple,
    type: inputType,
    ref: forwardedRef,
    disabled: inputDisabled,
  } = register(name, type, {
    ref: controllerRef,
    disabled,
    radioFieldValue,
    checkboxFieldValue,
    runValidationWhenChangeIn: runValidationWhenChangesIn,
    ...rules,
  });

  const { errors, touched, active, fieldPristine } = getFormState();

  const field = {
    value,
    checked,
    multiple,
    ref: forwardedRef,
    disabled: inputDisabled,
    name,
    onBlur,
    onChange,
    onFocus,
    type: inputType,
  };
  const fieldState = {
    isTouched: !!touched[name],
    isDirty: !fieldPristine[name],
    invalid: !!errors[name],
    isActive: !!active[name],
    error: errors[name] ?? [],
  };

  useEffect(() => {
    if (initialValue) {
      setField(name, initialValue);
    }
  }, []);

  return <div>{render({ field, fieldState })}</div>;
}

export default Controller;
