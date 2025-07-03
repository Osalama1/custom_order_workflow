# Copyright (c) 2024, Manus AI and contributors
# For license information, please see license.txt

import frappe
import json
from frappe import _
from frappe.utils import nowdate, flt, cint
from frappe.model.document import Document


@frappe.whitelist()
def create_quotation_from_pre_quotation(pre_quotation):
    """Create a standard ERPNext Quotation from Pre-Quotation"""
    
    try:
        # Get the pre-quotation document
        pre_quote_doc = frappe.get_doc("Pre-Quotation", pre_quotation)
        
        if pre_quote_doc.status != "Approved Internally":
            frappe.throw(_("Pre-Quotation must be approved internally before creating quotation"))
        
        # Create customer if not exists
        customer = ensure_customer_exists(pre_quote_doc)
        
        # Create items first
        created_items = create_items_from_pre_quotation(pre_quotation)
        
        # Create quotation
        quotation = frappe.new_doc("Quotation")
        quotation.quotation_to = "Customer"
        quotation.party_name = customer
        quotation.transaction_date = nowdate()
        quotation.valid_till = pre_quote_doc.valid_until or nowdate()
        quotation.order_type = "Sales"
        quotation.custom_pre_quotation = pre_quotation
        
        # Add items to quotation
        for pre_item in pre_quote_doc.custom_furniture_items:
            if pre_item.item_code and created_items.get(pre_item.item_code):
                quotation_item = quotation.append("items")
                quotation_item.item_code = pre_item.item_code
                quotation_item.item_name = pre_item.item_name
                quotation_item.description = pre_item.description
                quotation_item.qty = pre_item.quantity
                quotation_item.uom = pre_item.uom
                quotation_item.rate = pre_item.selling_price or 0
                quotation_item.amount = quotation_item.qty * quotation_item.rate
        
        # Save and submit quotation
        quotation.insert()
        quotation.submit()
        
        # Update pre-quotation status
        pre_quote_doc.status = "Quotation Generated"
        pre_quote_doc.save()
        
        return quotation.name
        
    except Exception as e:
        frappe.log_error(f"Error creating quotation from pre-quotation {pre_quotation}: {str(e)}")
        frappe.throw(_("Error creating quotation: {0}").format(str(e)))


@frappe.whitelist()
def create_items_from_pre_quotation(pre_quotation):
    """Create ERPNext Items from Pre-Quotation items"""
    
    try:
        # Get the pre-quotation document
        pre_quote_doc = frappe.get_doc("Pre-Quotation", pre_quotation)
        created_items = {}
        
        for pre_item in pre_quote_doc.custom_furniture_items:
            if not pre_item.item_code:
                continue
                
            # Check if item already exists
            if frappe.db.exists("Item", pre_item.item_code):
                created_items[pre_item.item_code] = pre_item.item_code
                continue
            
            # Create new item
            item = frappe.new_doc("Item")
            item.item_code = pre_item.item_code
            item.item_name = pre_item.item_name
            item.description = pre_item.description
            item.item_group = get_or_create_item_group("Custom Furniture")
            item.stock_uom = pre_item.uom or "Nos"
            item.is_stock_item = 1
            item.is_sales_item = 1
            item.is_purchase_item = 1
            item.valuation_rate = pre_item.estimated_cost or 0
            item.standard_rate = pre_item.selling_price or 0
            
            # Add custom fields for specifications
            if hasattr(item, 'custom_specifications') and pre_item.specifications:
                item.custom_specifications = pre_item.specifications
            
            if hasattr(item, 'custom_manufacturing_notes') and pre_item.notes:
                item.custom_manufacturing_notes = pre_item.notes
            
            # Set item defaults
            item.append("item_defaults", {
                "company": frappe.defaults.get_user_default("Company"),
                "default_warehouse": get_default_warehouse(),
                "expense_account": get_default_expense_account(),
                "income_account": get_default_income_account()
            })
            
            item.insert()
            created_items[pre_item.item_code] = item.name
        
        return created_items
        
    except Exception as e:
        frappe.log_error(f"Error creating items from pre-quotation {pre_quotation}: {str(e)}")
        frappe.throw(_("Error creating items: {0}").format(str(e)))


@frappe.whitelist()
def get_visual_selector_data(pre_quotation):
    """Get visual selector data for a pre-quotation"""
    
    try:
        pre_quote_doc = frappe.get_doc("Pre-Quotation", pre_quotation)
        
        if pre_quote_doc.visual_items_data:
            return json.loads(pre_quote_doc.visual_items_data)
        
        return []
        
    except Exception as e:
        frappe.log_error(f"Error getting visual selector data for {pre_quotation}: {str(e)}")
        return []


@frappe.whitelist()
def save_visual_selector_data(pre_quotation, visual_data):
    """Save visual selector data to pre-quotation"""
    
    try:
        pre_quote_doc = frappe.get_doc("Pre-Quotation", pre_quotation)
        pre_quote_doc.visual_items_data = json.dumps(visual_data)
        pre_quote_doc.save()
        
        return {"success": True}
        
    except Exception as e:
        frappe.log_error(f"Error saving visual selector data for {pre_quotation}: {str(e)}")
        frappe.throw(_("Error saving visual data: {0}").format(str(e)))


@frappe.whitelist()
def get_dashboard_data():
    """Get dashboard data for sales team"""
    
    try:
        # Get current user's pre-quotations
        user_pre_quotations = frappe.db.get_list(
            "Pre-Quotation",
            filters={"owner": frappe.session.user},
            fields=["name", "status", "pre_quotation_date", "customer", "estimated_selling_price"],
            order_by="pre_quotation_date desc",
            limit=10
        )
        
        # Get status summary
        status_summary = frappe.db.sql("""
            SELECT status, COUNT(*) as count
            FROM `tabPre-Quotation`
            WHERE owner = %s
            GROUP BY status
        """, (frappe.session.user,), as_dict=True)
        
        # Get monthly statistics
        monthly_stats = frappe.db.sql("""
            SELECT 
                MONTH(pre_quotation_date) as month,
                YEAR(pre_quotation_date) as year,
                COUNT(*) as total_quotes,
                SUM(CASE WHEN status = 'Quotation Generated' THEN 1 ELSE 0 END) as converted,
                SUM(estimated_selling_price) as total_value
            FROM `tabPre-Quotation`
            WHERE owner = %s AND pre_quotation_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY YEAR(pre_quotation_date), MONTH(pre_quotation_date)
            ORDER BY year DESC, month DESC
        """, (frappe.session.user,), as_dict=True)
        
        return {
            "recent_pre_quotations": user_pre_quotations,
            "status_summary": status_summary,
            "monthly_stats": monthly_stats
        }
        
    except Exception as e:
        frappe.log_error(f"Error getting dashboard data: {str(e)}")
        return {}


def ensure_customer_exists(pre_quote_doc):
    """Ensure customer exists, create if needed"""
    
    if pre_quote_doc.customer:
        return pre_quote_doc.customer
    
    if pre_quote_doc.lead:
        # Try to get customer from lead
        lead_doc = frappe.get_doc("Lead", pre_quote_doc.lead)
        if lead_doc.customer:
            return lead_doc.customer
        
        # Create customer from lead
        customer = frappe.new_doc("Customer")
        customer.customer_name = lead_doc.lead_name or lead_doc.company_name
        customer.customer_type = "Company" if lead_doc.company_name else "Individual"
        customer.customer_group = "Commercial" if lead_doc.company_name else "Individual"
        customer.territory = lead_doc.territory or "All Territories"
        
        if lead_doc.email_id:
            customer.email_id = lead_doc.email_id
        
        if lead_doc.mobile_no:
            customer.mobile_no = lead_doc.mobile_no
        
        customer.insert()
        
        # Update lead with customer
        lead_doc.customer = customer.name
        lead_doc.save()
        
        return customer.name
    
    # Create generic customer
    customer = frappe.new_doc("Customer")
    customer.customer_name = pre_quote_doc.contact_person or "Walk-in Customer"
    customer.customer_type = "Individual"
    customer.customer_group = "Individual"
    customer.territory = "All Territories"
    
    if pre_quote_doc.contact_email:
        customer.email_id = pre_quote_doc.contact_email
    
    customer.insert()
    return customer.name


def get_or_create_item_group(group_name):
    """Get or create item group"""
    
    if frappe.db.exists("Item Group", group_name):
        return group_name
    
    item_group = frappe.new_doc("Item Group")
    item_group.item_group_name = group_name
    item_group.parent_item_group = "All Item Groups"
    item_group.is_group = 0
    item_group.insert()
    
    return item_group.name


def get_default_warehouse():
    """Get default warehouse"""
    
    company = frappe.defaults.get_user_default("Company")
    if company:
        warehouses = frappe.db.get_list("Warehouse", 
            filters={"company": company, "is_group": 0}, 
            limit=1
        )
        if warehouses:
            return warehouses[0].name
    
    return None


def get_default_expense_account():
    """Get default expense account"""
    
    company = frappe.defaults.get_user_default("Company")
    if company:
        accounts = frappe.db.get_list("Account", 
            filters={
                "company": company, 
                "account_type": "Expense Account",
                "is_group": 0
            }, 
            limit=1
        )
        if accounts:
            return accounts[0].name
    
    return None


def get_default_income_account():
    """Get default income account"""
    
    company = frappe.defaults.get_user_default("Company")
    if company:
        accounts = frappe.db.get_list("Account", 
            filters={
                "company": company, 
                "account_type": "Income Account",
                "is_group": 0
            }, 
            limit=1
        )
        if accounts:
            return accounts[0].name
    
    return None


@frappe.whitelist()
def get_conversion_stats():
    """Get conversion statistics for management dashboard"""
    
    try:
        # Overall conversion stats
        total_pre_quotations = frappe.db.count("Pre-Quotation")
        converted_quotations = frappe.db.count("Pre-Quotation", {"status": "Quotation Generated"})
        
        conversion_rate = (converted_quotations / total_pre_quotations * 100) if total_pre_quotations > 0 else 0
        
        # Monthly trend
        monthly_trend = frappe.db.sql("""
            SELECT 
                DATE_FORMAT(pre_quotation_date, '%Y-%m') as month,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Quotation Generated' THEN 1 ELSE 0 END) as converted,
                SUM(estimated_selling_price) as total_value
            FROM `tabPre-Quotation`
            WHERE pre_quotation_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(pre_quotation_date, '%Y-%m')
            ORDER BY month DESC
        """, as_dict=True)
        
        # Sales person performance
        sales_performance = frappe.db.sql("""
            SELECT 
                owner,
                COUNT(*) as total_quotes,
                SUM(CASE WHEN status = 'Quotation Generated' THEN 1 ELSE 0 END) as converted,
                SUM(estimated_selling_price) as total_value
            FROM `tabPre-Quotation`
            WHERE pre_quotation_date >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
            GROUP BY owner
            ORDER BY converted DESC
        """, as_dict=True)
        
        return {
            "total_pre_quotations": total_pre_quotations,
            "converted_quotations": converted_quotations,
            "conversion_rate": conversion_rate,
            "monthly_trend": monthly_trend,
            "sales_performance": sales_performance
        }
        
    except Exception as e:
        frappe.log_error(f"Error getting conversion stats: {str(e)}")
        return {}

