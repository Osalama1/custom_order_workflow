frappe.ui.form.on('Lead', {
    refresh: function(frm) {
        frm.add_custom_button(__('Create Pre-Quotation'), function() {
            frappe.new_doc('Pre-Quotation', {
                lead: frm.doc.name,
                contact_person: frm.doc.contact_person,
                contact_email: frm.doc.email_id
            });
        }, __('Create'));
    }
});

