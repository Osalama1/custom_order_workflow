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
        """Calculate totals before saving"""
        self.calculate_totals()
    
    def calculate_totals(self):
        """Calculate all pricing totals from items"""
        
        total_cost = 0
        total_selling_price = 0
        total_profit = 0
        
        for item in self.custom_furniture_items:
            # Ensure item calculations are up to date
            if hasattr(item, 'calculate_totals'):
                item.calculate_totals()
            
            quantity = flt(item.quantity, 2)
            
            # Sum up cost components
            total_cost += flt(item.total_cost, 2) * quantity
            total_selling_price += flt(item.total_selling_amount, 2)
            total_profit += flt(item.profit_amount, 2)
        
        # Update totals
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
                item.selling_price_per_unit = flt(item.total_cost * profit_multiplier, 2)
            
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
                "rate": flt(item.selling_price_per_unit, 2),
                "amount": flt(item.total_selling_amount, 2)
            })
        
        return preview


