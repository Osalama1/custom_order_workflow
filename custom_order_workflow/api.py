# Copyright (c) 2024, Manus AI and contributors
# For license information, please see license.txt

import frappe
import json
from frappe import _
from frappe.utils import flt, cint, nowdate

@frappe.whitelist()
def create_quotation_from_pre_quotation(pre_quotation_name):
    """
    Create ERPNext Quotation from Pre-Quotation
    
    Args:
        pre_quotation_name (str): Pre-Quotation document name
        
    Returns:
        str: Created Quotation name
    """
    try:
        # Get pre-quotation
        pre_quotation = frappe.get_doc(\'Pre-Quotation\', pre_quotation_name)
        
        if pre_quotation.docstatus != 1:
            frappe.throw(_("Pre-Quotation must be submitted before creating quotation"))
        
        # Create quotation
        quotation = frappe.new_doc(\'Quotation\')
        quotation.quotation_to = \'Customer\'
        quotation.party_name = pre_quotation.customer
        quotation.transaction_date = nowdate()
        quotation.valid_till = pre_quotation.valid_until
        
        # Add items
        for item in pre_quotation.custom_furniture_items:
            # Create item if it doesn\'t exist
            item_code = create_item_from_pre_quotation_item(item)
            
            quotation_item = quotation.append(\'items\')
            quotation_item.item_code = item_code
            quotation_item.item_name = item.item_name
            quotation_item.description = item.item_description
            quotation_item.qty = item.quantity
            quotation_item.uom = item.unit
            quotation_item.rate = item.selling_price_per_unit
            quotation_item.amount = item.total_selling_amount
        
        quotation.insert()
        
        # Update pre-quotation status
        pre_quotation.db_set(\'status\', \'Converted to Quotation\')
        
        return quotation.name
        
    except Exception as e:
        frappe.log_error(f"Create Quotation Error: {str(e)}")
        frappe.throw(_("Error creating quotation: {0}").format(str(e)))

def create_item_from_pre_quotation_item(pre_quotation_item):
    """
    Create ERPNext Item from Pre-Quotation Item
    
    Args:
        pre_quotation_item: Pre-Quotation Item child table row
        
    Returns:
        str: Item code
    """
    try:
        # Generate item code
        item_code = f"CUSTOM-{pre_quotation_item.item_name.upper().replace(\' \', \'-\')}"
        
        # Check if item already exists
        if frappe.db.exists(\'Item\', item_code):
            return item_code
        
        # Create new item
        item = frappe.new_doc(\'Item\')
        item.item_code = item_code
        item.item_name = pre_quotation_item.item_name
        item.description = pre_quotation_item.item_description
        item.item_group = \'Custom Furniture\'  # Create this item group if needed
        item.stock_uom = pre_quotation_item.unit
        item.is_stock_item = 1
        item.include_item_in_manufacturing = 1
        item.valuation_rate = pre_quotation_item.material_cost or 0
        
        # Set item defaults
        item.append(\'item_defaults\', {
            \'company\': frappe.defaults.get_user_default(\'Company\'),
            \'default_warehouse\': frappe.db.get_single_value(\'Stock Settings\', \'default_warehouse\')
        })
        
        item.insert()
        
        return item.item_code
        
    except Exception as e:
        frappe.log_error(f"Create Item Error: {str(e)}")
        return None


