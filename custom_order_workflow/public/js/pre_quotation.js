frappe.ui.form.on('Pre-Quotation', {
    refresh: function(frm) {
        // Add custom buttons based on status
        if (frm.doc.status === 'Approved Internally' && !frm.doc.__islocal) {
            frm.add_custom_button(__('Create Quotation'), function() {
                frappe.call({
                    method: 'create_quotation',
                    doc: frm.doc,
                    callback: function(r) {
                        if (r.message) {
                            frappe.msgprint(__('Quotation {0} created successfully', [r.message]));
                            frm.reload_doc();
                        }
                    }
                });
            }, __('Actions'));
        }
        
        // Set field permissions based on user role and status
        set_field_permissions(frm);
        
        // Auto-populate customer details from lead
        if (frm.doc.lead && !frm.doc.customer) {
            populate_customer_from_lead(frm);
        }
    },
    
    lead: function(frm) {
        if (frm.doc.lead) {
            populate_customer_from_lead(frm);
        }
    },
    
    validate: function(frm) {
        // Validate that at least one item is added
        if (!frm.doc.custom_furniture_items || frm.doc.custom_furniture_items.length === 0) {
            frappe.msgprint(__('Please add at least one furniture item'));
            frappe.validated = false;
        }
        
        // Calculate total estimated cost
        calculate_total_cost(frm);
    }
});

frappe.ui.form.on('Pre-Quotation Item', {
    quantity: function(frm, cdt, cdn) {
        calculate_item_total(frm, cdt, cdn);
    },
    
    estimated_unit_cost: function(frm, cdt, cdn) {
        calculate_item_total(frm, cdt, cdn);
    },
    
    item_type: function(frm, cdt, cdn) {
        // Clear specifications when item type changes
        var row = locals[cdt][cdn];
        if (row.item_type === 'Table') {
            row.specifications_chair = [];
        } else if (row.item_type === 'Chair') {
            row.specifications_table = [];
        } else {
            row.specifications_table = [];
            row.specifications_chair = [];
        }
        frm.refresh_field('custom_furniture_items');
    }
});

function set_field_permissions(frm) {
    var is_sales_user = frappe.user_roles.includes('Sales User');
    var is_manufacturing_user = frappe.user_roles.includes('Manufacturing User');
    var is_sales_manager = frappe.user_roles.includes('Sales Manager');
    
    // Hide costing fields from sales users in draft state
    if (is_sales_user && !is_sales_manager && frm.doc.status === 'Draft') {
        frm.set_df_property('estimated_total_cost', 'hidden', 1);
        frm.set_df_property('estimated_selling_price', 'hidden', 1);
        
        // Hide unit cost fields in items table
        frm.fields_dict.custom_furniture_items.grid.set_column_disp('estimated_unit_cost', false);
        frm.fields_dict.custom_furniture_items.grid.set_column_disp('estimated_total_item_cost', false);
    }
    
    // Manufacturing users can only edit costing fields
    if (is_manufacturing_user && !is_sales_manager) {
        if (frm.doc.status !== 'Submitted to Manufacturing') {
            frm.set_read_only();
        } else {
            // Allow editing only costing fields
            frm.set_df_property('estimated_unit_cost', 'read_only', 0);
            frm.set_df_property('estimated_selling_price', 'read_only', 0);
        }
    }
}

function populate_customer_from_lead(frm) {
    if (frm.doc.lead) {
        frappe.call({
            method: 'frappe.client.get',
            args: {
                doctype: 'Lead',
                name: frm.doc.lead
            },
            callback: function(r) {
                if (r.message) {
                    var lead = r.message;
                    
                    // Check if customer exists for this lead
                    if (lead.customer) {
                        frm.set_value('customer', lead.customer);
                    }
                    
                    // Populate contact details
                    if (lead.lead_name) {
                        frm.set_value('contact_person', lead.lead_name);
                    }
                    if (lead.email_id) {
                        frm.set_value('contact_email', lead.email_id);
                    }
                }
            }
        });
    }
}

function calculate_item_total(frm, cdt, cdn) {
    var row = locals[cdt][cdn];
    if (row.quantity && row.estimated_unit_cost) {
        row.estimated_total_item_cost = row.quantity * row.estimated_unit_cost;
    } else {
        row.estimated_total_item_cost = 0;
    }
    frm.refresh_field('custom_furniture_items');
    calculate_total_cost(frm);
}

function calculate_total_cost(frm) {
    var total = 0;
    if (frm.doc.custom_furniture_items) {
        frm.doc.custom_furniture_items.forEach(function(item) {
            if (item.estimated_total_item_cost) {
                total += item.estimated_total_item_cost;
            }
        });
    }
    frm.set_value('estimated_total_cost', total);
}

