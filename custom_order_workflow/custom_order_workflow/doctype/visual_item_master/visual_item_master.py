# Copyright (c) 2024, Manus AI and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import flt

class VisualItemMaster(Document):
	def validate(self):
		# Ensure item_id is uppercase
		if self.item_id:
			self.item_id = self.item_id.upper()
		
		# Calculate profit margin
		self.calculate_profit_margin()
		
		# Validate primary image (only one primary image allowed)
		self.validate_primary_image()
	
	def calculate_profit_margin(self):
		"""Calculate and set profit margin percentage"""
		if self.base_cost and self.base_price:
			if self.base_cost > 0:
				profit = self.base_price - self.base_cost
				self.profit_margin = (profit / self.base_cost) * 100
			else:
				self.profit_margin = 0
	
	def validate_primary_image(self):
		"""Ensure only one primary image exists"""
		primary_count = 0
		for image in self.images:
			if image.is_primary:
				primary_count += 1
		
		if primary_count > 1:
			frappe.throw("Only one image can be marked as primary")
		
		# If no primary image and images exist, make first one primary
		if primary_count == 0 and self.images:
			self.images[0].is_primary = 1
	
	def get_primary_image(self):
		"""Get the primary image for this item"""
		for image in self.images:
			if image.is_primary:
				return image.image
		return None
	
	def get_specifications_dict(self):
		"""Get specifications as a dictionary for easy access"""
		specs = {}
		for spec in self.specifications:
			specs[spec.spec_name] = {
				'type': spec.spec_type,
				'options': spec.options.split(',') if spec.options else [],
				'default_value': spec.default_value,
				'price_modifier': [float(x.strip()) for x in spec.price_modifier.split(',') if x.strip()] if spec.price_modifier else [],
				'is_required': spec.is_required
			}
		return specs

