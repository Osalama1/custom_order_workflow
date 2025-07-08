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
        
        # Calculate total cost per unit
        material_cost = flt(self.material_cost, 2)
        labor_cost = flt(self.labor_cost, 2)
        overhead_cost = flt(self.overhead_cost, 2)
        
        self.total_cost = material_cost + labor_cost + overhead_cost
        
        # Calculate selling price based on profit margin if not manually set
        if self.profit_margin_percent and not self.selling_price:
            profit_multiplier = 1 + (flt(self.profit_margin_percent) / 100)
            self.selling_price = flt(self.total_cost * profit_multiplier, 2)
        
        # Calculate profit margin if selling price is set but margin is not
        elif self.selling_price and not self.profit_margin_percent and self.total_cost > 0:
            profit_amount = flt(self.selling_price) - flt(self.total_cost)
            self.profit_margin_percent = flt((profit_amount / self.total_cost) * 100, 2)
        
        # Calculate total selling amount
        quantity = flt(self.quantity, 2)
        selling_price = flt(self.selling_price, 2)
        total_cost = flt(self.total_cost, 2)
        
        self.total_selling_amount = quantity * selling_price
        self.profit_amount = quantity * (selling_price - total_cost)
    
    def before_save(self):
        """Ensure calculations are up to date before saving"""
        self.calculate_totals()
    
    def get_cost_breakdown(self):
        """Get detailed cost breakdown for reporting"""
        
        return {
            "material_cost": flt(self.material_cost, 2),
            "labor_cost": flt(self.labor_cost, 2),
            "overhead_cost": flt(self.overhead_cost, 2),
            "total_cost": flt(self.total_cost, 2),
            "selling_price": flt(self.selling_price, 2),
            "profit_margin_percent": flt(self.profit_margin_percent, 2),
            "profit_amount_per_unit": flt(self.selling_price, 2) - flt(self.total_cost, 2),
            "total_selling_amount": flt(self.total_selling_amount, 2),
            "total_profit_amount": flt(self.profit_amount, 2)
        }
    
    def apply_standard_costing(self, item_group=None):
        """Apply standard costing based on item specifications"""
        
        try:
            # Parse specifications if available
            specs = {}
            if self.specifications:
                import json
                specs = json.loads(self.specifications)
            
            # Apply basic costing rules based on specifications
            self.estimate_material_cost(specs)
            self.estimate_labor_cost(specs)
            self.estimate_overhead_cost(specs)
            
            # Recalculate totals
            self.calculate_totals()
            
        except Exception as e:
            frappe.log_error(f"Error applying standard costing: {str(e)}")
    
    def estimate_material_cost(self, specs):
        """Estimate material cost based on specifications"""
        
        base_cost = 100  # Base material cost
        
        # Adjust based on material type
        material = specs.get('material', '').lower()
        material_multipliers = {
            'wood': 1.0,
            'metal': 1.2,
            'glass': 1.5,
            'fabric': 0.8,
            'plastic': 0.6
        }
        
        multiplier = material_multipliers.get(material, 1.0)
        
        # Adjust based on dimensions if available
        if specs.get('length') and specs.get('width'):
            try:
                length = float(specs['length'])
                width = float(specs['width'])
                area = (length * width) / 10000  # Convert cm² to m²
                base_cost *= max(area, 0.5)  # Minimum area factor
            except (ValueError, TypeError):
                pass
        
        # Adjust based on area for flooring/structures
        if specs.get('area'):
            try:
                area = float(specs['area'])
                base_cost = area * 50  # Cost per square meter
            except (ValueError, TypeError):
                pass
        
        self.material_cost = flt(base_cost * multiplier, 2)
    
    def estimate_labor_cost(self, specs):
        """Estimate labor cost based on specifications"""
        
        base_labor = 50  # Base labor cost
        
        # Adjust based on complexity
        if specs.get('features'):
            features = specs['features'].lower()
            if 'adjustable' in features:
                base_labor *= 1.3
            if 'wheels' in features:
                base_labor *= 1.2
        
        # Adjust based on finish
        finish = specs.get('finish', '').lower()
        finish_multipliers = {
            'matte': 1.0,
            'glossy': 1.3,
            'textured': 1.4,
            'natural': 1.1
        }
        
        multiplier = finish_multipliers.get(finish, 1.0)
        self.labor_cost = flt(base_labor * multiplier, 2)
    
    def estimate_overhead_cost(self, specs):
        """Estimate overhead cost based on specifications"""
        
        # Overhead is typically 20-30% of material + labor
        material_cost = flt(self.material_cost, 2)
        labor_cost = flt(self.labor_cost, 2)
        
        overhead_rate = 0.25  # 25% overhead
        self.overhead_cost = flt((material_cost + labor_cost) * overhead_rate, 2)

