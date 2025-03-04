import { multiOption, singleOption, splActionType } from "../types/package";

export const isObjEmpty = (obj: any) => {
  if (typeof obj !== "object") return true;
  if (obj === null) return true;
  if (obj.constructor !== Object) return true;
  return Object.keys(obj).length === 0;
};

export const addData = ({
  key,
  value,
  ref,
  targetType,
  checked,
  initialize,
}: {
  ref: Record<string, any>;
  value: any;
  targetType: string;
  key: string;
  checked?: boolean;
  initialize?: boolean;
}) => {
  if (!splActionType.has(targetType)) {
    ref[key] = value;
  } else if (singleOption.has(targetType)) {
    const radioValue = value;
    if (checked || initialize) {
      ref[key] = radioValue;
    } else {
      delete ref[key];
    }
  } else if (multiOption.has(targetType)) {
    if (initialize) {
      ref[key] = value ? [] : Array.isArray(value) ? value : [value];
    } else {
      if (ref[key] === undefined) {
        ref[key] = [] as any;
      }
      if (checked) {
        if (Array.isArray(value)) {
          ref[key].push(...value);
        } else {
          ref[key].push(value);
        }
      } else {
        ref[key] = ref[key].filter((item: unknown) => item !== value);
      }
    }
    if (ref[key].length <= 0) {
      delete ref[key];
    }
  }
};

export const addObjectData = <T extends Record<string, any>>(
  refObject: T,
  name: string,
  {
    value,
    targetType,
    checked,
    initialize,
  }: { value: any; targetType: string; checked?: boolean; initialize?: boolean }
) => {
  const names = name.split(".");
  const newRefObject = { ...refObject };
  const totalNames = names.length;
  if (totalNames <= 0) {
    return newRefObject;
  }
  names.reduce((acc, name, index) => {
    const key = name as keyof T;
    if (index === totalNames - 1) {
      addData({
        ref: acc,
        key: key as string,
        value,
        targetType,
        checked,
        initialize,
      });
    } else {
      if (typeof acc[key] !== "object" || acc[key] === null) {
        acc[key] = {} as any;
      }
      acc = acc[key];
    }
    return acc;
  }, newRefObject);
  return newRefObject;
};

export const createSingleKeyObj = ({
  source,
  target,
  prefix = "",
}: {
  target: Record<string, any>;
  source: Record<string, any>;
  prefix?: string;
}) => {
  Object.entries(source).forEach(([key, value]) => {
    const keyName = prefix ? `${prefix}.${key}` : key;
    if (
      typeof value === "object" &&
      value !== null &&
      value.constructor === Object
    ) {
      createSingleKeyObj({ target, source: value, prefix: keyName });
    } else {
      target[keyName] = value;
    }
  });
  return target;
};

export const getObjectData = (name: String, refObject: Record<string, any>) => {
  if (typeof refObject !== "object" || refObject === null) {
    return undefined;
  }
  const names = name.split(".");

  let data = undefined,
    depthCount = 0;
  for (let name of names) {
    data = refObject[name];
    refObject = refObject[name];
    ++depthCount;
    if (typeof refObject !== "object" || refObject === null) {
      break;
    }
  }
  return names.length !== depthCount ? undefined : data;
};

export const getErrorMsg = (defaultMessage: string, msg?: string) => {
  return typeof msg === "string" ? msg : defaultMessage;
};
