# Product Variants - Quick Start Guide

## Dashboard URLs

### Access Product Management

- **Products List**: `/dashboard/products`
- **Edit Product with Variants**: `/dashboard/products/[productId]`
- **Direct to Variants**: `/dashboard/products/[productId]/variants`

## Tabbed Interface

When you open a product for editing (`/dashboard/products/[productId]`), you'll see 4 tabs:

### Tab 1: Details

- Edit product name, description, price, stock
- Manage general product information
- Edit category and other base fields

### Tab 2: Images

- Manage product cover images
- (Variant-specific images managed in Variants tab)

### Tab 3: Options

**Use this to create product attributes like Size, Color, etc.**

**Example Workflow:**

1. Click "Add Option"
2. Option name: "Size"
3. Presentation: "Pill Button"
4. First value: "Small"
5. Click "Create Option"
6. Add more values by editing the option

**What's a presentation type?**

- **Select Dropdown**: Shows as `<select>` input
- **Pill Button**: Shows as clickable buttons (e.g., S, M, L)
- **Color Swatch**: Shows as color circles with hex/image support (e.g., Red, Blue)

### Tab 4: Variants

**Use this to manage product variations (Size + Color combinations)**

#### Quick Start - Method 1: Auto-Generate

1. First, create Options (go to Options tab)
2. In Variants tab, click "Generate from Options"
3. System creates all possible combinations automatically
4. Edit prices, stock, and SKUs for each variant

#### Quick Start - Method 2: Manual Add

1. Click "Add Variant"
2. Select one value for each option
3. Enter price, stock, optional SKU
4. Add variant images (optional)
5. Click "Create Variant"

#### Managing Variants

- **Edit**: Click pencil icon → update fields → save
- **Delete**: Click trash icon → confirm
- **Bulk Update**: Coming soon (update multiple at once)

## API Examples

### Generate 100 Variants (e.g., 10 sizes × 10 colors)

Automatically creates combinations. No manual work needed!

- Just create options with values
- Click "Generate from Options"
- Done!

### Variant Selection Flow (Frontend)

When customer views product:

1. Sees available options (Size dropdown, Color swatches, etc.)
2. Selects one value per option
3. System shows variant price (can differ from product price)
4. System shows variant stock (can differ from product stock)
5. Customer adds to cart with specific variant
6. Cart shows which variant was selected

## Database Structure

```
Product
  └─ ProductOptions (Size, Color, etc.)
     └─ ProductOptionValues (S,M,L), (Red,Blue)
        └─ ProductVariants
           └─ Specific combinations (S+Red, S+Blue, M+Red, etc.)
```

## Common Tasks

### How to offer Size & Color options?

1. **Create Size option**

   - Name: "Size"
   - Type: Pill Button
   - Values: Small, Medium, Large

2. **Create Color option**

   - Name: "Color"
   - Type: Color Swatch
   - Values: Red (#FF0000), Blue (#0000FF)

3. **Generate Variants**

   - Creates 6 combinations:
     - Size: Small | Color: Red → $99.99
     - Size: Small | Color: Blue → $99.99
     - Size: Medium | Color: Red → $99.99
     - Size: Medium | Color: Blue → $99.99
     - Size: Large | Color: Red → $109.99
     - Size: Large | Color: Blue → $109.99

4. **Adjust Variant Prices**
   - Large sizes might cost more
   - Edit each variant's price
   - Or bulk update all to same price

### How to offer Digital & Physical products?

Option 1: No variants

- Create product without options/variants
- Stock represents digital copies

Option 2: With variants

- Size variant = "Digital", "Physical"
- Different prices and stock per variant

### How to disable a variant?

1. Go to Variants tab
2. Edit the variant
3. Toggle "Inactive"
4. Save
5. Variant won't appear in frontend

## Best Practices

✅ **Do:**

- Create options before generating variants
- Use meaningful option names (Size, Color, not Opt1, Opt2)
- Set variant prices if they differ from product price
- Use consistent SKU format (e.g., PROD-SIZE-COLOR)
- Use color swatches with hex codes for visual clarity

❌ **Don't:**

- Create too many options (3-4 max recommended)
- Create too many values per option (10+ gets unwieldy)
- Forget to set stock for each variant
- Change options after generating variants (deactivates old variants)

## Troubleshooting

**"Option already exists"**

- Can't have two "Size" options
- Delete the first one or rename

**"This variant combination already exists"**

- You've already created Small+Red variant
- Can't create duplicates
- But you can edit the existing one

**Variants don't appear on frontend**

- Check if variant is set to "Active"
- Check if product is "Active"
- Clear browser cache
- Check frontend is using correct variant API endpoints

**Bulk update not working**

- Check you selected at least one variant
- Check all IDs are valid

## Advanced: API Calls (For Developers)

### Generate Variants with Custom Settings

```javascript
POST /api/dashboard/products/{id}/variants/generate
{
  "strategy": "cartesian",
  "basePrice": 199.99,
  "baseStock": 50,
  "includeInactive": false
}
```

### Bulk Update Variants

```javascript
PUT /api/dashboard/products/{id}/variants/bulk
{
  "ids": ["var1", "var2", "var3"],
  "set": {
    "price": 249.99,
    "stockQuantity": 100,
    "isActive": true
  }
}
```

### Get All Options

```javascript
GET / api / dashboard / products / { id } / options;
```

### Get All Variants

```javascript
GET / api / dashboard / products / { id } / variants;
```

## Questions?

Check the following files:

- `PRODUCT_VARIANTS_IMPLEMENTATION.md` - Complete technical documentation
- `product-variants-fe-dashboard.md` - UI/UX specification
- API route files in `src/app/api/dashboard/products/[id]/`
