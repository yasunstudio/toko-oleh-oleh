# Data Export Documentation - Toko Oleh-Oleh

## Overview

This application provides comprehensive data export capabilities in both JSON and CSV formats. The export system includes multiple methods to extract data for analysis, backup, or integration with external systems.

## Export Methods Available

### 1. Admin Dashboard Export Features

The application includes built-in export features accessible through the admin dashboard:

- **Customer Reports** (`/api/admin/reports/customers/export`) - Excel format
- **Financial Reports** (`/api/admin/reports/financial/export`) - Excel format  
- **Inventory Reports** (`/api/admin/reports/inventory/export`) - Excel format
- **Product Reports** (`/api/admin/reports/products/export`) - Excel format
- **Payment Reports** (Payment Report component) - CSV format

### 2. Custom Export Scripts

Two powerful command-line scripts have been created for comprehensive data export:

#### JSON Export Script (`scripts/export-data.ts`)
- **Purpose**: Export complete data with relationships in JSON format
- **File**: `scripts/export-data.ts`
- **Output Directory**: `./data-exports/`

**Usage:**
```bash
# Export all tables
npm run export-data all

# Export specific table
npm run export-data table users
npm run export-data table products
npm run export-data table categories
npm run export-data table orders
npm run export-data table contactmessages
npm run export-data table heroslides
```

**Available Tables:**
- `users` - User accounts with orders and cart relationships
- `products` - Products with categories, images, and order items
- `categories` - Product categories with related products
- `orders` - Orders with user info and order items
- `contactmessages` - Contact form submissions
- `heroslides` - Homepage carousel slides
- `bankaccounts` - Payment bank account information

#### CSV Export Script (`scripts/export-csv.ts`)
- **Purpose**: Export flattened data suitable for spreadsheet analysis
- **File**: `scripts/export-csv.ts`
- **Output Directory**: `./csv-exports/`

**Usage:**
```bash
# Export all data to CSV
npm run export-csv all

# Export specific data
npm run export-csv users       # User information
npm run export-csv products    # Product catalog
npm run export-csv categories  # Categories
npm run export-csv orders      # Order details
npm run export-csv contacts    # Contact messages
npm run export-csv sales       # Sales report with item details
```

## Export Data Structure

### JSON Export Structure

The JSON exports maintain full relational data:

```json
{
  "users": [
    {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "orders": [...],
      "cart": [...]
    }
  ]
}
```

### CSV Export Structure

CSV exports provide flattened data optimized for analysis:

**Users CSV:**
- id, name, email, role, address, totalOrders, createdAt, updatedAt

**Products CSV:**
- id, name, slug, description, price, stock, categoryName, isActive, totalSold, createdAt, updatedAt

**Orders CSV:**
- id, orderNumber, customerName, customerEmail, totalAmount, status, paymentStatus, totalItems, shippingAddress, notes, createdAt, updatedAt

**Sales Report CSV:**
- orderId, orderNumber, orderDate, customerName, customerEmail, productId, productName, categoryName, quantity, unitPrice, totalItemPrice, orderTotalAmount, paymentStatus, orderStatus

## File Naming Convention

All exported files follow this naming pattern:
- **JSON**: `{table_name}_{YYYY-MM-DD}.json`
- **CSV**: `{table_name}_{YYYY-MM-DD}.csv`

Example: `users_2025-05-26.json`, `sales_report_2025-05-26.csv`

## Database Models Exported

### Core Business Data
- **Users** - Customer and admin accounts
- **Products** - Product catalog with pricing and inventory
- **Categories** - Product categorization
- **Orders** - Purchase transactions
- **OrderItems** - Individual items within orders

### Content Management
- **Contact** - Customer inquiries and support messages
- **HeroSlide** - Homepage carousel content
- **BankAccount** - Payment processing information

### System Data
- **CartItem** - Shopping cart contents (included in user exports)
- **ProductImage** - Product gallery images (included in product exports)

## Security Considerations

1. **Access Control**: Export scripts should only be run by authorized administrators
2. **Data Sensitivity**: Exported files contain sensitive customer and business data
3. **File Storage**: Store exported files securely and delete when no longer needed
4. **Environment**: Export scripts connect to the production database as configured in environment variables

## Best Practices

1. **Regular Backups**: Schedule regular exports for data backup purposes
2. **Incremental Exports**: For large datasets, consider adding date filters
3. **Cleanup**: Regularly remove old export files to manage storage
4. **Validation**: Always verify export data integrity after running scripts
5. **Documentation**: Keep track of what data was exported and when

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify `DATABASE_URL` environment variable
   - Check database server availability

2. **Permission Errors**
   - Ensure write permissions to export directories
   - Check file system space availability

3. **Memory Issues for Large Exports**
   - Consider splitting large exports into smaller chunks
   - Add pagination for very large datasets

### Error Handling

Both export scripts include comprehensive error handling:
- Database connection validation
- File write error handling
- Graceful cleanup on failures
- Detailed error messages for debugging

## Integration with External Systems

The exported data can be used for:

1. **Business Intelligence**: Import CSV files into Excel, Google Sheets, or BI tools
2. **Data Migration**: Use JSON exports for moving to new systems
3. **Analytics**: Process sales reports for business insights
4. **Compliance**: Generate reports for auditing and regulatory requirements
5. **Backup and Recovery**: Regular JSON exports for data backup

## Future Enhancements

Potential improvements to the export system:

1. **Scheduled Exports**: Automated daily/weekly export jobs
2. **Email Delivery**: Send export files via email
3. **Cloud Storage**: Direct upload to AWS S3 or Google Cloud
4. **Filtering Options**: Date ranges, status filters, customer segments
5. **Real-time Exports**: API endpoints for on-demand exports
6. **Data Compression**: Zip files for large exports
7. **Export History**: Track and manage previous exports

---

**Last Updated**: May 26, 2025  
**Version**: 1.0  
**Maintainer**: Toko Oleh-Oleh Development Team
