# useForm Hook

## Overview

`useForm` is a powerful and flexible React hook for managing form state, validation, and interactions. It provides a comprehensive solution for handling form inputs with advanced features like state management, validation, and form-level controls.

## Installation

```bash
npm install rc-hook-form 
```
or 
```sh
yarn add rc-hook-form
```

## `Controller` Component

The `Controller` component provides an advanced way to render and control form fields with more flexibility.

### Controller Props

```typescript
interface ControllerProps {
  name: string;
  type: InputType;
  control: ReturnType<typeof useForm>["control"];
  initialValue?: unknown;
  rules?: ValidationFields;
  disabled?: boolean;
  runValidationWhenChangesIn?: string[];
  ref?: React.MutableRefObject<EventElement>;
  radioFieldValue?: string;
  checkboxFieldValue?: string;
  render: (arg: RenderProp) => React.JSX.Element;
}
```


### Render Prop Details

The `render` prop receives two arguments:

#### `field` Object
- `value`: Current field value
- `checked`: Checkbox/radio checked state
- `multiple`: Select multiple state
- `disabled`: Field disabled state
- `name`: Field name
- `type`: Input type
- `onBlur`: Blur event handler
- `onChange`: Change event handler
- `onFocus`: Focus event handler
- `ref`: Reference to the input element

#### `fieldState` Object
- `isTouched`: Whether the field has been touched
- `isDirty`: Whether the field value has changed from initial
- `invalid`: Whether the field has validation errors
- `isActive`: Whether the field is currently focused
- `error`: Validation error messages



## Basic Usage

```typescript
const MyForm = () => {
  const { register, handleSubmit, formState } = useForm({
    initialState: { username: '', email: '' }
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('username', { required: true })} />
      <input {...register('email', { required: true, email: true })} />
      <button type="submit">Submit</button>
    </form>
  );
};
```

### Controller Example

```typescript
const MyForm = () => {
  const { control } = useForm();

  return (
    <form>
      <Controller
        name="username"
        type="text"
        control={control}
        rules={{ required: true, minLength: 3 }}
        render={({ field, fieldState }) => (
          <div>
            <input {...field} />
            {fieldState.invalid && <span>Invalid input</span>}
          </div>
        )}
      />
    </form>
  );
};
```

## Advanced Example with Controller

```typescript
const ComplexForm = () => {
  const { control, handleSubmit } = useForm({
    initialState: {
      username: '',
      termsAccepted: false
    }
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="username"
        type="text"
        control={control}
        rules={{ 
          required: 'Username is required',
          minLength: { value: 3, message: 'Min 3 characters' }
        }}
        render={({ field, fieldState }) => (
          <div>
            <input {...field} />
            {fieldState.invalid && <span>{fieldState.error}</span>}
          </div>
        )}
      />

      <Controller
        name="termsAccepted"
        type="checkbox"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <div>
            <input 
              type="checkbox" 
              checked={field.checked} 
              onChange={field.onChange} 
            />
            <label>Accept Terms</label>
          </div>
        )}
      />
    </form>
  );
};
```

## Additional Notes on Controller

- Provides more granular control over form field rendering
- Supports complex validation scenarios
- Allows custom rendering of form fields
- Integrates seamlessly with the `useForm` hook

## API Reference

### Parameters

#### `UseFormParam<T>`
- `initialState`: Optional initial form values of type `T`

### Return Object

The `useForm` hook returns an object with the following properties:

#### `formState`
An object containing form-level state:
- `values`: Current form values
- `active`: Fields currently in focus
- `touched`: Fields that have been interacted with
- `errors`: Validation errors
- `invalid`: Boolean indicating if form is invalid
- `fieldPristine`: Pristine state of individual fields
- `formPristine`: Overall form pristine state

#### `control` Methods
- `getFormState()`: Returns current form state
- `register(name, type, extraProps)`: Registers an input field
- `resetForm()`: Resets entire form to initial state
- `resetField(name)`: Resets specific field to initial value
- `setField(name, value, options)`: Manually set field value

#### `handleSubmit(callback)`
Wraps form submission with validation check

### `register` Method Details

```typescript
register(
  name: string, 
  type: InputType, 
  extra?: {
    radioFieldValue?: any,
    checkboxFieldValue?: any,
    ref?: React.Ref,
    disabled?: boolean,
    runValidationWhenChangeIn?: string[],
    handleOnChange?: (e) => void,
    handleOnBlur?: (e) => void,
    handleOnFocus?: (e) => void,
    // Validation rules
    required?: boolean | string,
    minLength?: { value: number, message?: string },
    maxLength?: { value: number, message?: string },
    // Custom validation functions can be added
  }
)
```

### Validation Features

- Supports multiple validation types
- Custom error messages
- Linked validation between fields
- Validation runs on touched fields
- Supports various input types (text, radio, checkbox, select)

## Advanced Example

```typescript
const MyComplexForm = () => {
  const { 
    register, 
    formState: { errors, invalid }, 
    setField, 
    resetForm 
  } = useForm({
    initialState: {
      username: '',
      email: '',
      termsAccepted: false
    }
  });

  const validatePassword = (value) => {
    return value.length >= 8 ? VALID : 'Password too short';
  };

  return (
    <form>
      <input 
        {...register('username', { 
          required: 'Username is required',
          minLength: { value: 3, message: 'Min 3 characters' }
        })}
      />
      {errors.username && <span>{errors.username[0]}</span>}

      <input 
        {...register('password', { 
          validate: validatePassword 
        })}
      />

      <button disabled={invalid}>Submit</button>
    </form>
  );
};
```

## Performance Considerations

- Uses `useMemo` and `useCallback` for optimized rendering
- Batched updates with `unstable_batchedUpdates`
- Minimal re-renders through efficient state management

## TypeScript Support

Full TypeScript support with generic type inference for form values.


## Contributing

Contributions welcome! Please submit issues and pull requests on GitHub.


