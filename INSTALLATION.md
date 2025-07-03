# Installation Guide - Custom Order Workflow

## Prerequisites

Before installing the Custom Order Workflow app, ensure your system meets the following requirements:

### System Requirements

| Component | Minimum Version | Recommended Version |
|-----------|----------------|-------------------|
| ERPNext | v15.0.0 | v15.x.x (latest) |
| Frappe Framework | v15.0.0 | v15.x.x (latest) |
| Python | 3.8 | 3.11+ |
| Node.js | 18.0 | 20.x (LTS) |
| MariaDB | 10.6 | 10.11+ |
| Redis | 6.0 | 7.0+ |

### Hardware Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM | 4GB | 8GB+ |
| CPU | 2 cores | 4+ cores |
| Storage | 20GB | 50GB+ SSD |
| Network | 10 Mbps | 100 Mbps+ |

## Pre-Installation Checklist

### 1. Verify ERPNext Installation

```bash
# Check ERPNext version
bench version

# Verify site is accessible
bench --site [your-site] console
```

### 2. Check User Permissions

Ensure you have:
- System Administrator access to ERPNext
- SSH access to the server
- Sudo privileges for bench commands

### 3. Backup Current System

```bash
# Create full backup before installation
bench --site [your-site] backup --with-files

# Verify backup was created
ls -la sites/[your-site]/private/backups/
```

## Installation Methods

### Method 1: Direct Installation (Recommended)

#### Step 1: Download the App

```bash
# Navigate to your bench directory
cd /path/to/frappe-bench

# Download the app
bench get-app custom_order_workflow https://github.com/your-repo/custom_order_workflow.git
```

#### Step 2: Install on Site

```bash
# Install the app
bench --site [your-site] install-app custom_order_workflow

# Restart services
bench restart
```

#### Step 3: Run Migrations

```bash
# Apply database migrations
bench --site [your-site] migrate

# Clear cache
bench --site [your-site] clear-cache
```

### Method 2: Manual Installation

#### Step 1: Download Source Code

```bash
# Clone repository
git clone https://github.com/your-repo/custom_order_workflow.git

# Move to apps directory
mv custom_order_workflow /path/to/frappe-bench/apps/
```

#### Step 2: Install Dependencies

```bash
# Install Python dependencies
cd /path/to/frappe-bench/apps/custom_order_workflow
pip install -r requirements.txt
```

#### Step 3: Add to Site

```bash
# Add app to site
bench --site [your-site] install-app custom_order_workflow
```

## Post-Installation Configuration

### 1. Verify Installation

```bash
# Check if app is installed
bench --site [your-site] list-apps

# Verify DocTypes are created
bench --site [your-site] console
>>> frappe.get_doc("DocType", "Pre-Quotation")
```

### 2. Configure User Roles

#### Create Required Roles

1. **Sales User Role**
   ```bash
   bench --site [your-site] console
   >>> role = frappe.new_doc("Role")
   >>> role.role_name = "Sales User"
   >>> role.insert()
   ```

2. **Manufacturing User Role**
   ```bash
   >>> role = frappe.new_doc("Role")
   >>> role.role_name = "Manufacturing User"
   >>> role.insert()
   ```

#### Assign Permissions

Navigate to **Setup > Permissions > Role Permissions Manager** and configure:

**Pre-Quotation Permissions:**
- Sales User: Create, Read, Write, Email, Print
- Sales Manager: All permissions including Submit
- Manufacturing User: Read, Write (limited fields)

### 3. Setup Email Configuration

#### Configure SMTP Settings

1. Go to **Setup > Email > Email Account**
2. Create new email account with SMTP settings:
   ```
   Email Address: noreply@yourcompany.com
   SMTP Server: smtp.gmail.com
   Port: 587
   Use TLS: Yes
   Username: your-email@gmail.com
   Password: your-app-password
   ```

#### Test Email Functionality

```bash
# Test email from console
bench --site [your-site] console
>>> frappe.sendmail(recipients=["test@example.com"], subject="Test", message="Test message")
```

### 4. Import Fixtures and Sample Data

```bash
# Import workflow definitions
bench --site [your-site] console
>>> frappe.reload_doc("custom_order_workflow", "fixtures", "workflow")

# Import sample data (optional)
bench --site [your-site] execute custom_order_workflow.install.create_sample_data
```

### 5. Configure Workspace

The Sales Workspace should be automatically created. To verify:

1. Go to **Setup > Workspace**
2. Check "Sales Workspace" exists
3. Assign roles: Sales User, Sales Manager

### 6. Setup Naming Series

Configure naming series for Pre-Quotation:

1. Go to **Setup > Settings > Naming Series**
2. Find "Pre-Quotation" in the list
3. Set series: `PRE-QTN-.YYYY.-`

## Advanced Configuration

### 1. Custom Field Configuration

Add custom fields to existing DocTypes if needed:

```python
# Example: Add custom field to Customer
custom_field = {
    "doctype": "Custom Field",
    "dt": "Customer",
    "fieldname": "furniture_preferences",
    "label": "Furniture Preferences",
    "fieldtype": "Text",
    "insert_after": "customer_details"
}
frappe.get_doc(custom_field).insert()
```

### 2. Workflow Customization

Modify workflow states and transitions:

1. Go to **Setup > Workflow**
2. Edit "Pre-Quotation Workflow"
3. Add custom states or modify transitions

### 3. Report Configuration

Setup custom reports:

```bash
# Install custom reports
bench --site [your-site] console
>>> frappe.reload_doc("custom_order_workflow", "report", "pre_quotation_summary")
```

### 4. Dashboard Configuration

Configure dashboard widgets:

1. Go to **Setup > Dashboard**
2. Create custom dashboard for sales team
3. Add relevant charts and metrics

## Troubleshooting Installation Issues

### Common Installation Problems

#### 1. App Not Found Error

**Error:** `App custom_order_workflow not found`

**Solution:**
```bash
# Verify app is in apps directory
ls apps/custom_order_workflow

# If missing, re-download
bench get-app custom_order_workflow [repository-url]
```

#### 2. Migration Errors

**Error:** `Migration failed for custom_order_workflow`

**Solution:**
```bash
# Check migration logs
tail -f logs/worker.error.log

# Run migration manually
bench --site [your-site] console
>>> frappe.reload_doctype("Pre-Quotation")
```

#### 3. Permission Errors

**Error:** `Permission denied for DocType Pre-Quotation`

**Solution:**
```bash
# Reset permissions
bench --site [your-site] console
>>> frappe.reset_perms("Pre-Quotation")
```

#### 4. Asset Build Errors

**Error:** `Assets not found or CSS not loading`

**Solution:**
```bash
# Build assets
bench build

# Clear cache
bench --site [your-site] clear-cache

# Restart services
bench restart
```

### Database Issues

#### 1. Table Creation Errors

```sql
-- Manually create tables if needed
CREATE TABLE `tabPre-Quotation` (
    `name` varchar(140) NOT NULL,
    `creation` datetime(6) DEFAULT NULL,
    `modified` datetime(6) DEFAULT NULL,
    -- Add other fields as needed
    PRIMARY KEY (`name`)
);
```

#### 2. Index Creation

```sql
-- Add performance indexes
ALTER TABLE `tabPre-Quotation` ADD INDEX idx_status (status);
ALTER TABLE `tabPre-Quotation` ADD INDEX idx_customer (customer);
```

### Performance Optimization

#### 1. Enable Caching

```bash
# Configure Redis caching
bench config set-common-config redis_cache "redis://localhost:6379"
bench config set-common-config redis_queue "redis://localhost:6379"
```

#### 2. Database Optimization

```sql
-- Optimize database tables
OPTIMIZE TABLE `tabPre-Quotation`;
OPTIMIZE TABLE `tabPre-Quotation Item`;
```

## Verification Steps

### 1. Functional Testing

#### Test Pre-Quotation Creation

1. Login as Sales User
2. Navigate to Sales Workspace
3. Create new Pre-Quotation
4. Add furniture items with specifications
5. Submit to Manufacturing

#### Test Workflow Transitions

1. Login as Manufacturing User
2. Open submitted Pre-Quotation
3. Add cost estimates
4. Change status to "Costing Done"

#### Test Quotation Generation

1. Login as Sales Manager
2. Approve Pre-Quotation
3. Generate Quotation
4. Verify items are created correctly

### 2. Performance Testing

```bash
# Test database performance
bench --site [your-site] console
>>> import time
>>> start = time.time()
>>> frappe.get_all("Pre-Quotation", limit=100)
>>> print(f"Query time: {time.time() - start} seconds")
```

### 3. Email Testing

```bash
# Test workflow notifications
bench --site [your-site] console
>>> doc = frappe.get_doc("Pre-Quotation", "PRE-QTN-2024-00001")
>>> doc.status = "Submitted to Manufacturing"
>>> doc.save()
# Check if email is sent
```

## Rollback Procedures

### 1. Uninstall App

```bash
# Uninstall app from site
bench --site [your-site] uninstall-app custom_order_workflow

# Remove app from bench
bench remove-app custom_order_workflow
```

### 2. Restore from Backup

```bash
# Restore database
bench --site [your-site] restore [backup-file]

# Restore files
bench --site [your-site] restore [backup-file] --with-files
```

### 3. Clean Installation

```bash
# Remove all traces
rm -rf apps/custom_order_workflow
bench --site [your-site] migrate
bench restart
```

## Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly:**
   - Check error logs
   - Monitor performance
   - Backup database

2. **Monthly:**
   - Update app if new version available
   - Review user feedback
   - Optimize database

3. **Quarterly:**
   - Security audit
   - Performance review
   - User training updates

### Getting Support

- **Documentation:** Check README.md and user guides
- **Community:** ERPNext community forums
- **Issues:** GitHub repository issues
- **Professional:** Contact system administrator

---

**Installation Guide Version:** 1.0  
**Last Updated:** January 2024  
**Compatible with:** ERPNext v15.x

