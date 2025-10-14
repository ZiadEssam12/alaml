import * as yup from "yup";

// Shared
export const PresentationEnum = ["swatch", "pill", "select"];

// 1) optionValue (ProductOptionValue)
export const OptionValueSchema = yup.object({
  id: yup.string().uuid().optional(),
  optionId: yup.string().uuid().optional(),
  value: yup.string().trim().required("القيمة مطلوبة"),
  hex: yup
    .string()
    .trim()
    .matches(/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/, "لون hex غير صالح")
    .nullable()
    .optional(),
  imageUrl: yup.string().url("رابط صورة غير صالح").nullable().optional(),
  position: yup.number().integer().min(0).default(0),
  createdAt: yup.string().optional(),
  updatedAt: yup.string().optional(),
});

// Create/Update payloads for optionValue
export const CreateOptionValueInput = yup.object({
  value: yup.string().trim().required("القيمة مطلوبة"),
  hex: yup
    .string()
    .trim()
    .matches(/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/, "لون hex غير صالح")
    .nullable()
    .optional(),
  imageUrl: yup.string().url("رابط صورة غير صالح").nullable().optional(),
  position: yup.number().integer().min(0).default(0).optional(),
});

export const UpdateOptionValueInput = yup.object({
  value: yup.string().trim().optional(),
  hex: yup
    .string()
    .trim()
    .matches(/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/, "لون hex غير صالح")
    .nullable()
    .optional(),
  imageUrl: yup.string().url("رابط صورة غير صالح").nullable().optional(),
  position: yup.number().integer().min(0).optional(),
});

// 2) option (ProductOption)
export const OptionSchema = yup.object({
  id: yup.string().uuid().optional(),
  productId: yup.string().uuid().optional(),
  name: yup.string().trim().required("الاسم مطلوب"),
  presentation: yup
    .string()
    .oneOf([...PresentationEnum, null], "نوع العرض غير صالح")
    .nullable()
    .optional(),
  position: yup.number().integer().min(0).default(0),
  values: yup.array().of(OptionValueSchema).default([]),
  createdAt: yup.string().optional(),
  updatedAt: yup.string().optional(),
});

// Create/Update payloads for option
export const CreateOptionInput = yup.object({
  name: yup.string().trim().required("الاسم مطلوب"),
  presentation: yup
    .string()
    .oneOf([...PresentationEnum, null], "نوع العرض غير صالح")
    .nullable()
    .optional(),
  values: yup.array().of(CreateOptionValueInput).optional(),
});

export const UpdateOptionInput = yup.object({
  name: yup.string().trim().optional(),
  presentation: yup
    .string()
    .oneOf([...PresentationEnum, null], "نوع العرض غير صالح")
    .nullable()
    .optional(),
  position: yup.number().integer().min(0).optional(),
});

// Response shapes
export const OptionResponse = OptionSchema;
export const OptionsListResponse = yup.object({
  options: yup.array().of(OptionSchema).required(),
  pagination: yup
    .object({
      page: yup.number().integer().min(1).required(),
      pageSize: yup.number().integer().min(1).required(),
      totalOptions: yup.number().integer().min(0).required(),
      totalPages: yup.number().integer().min(0).required(),
      hasNextPage: yup.boolean().required(),
      hasPreviousPage: yup.boolean().required(),
    })
    .optional(),
});
