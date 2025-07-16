# Copyright (c) 2024, Manus AI and contributors
# For license information, please see license.txt

import frappe
import json
from frappe import _
from frappe.utils import flt, cint, nowdate


    """
    Get all visual selector data organized hierarchically
    
    Returns:
        dict: Complete data structure for visual selector
    """
    try:
        # Get categories
        categories = frappe.get_all('Visual Category', 
                                  filters={'is_active': 1},
                                  fields=['name', 'category_name', 'icon', 'description'],
                                  order_by='sort_order')
        
        # Get subcategories
        subcategories = frappe.get_all('Visual Subcategory',
                                     filters={'is_active': 1},
                                     fields=['name', 'category', 'subcategory_name', 'icon', 'description'],
                                     order_by='sort_order')
        
        # Get items with specifications
        items = frappe.get_all('Visual Item Master',
                             filters={'is_active': 1},
                             fields=['name', 'subcategory', 'item_name', 'description', 
                                   'base_cost', 'base_price', 'unit'])
        
        # Organize data hierarchically
        data = {}
        
        for category in categories:
            cat_id = category['name']
            data[cat_id] = {
                'name': category['category_name'],
                'icon': category['icon'],
                'description': category['description'],
                'subcategories': {}
            }
            
            # Add subcategories
            for subcategory in subcategories:
                if subcategory['category'] == cat_id:
                    subcat_id = subcategory['name']
                    data[cat_id]['subcategories'][subcat_id] = {
                        'name': subcategory['subcategory_name'],
                        'icon': subcategory['icon'],
                        'description': subcategory['description'],
                        'items': {}
                    }
                    
                    # Add items
                    for item in items:
                        if item['subcategory'] == subcat_id:
                            item_id = item['name']
                            
                            # Get item specifications
                            item_doc = frappe.get_doc('Visual Item Master', item_id)
                            specifications = {}
                            
                            for spec in item_doc.specifications:
                                specifications[spec.spec_name] = {
                                    'name': spec.spec_name,
                                    'type': spec.spec_type,
                                    'options': spec.options.split(',') if spec.options else [],
                                    'default_value': spec.default_value,
                                    'price_modifier': [float(x.strip()) for x in spec.price_modifier.split(',') if x.strip()] if spec.price_modifier else [],
                                    'is_required': spec.is_required
                                }
                            
                            # Get primary image
                            primary_image = item_doc.get_primary_image()
                            
                            data[cat_id]['subcategories'][subcat_id]['items'][item_id] = {
                                'name': item['item_name'],
                                'description': item['description'],
                                'base_cost': item['base_cost'],
                                'base_price': item['base_price'],
                                'unit': item['unit'],
                                'image_url': primary_image,
                                'specifications': specifications
                            }
        
        return data
        
    except Exception as e:
        frappe.log_error(f"Get Visual Selector Data Error: {str(e)}")
        return {'error': str(e)}


    """
    Calculate final price for an item based on specifications
    
    Args:
        item_id (str): Item ID
        specifications (dict): Selected specifications
        quantity (int): Quantity
        
    Returns:
        dict: Calculated pricing details
    """
    try:
        if isinstance(specifications, str):
            specifications = json.loads(specifications)
        
        quantity = int(quantity)
        
        # Get base item
        item = frappe.get_doc('Visual Item Master', item_id)
        base_cost = item.base_cost
        base_price = item.base_price
        
        total_modifier = 0
        
        # Calculate modifiers based on selected specifications
        for spec in item.specifications:
            spec_name = spec.spec_name
            if spec_name in specifications:
                selected_value = specifications[spec_name]
                options = spec.options.split(',') if spec.options else []
                modifiers = [float(x.strip()) for x in spec.price_modifier.split(',') if x.strip()] if spec.price_modifier else []
                
                # Find the index of selected option
                if selected_value in options and len(modifiers) > options.index(selected_value):
                    modifier_index = options.index(selected_value)
                    total_modifier += modifiers[modifier_index]
        
        # Calculate final prices
        final_cost = base_cost * (1 + total_modifier / 100)
        final_price = base_price * (1 + total_modifier / 100)
        
        total_cost = final_cost * quantity
        total_price = final_price * quantity
        profit = total_price - total_cost
        profit_margin = (profit / total_cost * 100) if total_cost > 0 else 0
        
        return {
            'base_cost': base_cost,
            'base_price': base_price,
            'final_cost': final_cost,
            'final_price': final_price,
            'total_cost': total_cost,
            'total_price': total_price,
            'profit': profit,
            'profit_margin': profit_margin,
            'quantity': quantity,
            'unit': item.unit
        }
        
    except Exception as e:
        frappe.log_error(f"Calculate Item Price Error: {str(e)}")
        return {'error': str(e)}

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
        pre_quotation = frappe.get_doc('Pre-Quotation', pre_quotation_name)
        
        if pre_quotation.docstatus != 1:
            frappe.throw(_("Pre-Quotation must be submitted before creating quotation"))
        
        # Create quotation
        quotation = frappe.new_doc('Quotation')
        quotation.quotation_to = 'Customer'
        quotation.party_name = pre_quotation.customer
        quotation.transaction_date = nowdate()
        quotation.valid_till = pre_quotation.valid_until
        
        # Add items
        for item in pre_quotation.custom_furniture_items:
            # Create item if it doesn't exist
            item_code = create_item_from_pre_quotation_item(item)
            
            quotation_item = quotation.append('items')
            quotation_item.item_code = item_code
            quotation_item.item_name = item.item_name
            quotation_item.description = item.item_description
            quotation_item.qty = item.quantity
            quotation_item.uom = item.unit
            quotation_item.rate = item.selling_price_per_unit
            quotation_item.amount = item.total_selling_amount
        
        quotation.insert()
        
        # Update pre-quotation status
        pre_quotation.db_set('status', 'Converted to Quotation')
        
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
        item_code = f"CUSTOM-{pre_quotation_item.item_name.upper().replace(' ', '-')}"
        
        # Check if item already exists
        if frappe.db.exists('Item', item_code):
            return item_code
        
        # Create new item
        item = frappe.new_doc('Item')
        item.item_code = item_code
        item.item_name = pre_quotation_item.item_name
        item.description = pre_quotation_item.item_description
        item.item_group = 'Custom Furniture'  # Create this item group if needed
        item.stock_uom = pre_quotation_item.unit
        item.is_stock_item = 1
        item.include_item_in_manufacturing = 1
        item.valuation_rate = pre_quotation_item.material_cost or 0
        
        # Set item defaults
        item.append('item_defaults', {
            'company': frappe.defaults.get_user_default('Company'),
            'default_warehouse': frappe.db.get_single_value('Stock Settings', 'default_warehouse')
        })
        
        item.insert()
        
        return item.item_code
        
    except Exception as e:
        frappe.log_error(f"Create Item Error: {str(e)}")
        return None

@frappe.whitelist()
def get_item_specifications(item_id):
    """
    Get specifications for a specific item
    
    Args:
        item_id (str): Visual Item Master ID
        
    Returns:
        dict: Item specifications
    """
    try:
        item = frappe.get_doc('Visual Item Master', item_id)
        return item.get_specifications_dict()
        
    except Exception as e:
        frappe.log_error(f"Get Item Specifications Error: {str(e)}")
        return {'error': str(e)}

@frappe.whitelist()
def create_sample_data():
    """
    Create sample data for testing the visual selector
    """
    try:
        # Create sample categories
        categories = [
            {'category_id': 'FURN', 'category_name': 'Furniture', 'icon': '🪑', 'description': 'Office furniture items'},
            {'category_id': 'STRUCT', 'category_name': 'Structures', 'icon': '🏗️', 'description': 'Building structures'},
            {'category_id': 'SERV', 'category_name': 'Services', 'icon': '🔧', 'description': 'Installation services'}
        ]
        
        for cat_data in categories:
            if not frappe.db.exists('Visual Category', cat_data['category_id']):
                cat = frappe.new_doc('Visual Category')
                cat.update(cat_data)
                cat.insert()
        
        # Create sample subcategories
        subcategories = [
            {'subcategory_id': 'FURN_TABLES', 'category': 'FURN', 'subcategory_name': 'Tables', 'icon': '🪑'},
            {'subcategory_id': 'FURN_CHAIRS', 'category': 'FURN', 'subcategory_name': 'Chairs', 'icon': '💺'},
            {'subcategory_id': 'STRUCT_FLOOR', 'category': 'STRUCT', 'subcategory_name': 'Flooring', 'icon': '🔲'}
        ]
        
        for subcat_data in subcategories:
            if not frappe.db.exists('Visual Subcategory', subcat_data['subcategory_id']):
                subcat = frappe.new_doc('Visual Subcategory')
                subcat.update(subcat_data)
                subcat.insert()
        
        # Create sample items
        items = [
            {
                'item_id': 'EXEC_DESK_001',
                'subcategory': 'FURN_TABLES',
                'item_name': 'Executive Desk',
                'description': 'Large executive desk with drawers',
                'base_cost': 300.00,
                'base_price': 375.00,
                'unit': 'pcs',
                'specifications': [
                    {'spec_name': 'Material', 'spec_type': 'Select', 'options': 'Wood,Metal,Glass', 'default_value': 'Wood', 'price_modifier': '0,10,30'},
                    {'spec_name': 'Size', 'spec_type': 'Select', 'options': 'Small,Medium,Large', 'default_value': 'Medium', 'price_modifier': '0,20,50'},
                    {'spec_name': 'Color', 'spec_type': 'Select', 'options': 'Brown,Black,White', 'default_value': 'Brown', 'price_modifier': '0,0,5'}
                ]
            },
            {
                'item_id': 'OFFICE_CHAIR_001',
                'subcategory': 'FURN_CHAIRS',
                'item_name': 'Office Chair',
                'description': 'Ergonomic office chair',
                'base_cost': 100.00,
                'base_price': 125.00,
                'unit': 'pcs',
                'specifications': [
                    {'spec_name': 'Material', 'spec_type': 'Select', 'options': 'Fabric,Leather,Mesh', 'default_value': 'Fabric', 'price_modifier': '0,30,15'},
                    {'spec_name': 'Color', 'spec_type': 'Select', 'options': 'Black,Gray,Blue', 'default_value': 'Black', 'price_modifier': '0,0,5'}
                ]
            }
        ]
        
        for item_data in items:
            if not frappe.db.exists('Visual Item Master', item_data['item_id']):
                item = frappe.new_doc('Visual Item Master')
                specs = item_data.pop('specifications')
                item.update(item_data)
                
                for spec_data in specs:
                    item.append('specifications', spec_data)
                
                item.insert()
        
        frappe.db.commit()
        return {'message': 'Sample data created successfully'}
        
    except Exception as e:
        frappe.log_error(f"Create Sample Data Error: {str(e)}")
        return {'error': str(e)}

