//  title: offer.title,
//       description: offer.description,
//       scope: offer.scope,
//       productId: offer.productId || "",
//       categoryId: offer.categoryId || "",
//       variantId: offer.variantId || "",
//       type: offer.type,
//       value: offer.value,
//       code: offer.code || "",
//       isActive: offer.isActive,
//       isAutoApply: offer.isAutoApply,
//       maxUsageCount: offer.maxUsageCount,
//       perUserUsageCount: offer.perUserUsageCount,
//       maxDiscountAmount: offer.maxDiscountAmount,
//       minCartAmount: offer.minCartAmount,
//       startDate: offer.startDate,
//       expirationDate: offer.expirationDate,
import * as Yup from "yup";

export function OfferFormSchema() {
  return Yup.object().shape({
    title: Yup.string().required("مطلوب"),
    description: Yup.string().required("مطلوب"),
    scope: Yup.string().required("مطلوب"),
    productId: Yup.string().when("scope", {
      is: "product",
      then: Yup.string().required("مطلوب"),
      otherwise: Yup.string().notRequired(),
    }),
    categoryId: Yup.string().when("scope", {
      is: "category",
      then: Yup.string().required("مطلوب"),
      otherwise: Yup.string().notRequired(),
    }),
    variantId: Yup.string().when("scope", {
      is: "variant",
      then: Yup.string().required("مطلوب"),
      otherwise: Yup.string().notRequired(),
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
  const isValid = schema.isValidSync(values);
  return { isValid, validationSchema: schema };
}
