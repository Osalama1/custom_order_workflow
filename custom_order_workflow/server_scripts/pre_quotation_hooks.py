# Copyright (c) 2024, Manus AI and contributors
# For license information, please see license.txt

import frappe
from frappe import _

def validate_pre_quotation_submission(doc, method):
    """Validate pre-quotation before submission to manufacturing"""
    if doc.status == "Submitted to Manufacturing":
        # Ensure all required fields are filled
        if not doc.custom_furniture_items:
            frappe.throw(_("Please add at least one furniture item before submitting to manufacturing"))
        
        # Validate that each item has proper specifications
        for item in doc.custom_furniture_items:
            if not item.description:
                frappe.throw(_("Please provide description for item: {0}").format(item.item_name))
            
            if item.item_type == "Table" and not item.specifications_table:
                frappe.throw(_("Please provide table specifications for: {0}").format(item.item_name))
            
            if item.item_type == "Chair" and not item.specifications_chair:
                frappe.throw(_("Please provide chair specifications for: {0}").format(item.item_name))

def validate_manufacturing_costing(doc, method):
    """Validate manufacturing costing completion"""
    if doc.status == "Costing Done":
        # Ensure all items have estimated costs
        for item in doc.custom_furniture_items:
            if not item.estimated_unit_cost or item.estimated_unit_cost <= 0:
                frappe.throw(_("Please provide estimated unit cost for item: {0}").format(item.item_name))
        
        if not doc.estimated_total_cost or doc.estimated_total_cost <= 0:
            frappe.throw(_("Total estimated cost must be greater than zero"))

def send_workflow_notifications(doc, method):
    """Send email notifications for workflow status changes"""
    if not doc.has_value_changed("status"):
        return
    
    if doc.status == "Submitted to Manufacturing":
        send_manufacturing_notification(doc)
    elif doc.status == "Costing Done":
        send_costing_complete_notification(doc)
    elif doc.status == "Approved Internally":
        send_approval_notification(doc)
    elif doc.status == "Rejected":
        send_rejection_notification(doc)

def send_manufacturing_notification(doc):
    """Send notification to manufacturing team"""
    manufacturing_users = get_users_with_role("Manufacturing User")
    
    if manufacturing_users:
        subject = _("New Pre-Quotation for Costing: {0}").format(doc.name)
        message = _("""
        <p>A new pre-quotation has been submitted for manufacturing costing.</p>
        <p><strong>Pre-Quotation:</strong> {0}</p>
        <p><strong>Customer:</strong> {1}</p>
        <p><strong>Contact Person:</strong> {2}</p>
        <p><strong>Items Count:</strong> {3}</p>
        
        <p>Please review the specifications and provide costing estimates.</p>
        
        <p><a href="/app/pre-quotation/{0}">View Pre-Quotation</a></p>
        """).format(doc.name, doc.customer, doc.contact_person or "", len(doc.custom_furniture_items))
        
        frappe.sendmail(
            recipients=manufacturing_users,
            subject=subject,
            message=message
        )

def send_costing_complete_notification(doc):
    """Send notification to sales manager when costing is complete"""
    sales_managers = get_users_with_role("Sales Manager")
    
    if sales_managers:
        subject = _("Pre-Quotation Costing Complete: {0}").format(doc.name)
        message = _("""
        <p>Manufacturing costing has been completed for the following pre-quotation.</p>
        <p><strong>Pre-Quotation:</strong> {0}</p>
        <p><strong>Customer:</strong> {1}</p>
        <p><strong>Estimated Total Cost:</strong> {2}</p>
        <p><strong>Estimated Selling Price:</strong> {3}</p>
        
        <p>Please review for internal approval.</p>
        
        <p><a href="/app/pre-quotation/{0}">View Pre-Quotation</a></p>
        """).format(doc.name, doc.customer, 
                   frappe.format_value(doc.estimated_total_cost, "Currency"),
                   frappe.format_value(doc.estimated_selling_price, "Currency") if doc.estimated_selling_price else "Not Set")
        
        frappe.sendmail(
            recipients=sales_managers,
            subject=subject,
            message=message
        )

def send_approval_notification(doc):
    """Send notification when pre-quotation is approved internally"""
    # Notify the owner/creator
    if doc.owner:
        subject = _("Pre-Quotation Approved: {0}").format(doc.name)
        message = _("""
        <p>Your pre-quotation has been approved internally and is ready for quotation generation.</p>
        <p><strong>Pre-Quotation:</strong> {0}</p>
        <p><strong>Customer:</strong> {1}</p>
        <p><strong>Estimated Selling Price:</strong> {2}</p>
        
        <p>You can now create a formal quotation for the customer.</p>
        
        <p><a href="/app/pre-quotation/{0}">View Pre-Quotation</a></p>
        """).format(doc.name, doc.customer,
                   frappe.format_value(doc.estimated_selling_price, "Currency") if doc.estimated_selling_price else "Not Set")
        
        frappe.sendmail(
            recipients=[doc.owner],
            subject=subject,
            message=message
        )

def send_rejection_notification(doc):
    """Send notification when pre-quotation is rejected"""
    if doc.owner:
        subject = _("Pre-Quotation Rejected: {0}").format(doc.name)
        message = _("""
        <p>Your pre-quotation has been rejected.</p>
        <p><strong>Pre-Quotation:</strong> {0}</p>
        <p><strong>Customer:</strong> {1}</p>
        
        <p>Please contact your manager for more details.</p>
        
        <p><a href="/app/pre-quotation/{0}">View Pre-Quotation</a></p>
        """).format(doc.name, doc.customer)
        
        frappe.sendmail(
            recipients=[doc.owner],
            subject=subject,
            message=message
        )

def get_users_with_role(role):
    """Get list of user emails with specific role"""
    users = frappe.get_all("Has Role",
        filters={"role": role, "parenttype": "User"},
        fields=["parent as user"]
    )
    
    user_emails = []
    for user in users:
        user_doc = frappe.get_doc("User", user.user)
        if user_doc.email and user_doc.enabled:
            user_emails.append(user_doc.email)
    
    return user_emails

def auto_create_customer_from_lead(doc, method):
    """Auto-create customer from lead if not exists"""
    if doc.lead and not doc.customer:
        lead_doc = frappe.get_doc("Lead", doc.lead)
        
        # Check if customer already exists for this lead
        if lead_doc.customer:
            doc.customer = lead_doc.customer
        else:
            # Create new customer from lead
            customer = frappe.new_doc("Customer")
            customer.customer_name = lead_doc.lead_name or lead_doc.company_name
            customer.customer_type = "Company" if lead_doc.company_name else "Individual"
            customer.territory = lead_doc.territory or "All Territories"
            customer.customer_group = "All Customer Groups"
            
            try:
                customer.insert()
                
                # Update lead with customer
                lead_doc.customer = customer.name
                lead_doc.save()
                
                # Update pre-quotation with customer
                doc.customer = customer.name
                
                frappe.msgprint(_("Customer {0} created from Lead {1}").format(customer.name, doc.lead))
                
            except Exception as e:
                frappe.log_error(f"Error creating customer from lead: {str(e)}")
                frappe.throw(_("Error creating customer from lead. Please create customer manually."))

