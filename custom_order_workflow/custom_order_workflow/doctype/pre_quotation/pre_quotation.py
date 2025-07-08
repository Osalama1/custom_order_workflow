# Copyright (c) 2024, Manus AI and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import flt, nowdate
import json


class PreQuotation(Document):
    def validate(self):
        self.calculate_totals()
        self.validate_items()
    
    def before_save(self):
        """Process visual items data and calculate totals before saving"""
        self.process_visual_items_data()
        self.calculate_totals()
    
    def calculate_totals(self):
        """Calculate all pricing totals from items"""
        
        total_material_cost = 0
        total_labor_cost = 0
        total_overhead_cost = 0
        total_cost = 0
        total_selling_price = 0
        total_profit = 0
        
        for item in self.custom_furniture_items:
            # Ensure item calculations are up to date
            if hasattr(item, 'calculate_totals'):
                item.calculate_totals()
            
            quantity = flt(item.quantity, 2)
            
            # Sum up cost components
            total_material_cost += flt(item.material_cost, 2) * quantity
            total_labor_cost += flt(item.labor_cost, 2) * quantity
            total_overhead_cost += flt(item.overhead_cost, 2) * quantity
            total_cost += flt(item.total_cost, 2) * quantity
            total_selling_price += flt(item.total_selling_amount, 2)
            total_profit += flt(item.profit_amount, 2)
        
        # Update totals
        self.total_material_cost = flt(total_material_cost, 2)
        self.total_labor_cost = flt(total_labor_cost, 2)
        self.total_overhead_cost = flt(total_overhead_cost, 2)
        self.estimated_total_cost = flt(total_cost, 2)
        self.estimated_selling_price = flt(total_selling_price, 2)
        self.total_profit_amount = flt(total_profit, 2)
        
        # Calculate overall profit margin
        if self.estimated_total_cost > 0:
            self.overall_profit_margin = flt(
                (self.total_profit_amount / self.estimated_total_cost) * 100, 2
            )
        else:
            self.overall_profit_margin = 0
    
    def validate_items(self):
        """Validate items before saving"""
        
        if not self.custom_furniture_items:
            frappe.throw("Please add at least one item")
        
        for item in self.custom_furniture_items:
            if not item.item_name:
                frappe.throw("Item name is required for all items")
            
            if not item.quantity or item.quantity <= 0:
                frappe.throw("Quantity must be greater than 0 for all items")
    
    def process_visual_items_data(self):
        """Process visual items data and sync with items table"""
        
        if not self.visual_items_data or self.docstatus != 0:
            return
        
        try:
            visual_data = json.loads(self.visual_items_data)
            
            if not visual_data:
                return
            
            # Clear existing items if visual data is newer
            self.custom_furniture_items = []
            
            # Generate items from visual data
            for visual_item in visual_data:
                if visual_item.get('subcategoryName'):
                    item = self.append('custom_furniture_items')
                    
                    # Basic item info
                    item.item_name = visual_item['subcategoryName']
                    item.description = self.generate_description_from_visual_item(visual_item)
                    item.quantity = flt(visual_item.get('quantity', 1), 2)
                    item.uom = self.convert_visual_unit(visual_item.get('unit', 'pcs'))
                    
                    # Specifications as JSON
                    if visual_item.get('specs'):
                        item.specifications = json.dumps(visual_item['specs'])
                    
                    # Notes
                    item.notes = visual_item.get('notes', '')
                    
                    # Generate item code
                    item.item_code = self.generate_item_code_from_visual_item(visual_item)
                    
                    # Apply standard costing
                    item.apply_standard_costing()
                    
        except Exception as e:
            frappe.log_error(f"Error processing visual items data: {str(e)}")
    
    def generate_description_from_visual_item(self, visual_item):
        """Generate description from visual item data"""
        
        description = visual_item.get('subcategoryName', 'Custom Item')
        
        specs = visual_item.get('specs', {})
        if specs:
            spec_parts = []
            for key, value in specs.items():
                if value:
                    spec_parts.append(f"{key}: {value}")
            
            if spec_parts:
                description += f" ({', '.join(spec_parts)})"
        
        notes = visual_item.get('notes')
        if notes:
            description += f" - {notes}"
        
        return description
    
    def convert_visual_unit(self, visual_unit):
        """Convert visual selector unit to ERPNext UOM"""
        
        unit_map = {
            'pcs': 'Nos',
            'sqm': 'Sq Meter',
            'lm': 'Meter',
            'hours': 'Hour',
            'days': 'Day'
        }
        
        return unit_map.get(visual_unit, 'Nos')
    
    def generate_item_code_from_visual_item(self, visual_item):
        """Generate item code from visual item data"""
        
        code_parts = []
        
        category = visual_item.get('category', '')
        if category:
            code_parts.append(category[:3].upper())
        
        subcategory = visual_item.get('subcategory', '')
        if subcategory:
            code_parts.append(subcategory[:3].upper())
        
        specs = visual_item.get('specs', {})
        if specs.get('material'):
            code_parts.append(specs['material'][:3].upper())
        
        if specs.get('length') and specs.get('width'):
            code_parts.append(f"{specs['length']}x{specs['width']}")
        
        # Add timestamp for uniqueness
        import time
        code_parts.append(str(int(time.time()))[-4:])
        
        return '-'.join(code_parts)
    
    def apply_bulk_costing(self, material_rate=None, labor_rate=None, overhead_rate=None):
        """Apply bulk costing to all items"""
        
        for item in self.custom_furniture_items:
            if material_rate:
                item.material_cost = flt(material_rate, 2)
            
            if labor_rate:
                item.labor_cost = flt(labor_rate, 2)
            
            if overhead_rate:
                item.overhead_cost = flt(overhead_rate, 2)
            
            # Recalculate item totals
            if hasattr(item, 'calculate_totals'):
                item.calculate_totals()
        
        # Recalculate document totals
        self.calculate_totals()
    
    def apply_bulk_profit_margin(self, profit_margin_percent):
        """Apply bulk profit margin to all items"""
        
        for item in self.custom_furniture_items:
            item.profit_margin_percent = flt(profit_margin_percent, 2)
            
            # Recalculate selling price based on new margin
            if item.total_cost > 0:
                profit_multiplier = 1 + (flt(profit_margin_percent) / 100)
                item.selling_price = flt(item.total_cost * profit_multiplier, 2)
            
            # Recalculate item totals
            if hasattr(item, 'calculate_totals'):
                item.calculate_totals()
        
        # Recalculate document totals
        self.calculate_totals()
    
    def get_pricing_summary(self):
        """Get comprehensive pricing summary for reporting"""
        
        summary = {
            "total_items": len(self.custom_furniture_items),
            "total_quantity": sum(flt(item.quantity, 2) for item in self.custom_furniture_items),
            "cost_breakdown": {
                "material_cost": flt(self.total_material_cost, 2),
                "labor_cost": flt(self.total_labor_cost, 2),
                "overhead_cost": flt(self.total_overhead_cost, 2),
                "total_cost": flt(self.estimated_total_cost, 2)
            },
            "selling_breakdown": {
                "total_selling_price": flt(self.estimated_selling_price, 2),
                "total_profit": flt(self.total_profit_amount, 2),
                "profit_margin_percent": flt(self.overall_profit_margin, 2)
            },
            "items": []
        }
        
        for item in self.custom_furniture_items:
            if hasattr(item, 'get_cost_breakdown'):
                summary["items"].append({
                    "item_name": item.item_name,
                    "quantity": flt(item.quantity, 2),
                    "cost_breakdown": item.get_cost_breakdown()
                })
        
        return summary
    
    def create_manufacturing_worksheet(self):
        """Create a manufacturing worksheet with all specifications"""
        
        worksheet = {
            "pre_quotation": self.name,
            "customer": self.customer or self.contact_person,
            "date": self.pre_quotation_date,
            "total_estimated_cost": flt(self.estimated_total_cost, 2),
            "items": []
        }
        
        for item in self.custom_furniture_items:
            item_data = {
                "item_name": item.item_name,
                "description": item.description,
                "quantity": flt(item.quantity, 2),
                "uom": item.uom,
                "specifications": item.specifications,
                "notes": item.notes,
                "manufacturing_notes": item.manufacturing_notes,
                "estimated_costs": {
                    "material": flt(item.material_cost, 2),
                    "labor": flt(item.labor_cost, 2),
                    "overhead": flt(item.overhead_cost, 2),
                    "total": flt(item.total_cost, 2)
                }
            }
            
            worksheet["items"].append(item_data)
        
        return worksheet
    
    @frappe.whitelist()
    def auto_estimate_costing(self):
        """Auto-estimate costing for all items based on specifications"""
        
        for item in self.custom_furniture_items:
            if hasattr(item, 'apply_standard_costing'):
                item.apply_standard_costing()
        
        self.calculate_totals()
        self.save()
        
        return {"success": True, "message": "Costing estimated successfully"}
    
    @frappe.whitelist()
    def generate_quotation_preview(self):
        """Generate a preview of what the quotation would look like"""
        
        preview = {
            "customer": self.customer or self.contact_person,
            "date": nowdate(),
            "valid_until": self.valid_until,
            "items": [],
            "totals": {
                "subtotal": flt(self.estimated_selling_price, 2),
                "tax": flt(self.estimated_selling_price * 0.15, 2),  # Assuming 15% tax
                "total": flt(self.estimated_selling_price * 1.15, 2)
            }
        }
        
        for item in self.custom_furniture_items:
            preview["items"].append({
                "item_name": item.item_name,
                "description": item.description,
                "quantity": flt(item.quantity, 2),
                "uom": item.uom,
                "rate": flt(item.selling_price, 2),
                "amount": flt(item.total_selling_amount, 2)
            })
        
        return preview

