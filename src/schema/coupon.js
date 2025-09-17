import { object, string, number, date, boolean, ref } from "yup";

export const createNewCouponSchema = object().shape({
  code: string().required("Coupon code is required"),
  description: string(),
  type: string()
    .oneOf(["percentage", "fixed", "free_shipping"])
    .required("نوع الكوبون مطلوب"),
  value: number().min(1).nullable(),
  maxUsageCount: number().min(1).nullable(),
  perUserUsageCount: number().min(1).nullable(),
  maxDiscountAmount: number().min(0).nullable(),
  startDate: date().required("تاريخ البدء مطلوب"),
  expirationDate: date()
    .required("تاريخ الانتهاء مطلوب")
    .min(ref("startDate"), "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء"),
  isActive: boolean().default(true).optional(),
});

export const updateCouponSchema = object().shape({
  code: string().optional(),
  description: string().optional(),
  type: string().oneOf(["percentage", "fixed", "free_shipping"]).optional(),
  value: number().optional(),
  maxUsageCount: number().min(1).nullable().optional(),
  perUserUsageCount: number().min(1).nullable().optional(),
  maxDiscountAmount: number().min(0).nullable().optional(),
  startDate: date().optional(),
  expirationDate: date()
    .min(ref("startDate"), "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء")
    .optional(),
  isActive: boolean().default(true).optional(),
});
