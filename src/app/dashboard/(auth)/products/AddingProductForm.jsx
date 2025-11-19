"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddProductForm from "./AddProductForm";
import EditProductForm from "./EditProductForm";

function AddingProductForm({
  dialogOpen,
  setDialogOpen,
  formData,
  setFormData,
  editingProduct,
  handleSubmit,
  categories,
}) {
  const handleClose = () => {
    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent
        className={`${
          editingProduct && "min-w-4xl"
        } max-h-[95vh] overflow-y-auto`}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
          </DialogTitle>
        </DialogHeader>

        {/* Conditional rendering - Add or Edit */}
        {editingProduct ? (
          <EditProductForm
            productId={editingProduct.id}
            handleClose={handleClose}
          />
        ) : (
          <AddProductForm
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            categories={categories}
            handleClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AddingProductForm;
