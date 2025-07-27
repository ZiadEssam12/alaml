const endpoint = "https://formspree.io/f/xkgzrkvq";

async function submitForm(data) {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        subject: data.subject,
        message: data.message,
        type: data.type,
        website: "مكتبة الأمل",
        timestamp: new Date().toISOString(),
      }),
    });

    const result = await response.json();

    return {
      ok: response.ok,
      next: result.next,
      errors: result.errors,
    };
  } catch (error) {
    console.error("Error submitting form:", error);
    return {
      ok: false,
      errors: [{ field: "general", message: "حدث خطأ في إرسال الرسالة" }],
    };
  }
}

// نموذج التواصل العام
export async function submitContactForm(data) {
  return submitForm({
    ...data,
    subject: "رسالة تواصل من موقع مكتبة الأمل",
    type: "contact",
  });
}

// نموذج الاستفسار
export async function submitInquiryForm(data) {
  return submitForm({
    ...data,
    type: "inquiry",
  });
}

// نموذج الشكاوى
export async function submitComplaintForm(data) {
  return submitForm({
    ...data,
    subject: `شكوى - ${
      data.orderNumber ? `طلب رقم: ${data.orderNumber}` : "عام"
    }`,
    message: `${data.orderNumber ? `رقم الطلب: ${data.orderNumber}\n\n` : ""}${
      data.message
    }`,
    type: "complaint",
  });
}

// نموذج الطلب المخصص
export async function submitCustomOrderForm(data) {
  return submitForm({
    ...data,
    subject: `طلب منتج مخصص: ${data.productName}`,
    message: `تفاصيل الطلب المخصص:
            
        المنتج المطلوب: ${data.productName}
        الوصف: ${data.description}
        الكمية: ${data.quantity}
        ${data.budget ? `الميزانية المتوقعة: ${data.budget}` : ""}

        معلومات التواصل:
        الاسم: ${data.name}
        البريد الإلكتروني: ${data.email}
        الهاتف: ${data.phone}`,
    type: "custom-order",
  });
}
