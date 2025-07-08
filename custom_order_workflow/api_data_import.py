# Copyright (c) 2024, Manus AI and contributors
# For license information, please see license.txt

import frappe
import pandas as pd
import json
from frappe import _
from frappe.utils import cstr, flt, cint

@frappe.whitelist()
def import_visual_selector_data(file_path):
    """
    Import visual selector data from Excel file
    
    Args:
        file_path (str): Path to the Excel file
        
    Returns:
        dict: Import results with success/error counts
    """
    try:
        # Read Excel file
        excel_data = pd.read_excel(file_path, sheet_name=None)
        
        results = {
            'categories': 0,
            'subcategories': 0,
            'items': 0,
            'specifications': 0,
            'errors': []
        }
        
        # Import Categories
        if 'Categories' in excel_data:
            results['categories'] = import_categories(excel_data['Categories'])
        
        # Import Subcategories
        if 'Subcategories' in excel_data:
            results['subcategories'] = import_subcategories(excel_data['Subcategories'])
        
        # Import Items
        if 'Items' in excel_data:
            results['items'] = import_items(excel_data['Items'])
        
        # Import Specifications
        if 'Specifications' in excel_data:
            results['specifications'] = import_specifications(excel_data['Specifications'])
        
        return results
        
    except Exception as e:
        frappe.log_error(f"Visual Selector Data Import Error: {str(e)}")
        return {'error': str(e)}

def import_categories(df):
    """Import categories data"""
    count = 0
    for _, row in df.iterrows():
        try:
            # Check if category exists
            if not frappe.db.exists('Visual Selector Category', row['Category ID']):
                doc = frappe.new_doc('Visual Selector Category')
                doc.category_id = row['Category ID']
                doc.category_name = row['Category Name']
                doc.icon = row.get('Icon', '')
                doc.description = row.get('Description', '')
                doc.sort_order = cint(row.get('Sort Order', 0))
                doc.insert()
                count += 1
            else:
                # Update existing
                doc = frappe.get_doc('Visual Selector Category', row['Category ID'])
                doc.category_name = row['Category Name']
                doc.icon = row.get('Icon', '')
                doc.description = row.get('Description', '')
                doc.sort_order = cint(row.get('Sort Order', 0))
                doc.save()
                count += 1
        except Exception as e:
            frappe.log_error(f"Category import error for {row.get('Category ID', 'Unknown')}: {str(e)}")
    
    return count

def import_subcategories(df):
    """Import subcategories data"""
    count = 0
    for _, row in df.iterrows():
        try:
            # Check if subcategory exists
            if not frappe.db.exists('Visual Selector Subcategory', row['Subcategory ID']):
                doc = frappe.new_doc('Visual Selector Subcategory')
                doc.subcategory_id = row['Subcategory ID']
                doc.category_id = row['Category ID']
                doc.subcategory_name = row['Subcategory Name']
                doc.icon = row.get('Icon', '')
                doc.description = row.get('Description', '')
                doc.sort_order = cint(row.get('Sort Order', 0))
                doc.insert()
                count += 1
            else:
                # Update existing
                doc = frappe.get_doc('Visual Selector Subcategory', row['Subcategory ID'])
                doc.category_id = row['Category ID']
                doc.subcategory_name = row['Subcategory Name']
                doc.icon = row.get('Icon', '')
                doc.description = row.get('Description', '')
                doc.sort_order = cint(row.get('Sort Order', 0))
                doc.save()
                count += 1
        except Exception as e:
            frappe.log_error(f"Subcategory import error for {row.get('Subcategory ID', 'Unknown')}: {str(e)}")
    
    return count

def import_items(df):
    """Import items data"""
    count = 0
    for _, row in df.iterrows():
        try:
            # Check if item exists
            if not frappe.db.exists('Visual Selector Item', row['Item ID']):
                doc = frappe.new_doc('Visual Selector Item')
                doc.item_id = row['Item ID']
                doc.subcategory_id = row['Subcategory ID']
                doc.item_name = row['Item Name']
                doc.description = row.get('Description', '')
                doc.base_cost = flt(row.get('Base Cost', 0))
                doc.base_price = flt(row.get('Base Price', 0))
                doc.unit = row.get('Unit', 'pcs')
                doc.image_url = row.get('Image URL', '')
                doc.insert()
                count += 1
            else:
                # Update existing
                doc = frappe.get_doc('Visual Selector Item', row['Item ID'])
                doc.subcategory_id = row['Subcategory ID']
                doc.item_name = row['Item Name']
                doc.description = row.get('Description', '')
                doc.base_cost = flt(row.get('Base Cost', 0))
                doc.base_price = flt(row.get('Base Price', 0))
                doc.unit = row.get('Unit', 'pcs')
                doc.image_url = row.get('Image URL', '')
                doc.save()
                count += 1
        except Exception as e:
            frappe.log_error(f"Item import error for {row.get('Item ID', 'Unknown')}: {str(e)}")
    
    return count

def import_specifications(df):
    """Import specifications data"""
    count = 0
    for _, row in df.iterrows():
        try:
            # Check if specification exists
            if not frappe.db.exists('Visual Selector Specification', row['Spec ID']):
                doc = frappe.new_doc('Visual Selector Specification')
                doc.spec_id = row['Spec ID']
                doc.item_id = row['Item ID']
                doc.spec_name = row['Spec Name']
                doc.spec_type = row['Spec Type']
                doc.options = row.get('Options', '')
                doc.default_value = row.get('Default Value', '')
                doc.price_modifier = row.get('Price Modifier', '')
                doc.insert()
                count += 1
            else:
                # Update existing
                doc = frappe.get_doc('Visual Selector Specification', row['Spec ID'])
                doc.item_id = row['Item ID']
                doc.spec_name = row['Spec Name']
                doc.spec_type = row['Spec Type']
                doc.options = row.get('Options', '')
                doc.default_value = row.get('Default Value', '')
                doc.price_modifier = row.get('Price Modifier', '')
                doc.save()
                count += 1
        except Exception as e:
            frappe.log_error(f"Specification import error for {row.get('Spec ID', 'Unknown')}: {str(e)}")
    
    return count

@frappe.whitelist()
def get_visual_selector_data():
    """
    Get all visual selector data for the frontend
    
    Returns:
        dict: Complete data structure for visual selector
    """
    try:
        # Get categories
        categories = frappe.get_all('Visual Selector Category', 
                                  fields=['category_id', 'category_name', 'icon', 'description'],
                                  order_by='sort_order')
        
        # Get subcategories
        subcategories = frappe.get_all('Visual Selector Subcategory',
                                     fields=['subcategory_id', 'category_id', 'subcategory_name', 'icon', 'description'],
                                     order_by='sort_order')
        
        # Get items
        items = frappe.get_all('Visual Selector Item',
                             fields=['item_id', 'subcategory_id', 'item_name', 'description', 
                                   'base_cost', 'base_price', 'unit', 'image_url'])
        
        # Get specifications
        specifications = frappe.get_all('Visual Selector Specification',
                                      fields=['spec_id', 'item_id', 'spec_name', 'spec_type',
                                            'options', 'default_value', 'price_modifier'])
        
        # Organize data hierarchically
        data = {}
        
        for category in categories:
            cat_id = category['category_id']
            data[cat_id] = {
                'name': category['category_name'],
                'icon': category['icon'],
                'description': category['description'],
                'subcategories': {}
            }
            
            # Add subcategories
            for subcategory in subcategories:
                if subcategory['category_id'] == cat_id:
                    subcat_id = subcategory['subcategory_id']
                    data[cat_id]['subcategories'][subcat_id] = {
                        'name': subcategory['subcategory_name'],
                        'icon': subcategory['icon'],
                        'description': subcategory['description'],
                        'items': {}
                    }
                    
                    # Add items
                    for item in items:
                        if item['subcategory_id'] == subcat_id:
                            item_id = item['item_id']
                            data[cat_id]['subcategories'][subcat_id]['items'][item_id] = {
                                'name': item['item_name'],
                                'description': item['description'],
                                'base_cost': item['base_cost'],
                                'base_price': item['base_price'],
                                'unit': item['unit'],
                                'image_url': item['image_url'],
                                'specifications': {}
                            }
                            
                            # Add specifications
                            for spec in specifications:
                                if spec['item_id'] == item_id:
                                    spec_id = spec['spec_id']
                                    data[cat_id]['subcategories'][subcat_id]['items'][item_id]['specifications'][spec_id] = {
                                        'name': spec['spec_name'],
                                        'type': spec['spec_type'],
                                        'options': spec['options'].split(',') if spec['options'] else [],
                                        'default_value': spec['default_value'],
                                        'price_modifier': [float(x) for x in spec['price_modifier'].split(',') if x.strip()] if spec['price_modifier'] else []
                                    }
        
        return data
        
    except Exception as e:
        frappe.log_error(f"Get Visual Selector Data Error: {str(e)}")
        return {'error': str(e)}

@frappe.whitelist()
def calculate_item_price(item_id, specifications, quantity=1):
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
        # Get base item
        item = frappe.get_doc('Visual Selector Item', item_id)
        base_cost = item.base_cost
        base_price = item.base_price
        
        # Get specifications
        specs = frappe.get_all('Visual Selector Specification',
                             filters={'item_id': item_id},
                             fields=['spec_name', 'options', 'price_modifier'])
        
        total_modifier = 0
        
        # Calculate modifiers based on selected specifications
        for spec in specs:
            spec_name = spec['spec_name'].lower().replace(' ', '_')
            if spec_name in specifications:
                selected_value = specifications[spec_name]
                options = spec['options'].split(',') if spec['options'] else []
                modifiers = [float(x) for x in spec['price_modifier'].split(',') if x.strip()] if spec['price_modifier'] else []
                
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

