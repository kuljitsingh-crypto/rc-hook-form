import { EMAIL_RE, VALID, ValidationFields } from "../types/package";

const getErrorMsg = (defaultMessage: string, msg?: string) => {
  return typeof msg === "string" ? msg : defaultMessage;
};

export const validationCallback: Record<
  keyof ValidationFields,
  (value: any, msg?: string, refValue?: any) => string | typeof VALID
> = {
  required: (value: any, msg?: string) => {
    const errorMsg = getErrorMsg("This field is required.", msg);
    return value ? VALID : errorMsg;
  },
  minLength: (value, msg, refValue) => {
    const errorMsg = getErrorMsg(
      `Field must have at least ${refValue} characters.`,
      msg
    );
    return value.length >= refValue ? VALID : errorMsg;
  },
  maxLength: (value, msg, refValue) => {
    const errorMsg = getErrorMsg(
      `Field must have no more than ${refValue} characters.`,
      msg
    );
    return value.length <= refValue ? VALID : errorMsg;
  },
  min: (value, msg, refValue) => {
    const errorMsg = getErrorMsg(`Field must be more than ${refValue}.`, msg);
    return isNaN(+value) || value < refValue ? errorMsg : VALID;
  },
  max: (value, msg, refValue) => {
    const errorMsg = getErrorMsg(`Field must have less than ${refValue}.`, msg);
    return isNaN(+value) || value > refValue ? errorMsg : VALID;
  },
  pattern: (value, msg, refValue) => {
    const errorMsg = getErrorMsg(
      `Field must match the condition: ${refValue}.`,
      msg
    );
    return refValue.test(value) ? VALID : errorMsg;
  },
  validEmail: (value, msg) => {
    const errorMsg = getErrorMsg("Field must be a valid email address.", msg);
    return EMAIL_RE.test(value) ? VALID : errorMsg;
  },
  validate: (value, msg, refValue) => {
    if (typeof refValue === "function") {
      return refValue(value);
    }
    return VALID;
  },
};
