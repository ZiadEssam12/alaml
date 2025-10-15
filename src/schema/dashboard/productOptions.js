import * as yup from "yup";

// Shared
export const PresentationEnum = ["swatch", "pill", "select"];

// Create option with one value (for single creation)
export const CreateOptionInput = yup.object({
  name: yup.string().trim().required("اسم الخيار مطلوب"),
  presentation: yup
    .string()
    .oneOf([...PresentationEnum, null], "نوع العرض غير صالح")
    .nullable()
    .optional(),
  // Single value fields
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

// Update option metadata only (no values)

// Create additional value for existing option
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

// Full option schema (for responses)
export const OptionValueSchema = yup.object({
  id: yup.string().uuid().required(),
  optionId: yup.string().uuid().required(),
  value: yup.string().required(),
  hex: yup.string().nullable().optional(),
  imageUrl: yup.string().nullable().optional(),
  position: yup.number().integer().min(0).required(),
  createdAt: yup.string().optional(),
  updatedAt: yup.string().optional(),
});

export const OptionSchema = yup.object({
  id: yup.string().uuid().required(),
  productId: yup.string().uuid().required(),
  name: yup.string().required(),
  presentation: yup
    .string()
    .oneOf([...PresentationEnum, null])
    .nullable()
    .optional(),
  position: yup.number().integer().min(0).required(),
  values: yup.array().of(OptionValueSchema).default([]),
  createdAt: yup.string().optional(),
  updatedAt: yup.string().optional(),
});

// Response shapes
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

export const UpdateOptionOrValueInput = yup.object({
  // Option fields
  name: yup.string().trim().optional(),
  presentation: yup
    .string()
    .oneOf([...PresentationEnum, null], "نوع العرض غير صالح")
    .nullable()
    .optional(),
  // Value fields
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
