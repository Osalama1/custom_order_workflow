# Copyright (c) 2024, Manus AI and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class VisualCategory(Document):
	def validate(self):
		# Ensure category_id is uppercase
		if self.category_id:
			self.category_id = self.category_id.upper()
		
		# Set default sort order if not provided
		if not self.sort_order:
			max_order = frappe.db.sql("""
				SELECT IFNULL(MAX(sort_order), 0) + 1 
				FROM `tabVisual Category`
				WHERE name != %s
			""", self.name)
			self.sort_order = max_order[0][0] if max_order else 1

