import * as Yup from "yup";

export function OfferFormSchema() {
  return Yup.object().shape({
    title: Yup.string().required("مطلوب"),
    description: Yup.string().required("مطلوب"),
    scope: Yup.string().required("مطلوب"),
    productId: Yup.string().when("scope", {
      is: (value) => value === "product" || value === "variant",
      then: () => Yup.string().required("مطلوب"),
      otherwise: () => Yup.string().notRequired(),
    }),
    categoryId: Yup.string().when("scope", {
      is: (value) => value === "category",
      then: () => Yup.string().required("مطلوب"),
      otherwise: () => Yup.string().notRequired(),
    }),
    variantId: Yup.string().when("scope", {
      is: (value) => value === "variant",
      then: () => Yup.string().required("مطلوب"),
      otherwise: () => Yup.string().notRequired(),
    }),
    type: Yup.string().required("مطلوب"),
    value: Yup.number().typeError("يجب أن يكون رقمًا").required("مطلوب"),
    isActive: Yup.boolean().required("مطلوب"),
    isAutoApply: Yup.boolean().required("مطلوب"),
    maxUsageCount: Yup.number().typeError("يجب أن يكون رقمًا").nullable(),
    perUserUsageCount: Yup.number().typeError("يجب أن يكون رقمًا").nullable(),
    maxDiscountAmount: Yup.number().typeError("يجب أن يكون رقمًا").nullable(),
    minCartAmount: Yup.number().typeError("يجب أن يكون رقمًا").nullable(),
    startDate: Yup.date().required("مطلوب"),
    expirationDate: Yup.date().required("مطلوب"),
  });
}

export function validateOfferForm(values) {
  const schema = OfferFormSchema();
  let errors = {};
  let isValid = true;
  try {
    schema.validateSync(values, { abortEarly: false });
  } catch (validationError) {
    isValid = false;
    if (validationError && validationError.inner) {
      validationError.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
    }
  }
  return { isValid, errors };
}
