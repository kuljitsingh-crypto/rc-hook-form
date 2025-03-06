import { useForm as useFormHook } from "./hooks/useForm";
import FormController from "./component/Controller";
import {
  InputType as Input,
  ValidationFields as ValFields,
  FormState as State,
  EventElement as Element,
} from "./types/package";

export const useForm = useFormHook;
export const Controller = FormController;
export type UseFormInputType = Input;
export type UseFormControl = ReturnType<typeof useFormHook>["control"];
export type UseFormController = Parameters<typeof FormController>[0];
export type UseFormValidationField = ValFields;
export type UseFormState = ReturnType<typeof useFormHook>["formState"];
export type UseFormElement = Element;
