# Copyright (c) 2024, Manus AI and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import flt


class PreQuotationItem(Document):
    def validate(self):
        self.calculate_totals()
    
    def calculate_totals(self):
        """Calculate total cost, selling amount, and profit"""
        
        # Total cost per unit is now directly entered or estimated
        self.total_cost = flt(self.cost_per_unit, 2)
        
        # Calculate selling price based on profit margin if not manually set
        if self.profit_margin_percent and not self.selling_price_per_unit:
            profit_multiplier = 1 + (flt(self.profit_margin_percent) / 100)
            self.selling_price_per_unit = flt(self.total_cost * profit_multiplier, 2)
        
        # Calculate profit margin if selling price is set but margin is not
        elif self.selling_price_per_unit and not self.profit_margin_percent and self.total_cost > 0:
            profit_amount = flt(self.selling_price_per_unit) - flt(self.total_cost)
            self.profit_margin_percent = flt((profit_amount / self.total_cost) * 100, 2)
        
        # Calculate total selling amount
        quantity = flt(self.quantity, 2)
        selling_price_per_unit = flt(self.selling_price_per_unit, 2)
        total_cost = flt(self.total_cost, 2)
        vat_rate_item = flt(self.vat_rate_item, 2)
        
        self.total_selling_amount = quantity * selling_price_per_unit
        self.profit_amount = quantity * (selling_price_per_unit - total_cost)
        self.total_vat_amount_item = self.total_selling_amount * (vat_rate_item / 100)

    
    def before_save(self):
        """Ensure calculations are up to date before saving"""
        self.calculate_totals()
    
    def get_cost_breakdown(self):
        """Get detailed cost breakdown for reporting"""
        
        return {
            "cost_per_unit": flt(self.cost_per_unit, 2),
            "total_cost": flt(self.total_cost, 2),
            "selling_price_per_unit": flt(self.selling_price_per_unit, 2),
            "profit_margin_percent": flt(self.profit_margin_percent, 2),
            "profit_amount_per_unit": flt(self.selling_price_per_unit, 2) - flt(self.total_cost, 2),
            "total_selling_amount": flt(self.total_selling_amount, 2),
            "total_profit_amount": flt(self.profit_amount, 2),
            "total_vat_amount_item": flt(self.total_vat_amount_item, 2)
        }
    
    def apply_standard_costing(self, item_group=None):
        """Apply standard costing based on item specifications"""
        
        try:
            # Parse specifications if available
            specs = {}
            if self.specifications:
                import json
                specs = json.loads(self.specifications)
            
            # For now, a simple placeholder for standard costing
            # In a real scenario, this would involve more complex logic
            # based on item_group, specs, etc.
            self.cost_per_unit = 100.00 # Example base cost
            
            # Recalculate totals
            self.calculate_totals()
            
        except Exception as e:
            frappe.log_error(f"Error applying standard costing: {str(e)}")





