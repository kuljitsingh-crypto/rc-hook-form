import React, { useRef } from "react";
// import { useForm, Controller } from "rc-simple-hook-form";
import { useForm, Controller } from "../../src";

function Test() {
  const { register, control, formState, setField, resetForm, handleSubmit } =
    useForm({
      initialState: { size: ["x"], testing: "", abc: "1" },
    });
  const inputRef = useRef(null);
  console.log(formState, inputRef);
  const formSubmit = (data) => {
    console.log(data);
  };

  return (
    <div>
      {" "}
      <form onSubmit={handleSubmit(formSubmit)}>
        <input
          {...register("testing", "text", {
            required: true,
            validEmail: true,
            minLength: { value: 8 },
          })}
        />
        <label>Size:</label>
        <label htmlFor='x'>x</label>
        <input
          id='x'
          {...register("size", "checkbox", { checkboxFieldValue: "x" })}
        />
        <label htmlFor='xx'>xx</label>
        <input
          id='xx'
          {...register("size", "checkbox", { checkboxFieldValue: "xx" })}
        />
        <label htmlFor='xxx'>xxx</label>
        <input
          id='xxx'
          {...register("size", "checkbox", { checkboxFieldValue: "xxx" })}
        />
        <select {...register("abc", "select-one")}>
          <option value='1'>1</option>
          <option value='2'>2</option>
          <option value='3'>3</option>
          <option value='4'>4</option>
          <option value='5'>5</option>
        </select>
        <Controller
          name='controller'
          type='text'
          control={control}
          rules={{ required: true }}
          initialValue={"fdsjfkdshk"}
          controllerRef={inputRef}
          render={(renderProps) => {
            const { field } = renderProps;
            return <input {...field} />;
          }}
        />
        <button
          type='button'
          onClick={() => {
            resetForm();
          }}>
          reset Form
        </button>
      </form>
    </div>
  );
}

export default Test;
