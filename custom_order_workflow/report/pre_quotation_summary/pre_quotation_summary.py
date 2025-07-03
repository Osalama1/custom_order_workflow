# Copyright (c) 2024, Manus AI and contributors
# For license information, please see license.txt

import frappe
from frappe import _

def execute(filters=None):
    columns = get_columns()
    data = get_data(filters)
    return columns, data

def get_columns():
    return [
        {
            "label": _("Pre-Quotation"),
            "fieldname": "name",
            "fieldtype": "Link",
            "options": "Pre-Quotation",
            "width": 150
        },
        {
            "label": _("Date"),
            "fieldname": "pre_quotation_date",
            "fieldtype": "Date",
            "width": 100
        },
        {
            "label": _("Customer"),
            "fieldname": "customer",
            "fieldtype": "Link",
            "options": "Customer",
            "width": 150
        },
        {
            "label": _("Contact Person"),
            "fieldname": "contact_person",
            "fieldtype": "Data",
            "width": 120
        },
        {
            "label": _("Status"),
            "fieldname": "status",
            "fieldtype": "Data",
            "width": 120
        },
        {
            "label": _("Items Count"),
            "fieldname": "items_count",
            "fieldtype": "Int",
            "width": 80
        },
        {
            "label": _("Estimated Cost"),
            "fieldname": "estimated_total_cost",
            "fieldtype": "Currency",
            "width": 120
        },
        {
            "label": _("Selling Price"),
            "fieldname": "estimated_selling_price",
            "fieldtype": "Currency",
            "width": 120
        },
        {
            "label": _("Owner"),
            "fieldname": "owner",
            "fieldtype": "Link",
            "options": "User",
            "width": 120
        },
        {
            "label": _("Days Since Creation"),
            "fieldname": "days_old",
            "fieldtype": "Int",
            "width": 100
        }
    ]

def get_data(filters):
    conditions = get_conditions(filters)
    
    data = frappe.db.sql(f"""
        SELECT 
            pq.name,
            pq.pre_quotation_date,
            pq.customer,
            pq.contact_person,
            pq.status,
            COUNT(pqi.name) as items_count,
            pq.estimated_total_cost,
            pq.estimated_selling_price,
            pq.owner,
            DATEDIFF(CURDATE(), pq.creation) as days_old
        FROM `tabPre-Quotation` pq
        LEFT JOIN `tabPre-Quotation Item` pqi ON pqi.parent = pq.name
        WHERE pq.docstatus != 2 {conditions}
        GROUP BY pq.name
        ORDER BY pq.creation DESC
    """, as_dict=1)
    
    return data

def get_conditions(filters):
    conditions = ""
    
    if filters.get("from_date"):
        conditions += f" AND pq.pre_quotation_date >= '{filters.get('from_date')}'"
    
    if filters.get("to_date"):
        conditions += f" AND pq.pre_quotation_date <= '{filters.get('to_date')}'"
    
    if filters.get("customer"):
        conditions += f" AND pq.customer = '{filters.get('customer')}'"
    
    if filters.get("status"):
        conditions += f" AND pq.status = '{filters.get('status')}'"
    
    if filters.get("owner"):
        conditions += f" AND pq.owner = '{filters.get('owner')}'"
    
    return conditions

