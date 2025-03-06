import { ChangeEvent } from "react";

export const validInputType = [
  "checkbox",
  "color",
  "date",
  "datetime-local",
  "email",
  "month",
  "number",
  "password",
  "radio",
  "range",
  "search",
  "tel",
  "text",
  "time",
  "url",
  "week",
  "textarea",
  "select-one",
  "select-multiple",
] as const;

export type EventElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

export type UseFormParam<T> = {
  initialState?: T;
};
export type ValidationFields = {
  required?: boolean | string;
  validEmail?: boolean | string;
  minLength?: { value: number; message?: string };
  maxLength?: { value: number; message?: string };
  min?: { value: number; message?: string };
  max?: { value: number; message?: string };
  pattern?: { value: RegExp; message?: string };
  validate?: (value: any) => undefined | string;
};
export type OptionValueType = {
  radioFieldValue?: string;
  checkboxFieldValue?: string;
};
export type RefType = {
  ref?: React.MutableRefObject<EventElement | null>;
  disabled?: boolean;
  runValidationWhenChangeIn?: string[];
};
export type RegisterExtraProps = ValidationFields &
  OptionValueType &
  RefType & {
    handleOnChange?: (e: ChangeEvent<EventElement>) => void;
    handleOnFocus?: (e: React.FocusEvent<EventElement, Element>) => void;
    handleOnBlur?: (e: React.FocusEvent<EventElement, Element>) => void;
  };
export type InputType = (typeof validInputType)[number];

export type FormState = {
  error: Record<string, string[]>;
  active: Record<string, boolean>;
  touched: Record<string, boolean>;
  pristine: Record<string, boolean>;
  values: Record<string, any>;
};

// Source: http://www.regular-expressions.info/email.html
// See the link above for an explanation of the tradeoffs.
export const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
export const VALID = undefined;

export const validInputTypeSet = new Set(validInputType);
export const selectType = new Set(["select-one", "select-multiple"]);
export const singleOption = new Set(["select-one", "radio"]);
export const multiOption = new Set(["select-multiple", "checkbox"]);
export const splActionType = new Set(["checkbox", "radio"]);
export const noValueType = new Set(["checkbox", "radio", "select-multiple"]);
