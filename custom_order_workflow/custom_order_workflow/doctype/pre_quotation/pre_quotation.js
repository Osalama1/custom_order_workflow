frappe.ui.form.on("Pre-Quotation", {
	on_load: function(frm) {
		// Set initial visibility for new documents
		if (frm.doc.__islocal) {
			// Hide all pricing summary fields by default for new documents
			set_pricing_summary_visibility(frm, 0);
			// Hide VAT field in draft
			frm.set_df_property("vat_rate", "hidden", 1);
		}

		
	
		// Hide the button by default and show only when status is "Converted to Quotation"

		setup_field_visibility(frm);
	},
	validate: function(frm) {
        if (!frm.doc.lead && !frm.doc.customer) {
            frappe.throw(__("Please enter either a Lead or a Customer."));
        }
    },
	refresh: function(frm) {
		setup_field_visibility(frm);
	},

	status: function(frm) {
		setup_field_visibility(frm);
	},

	// Auto-populate contact person and email based on Lead or Customer selection
	lead: function(frm) {
		if (frm.doc.lead) {
			frappe.db.get_value("Lead", frm.doc.lead, ["mobile_no", "email_id"], function(r) {
				frm.set_value("contact_person", r.contact_person);
				frm.set_value("contact_email", r.email_id);
			});
		} else {
			frm.set_value("contact_person", "");
			frm.set_value("contact_email", "");
		}
	},

	customer: function(frm) {
		if (frm.doc.customer) {
			frappe.db.get_value("Customer", frm.doc.customer, ["mobile_no", "email_id"], function(r) {
				frm.set_value("contact_person", r.contact_person);
				frm.set_value("contact_email", r.email_id);
			});
		} else {
			frm.set_value("contact_person", "");
			frm.set_value("contact_email", "");
		}
	}
});

frappe.ui.form.on("Pre-Quotation Item", {
	
	quantity: function(frm, cdt, cdn) {
		calculate_item_totals(frm, cdt, cdn);
		selling_price_per_unit (frm, cdt, cdn) 
		profit_margin_percent(frm, cdt, cdn) 


	},
	cost_per_unit: function(frm, cdt, cdn) {
		let row = locals[cdt][cdn];
		row.total_cost = flt(row.quantity * row.cost_per_unit);
		calculate_item_totals(frm, cdt, cdn);
	},
		// When selling price is changed
		selling_price_per_unit: function(frm, cdt, cdn) {
			let row = locals[cdt][cdn];
			row.total_cost = flt(row.quantity * row.cost_per_unit);

			if (row.cost_per_unit > 0) {
				row.profit_margin_percent = flt(((row.selling_price_per_unit - row.cost_per_unit) / row.cost_per_unit) * 100, 2);
				row.total_selling_amount = flt(row.quantity * row.selling_price_per_unit);
				row.vat_amount_item = flt(row.total_selling_amount * (row.vat_rate_item / 100), 2);
				row.profit_amount = flt(row.total_selling_amount - row.total_cost);
			}
			frm.refresh_field("custom_furniture_items");
			calculate_main_form_totals(frm);
		},
	
		// When profit margin is changed
		profit_margin_percent: function(frm, cdt, cdn) {
			let row = locals[cdt][cdn];
			row.total_cost = flt(row.quantity * row.cost_per_unit);

			row.selling_price_per_unit = flt(row.cost_per_unit * (1 + row.profit_margin_percent / 100), 2);
			row.total_selling_amount = flt(row.quantity * row.selling_price_per_unit);
			row.vat_amount_item = flt(row.total_selling_amount * (row.vat_rate_item / 100), 2);
			row.profit_amount = flt(row.total_selling_amount - row.total_cost);
	
			frm.refresh_field("custom_furniture_items");
			calculate_main_form_totals(frm);
		},
	vat_rate_item: function(frm, cdt, cdn) {
		calculate_item_totals(frm, cdt, cdn);
	}
});

function calculate_item_totals(frm, cdt, cdn) {
	let row = frappe.get_doc(cdt, cdn);
	row.total_cost = flt(row.quantity * row.cost_per_unit);

	// Calculate selling price or profit margin based on which one is entered
	if (row.selling_price_per_unit && !row.profit_margin_percent) {
		if (row.cost_per_unit > 0) {
			row.profit_margin_percent = flt(((row.selling_price_per_unit - row.cost_per_unit) / row.cost_per_unit) * 100, 2);
		} else {
			row.profit_margin_percent = 0;
		}
	} else if (row.profit_margin_percent && !row.selling_price_per_unit) {
		row.selling_price_per_unit = flt(row.cost_per_unit * (1 + row.profit_margin_percent / 100), 2);
	}

	row.total_selling_amount = flt(row.quantity * row.selling_price_per_unit);

	// Calculate VAT amount per item
	row.vat_amount_item = flt(row.total_selling_amount * (row.vat_rate_item / 100), 2);

	row.profit_amount = flt(row.total_selling_amount - row.total_cost);

	frm.refresh_field("custom_furniture_items");

	// Recalculate main form totals
	calculate_main_form_totals(frm);
}

function calculate_main_form_totals(frm) {
	let total_cost = 0;
	let total_selling_price = 0;
	let total_vat_amount = 0;
	let total_profit_amount = 0;

	frm.doc.custom_furniture_items.forEach(function(row) {
		total_cost += row.total_cost;
		total_selling_price += row.total_selling_amount;
		total_vat_amount += row.vat_amount_item;
		total_profit_amount += row.profit_amount;
	});

	frm.set_value("estimated_total_cost", total_cost);
	frm.set_value("estimated_selling_price", total_selling_price);
	frm.set_value("total_vat_amount", total_vat_amount);
	frm.set_value("total_profit_amount", total_profit_amount);

	// Calculate overall profit margin
	if (total_cost > 0) {
		frm.set_value("overall_profit_margin", flt((total_profit_amount / total_cost) * 100, 2));
	} else {
		frm.set_value("overall_profit_margin", 0);
	}
}

function set_pricing_summary_visibility(frm, hidden) {
	const pricing_fields = [
		"estimated_total_cost",
		"estimated_selling_price",
		"overall_profit_margin",
		"total_vat_amount"
	];

	pricing_fields.forEach(field => {
		frm.set_df_property(field, "hidden", hidden);
	});
}

function setup_field_visibility(frm) {
	const is_sales_user = frappe.user.has_role("Sales User");
	const is_manufacturing_user = frappe.user.has_role("Manufacturing User");
	const is_sales_manager = frappe.user.has_role("Sales Manager");

	// Default visibility for all fields in the child table
	const all_item_fields = [
		"item_name", "description", "quantity", "attached_image", "uom",
		"cost_per_unit", "total_cost",
		"profit_margin_percent", "selling_price_per_unit", "total_selling_amount", "profit_amount", "vat_rate_item",
		"manufacturing_notes", "sales_notes"
	];

	// Hide all fields initially and set to read-only
	all_item_fields.forEach(field => {
		frm.fields_dict["custom_furniture_items"].grid.update_docfield_property(field, "hidden", 1);
		frm.fields_dict["custom_furniture_items"].grid.update_docfield_property(field, "read_only", 1);
	});
	frm.set_df_property("custom_furniture_items", "read_only", 1);

	// Hide all main form pricing summary fields initially
	set_pricing_summary_visibility(frm, 1);

	// Specific visibility based on status and role
	switch (frm.doc.status) {
		case "Draft":
			// Sales User in Draft state: can edit basic item details
			if (is_sales_user || frm.doc.__islocal) {
				frm.set_df_property("custom_furniture_items", "read_only", 0);
				["item_name", "quantity", "attached_image","description"].forEach(field => {
					frm.fields_dict["custom_furniture_items"].grid.update_docfield_property(field, "hidden", 0);
					frm.fields_dict["custom_furniture_items"].grid.update_docfield_property(field, "read_only", 0);
				});
				// Hide VAT field in draft
				frm.set_df_property("vat_rate", "hidden", 1);
			} else {
				// For other roles, all fields are read-only and hidden as per default
				// Show only basic item details
				["item_name", "quantity", "attached_image","description"].forEach(field => {
					frm.fields_dict["custom_furniture_items"].grid.update_docfield_property(field, "hidden", 0);
					frm.fields_dict["custom_furniture_items"].grid.update_docfield_property(field, "read_only", 1);
				});
			}
			break;

		case "Submitted to Manufacturing":
			// Manufacturing User in Submitted to Manufacturing state: can edit cost_per_unit
			if (is_manufacturing_user) {
				frm.set_df_property("custom_furniture_items", "read_only", 0);
			
				// Show read-only item basics
				["item_name", "quantity", "attached_image","description"].forEach(field => {
					frm.fields_dict["custom_furniture_items"].grid.update_docfield_property(field, "hidden", 0);
					frm.fields_dict["custom_furniture_items"].grid.update_docfield_property(field, "read_only", 1);
				});
			
				// Cost per unit: editable
				frm.fields_dict["custom_furniture_items"].grid.update_docfield_property("cost_per_unit", "hidden", 0);
				frm.fields_dict["custom_furniture_items"].grid.update_docfield_property("cost_per_unit", "read_only", 0);
			
				// Total Cost: read-only
				frm.fields_dict["custom_furniture_items"].grid.update_docfield_property("total_cost", "hidden", 0);
				frm.fields_dict["custom_furniture_items"].grid.update_docfield_property("total_cost", "read_only", 1);
			
				// Hide all selling-related fields
				["profit_margin_percent", "selling_price_per_unit", "total_selling_amount", "profit_amount", "vat_rate_item"].forEach(field => {
					frm.fields_dict["custom_furniture_items"].grid.update_docfield_property(field, "hidden", 1);
				});
			
				// Show main form total cost only
				frm.set_df_property("estimated_total_cost", "hidden", 0);
				frm.set_df_property("estimated_total_cost", "read_only", 1);
			
				// Hide VAT fields from main form
				frm.set_df_property("vat_rate", "hidden", 1);
				frm.set_df_property("total_vat_amount", "hidden", 1);

			} else {
				// For other roles, all fields are read-only and hidden as per default
				// Show only basic item details and total cost
				["item_name", "quantity", "attached_image", "total_cost"].forEach(field => {
					frm.fields_dict["custom_furniture_items"].grid.update_docfield_property(field, "hidden", 0);
					frm.fields_dict["custom_furniture_items"].grid.update_docfield_property(field, "read_only", 1);
				});
				frm.set_df_property("estimated_total_cost", "hidden", 0);
				frm.set_df_property("estimated_total_cost", "read_only", 1);
			}
			break;

		case "Costing Done":
		case "Approved Internally":
			// Sales Manager view: all cost and pricing fields visible, profit_margin_percent editable
			if (is_sales_manager) {
				frm.set_df_property("custom_furniture_items", "read_only", 0);
				all_item_fields.forEach(field => {
					frm.fields_dict["custom_furniture_items"].grid.update_docfield_property(field, "hidden", 0);
					frm.fields_dict["custom_furniture_items"].grid.update_docfield_property(field, "read_only", 1);
				});
				frm.fields_dict["custom_furniture_items"].grid.update_docfield_property("profit_margin_percent", "read_only", 0);
				frm.fields_dict["custom_furniture_items"].grid.update_docfield_property("selling_price_per_unit", "read_only", 0);

				// Show main form pricing summary
				set_pricing_summary_visibility(frm, 0);
				frm.set_df_property("vat_rate", "hidden", 1);
			} else {
				// For other roles, all fields are read-only
				all_item_fields.forEach(field => {
					frm.fields_dict["custom_furniture_items"].grid.update_docfield_property(field, "hidden", 0);
					frm.fields_dict["custom_furniture_items"].grid.update_docfield_property(field, "read_only", 1);
				});
				set_pricing_summary_visibility(frm, 0);
				frm.set_df_property("vat_rate", "hidden", 1);
			}
			break;

		case "Converted to Quotation":
			// Add custom button for creating Quotation
			if (is_sales_manager) {
		frm.add_custom_button(__("Create Quotation"), function() {
			frappe.call({
				method: "custom_order_workflow.custom_order_workflow.doctype.pre_quotation.pre_quotation.create_quotation_from_pre_quotation",
				args: {
					docname: frm.doc.name
				},
				callback: function(r) {
					if (r.message) {
						frappe.msgprint(__("Quotation {0} created successfully", [r.message]));
						frappe.set_route("Form", "Quotation", r.message);
					}
				}
			});
		}, __("Create"), "btn-primary");
	}
			// All fields visible but read-only
			all_item_fields.forEach(field => {
				frm.fields_dict["custom_furniture_items"].grid.update_docfield_property(field, "hidden", 0);
				frm.fields_dict["custom_furniture_items"].grid.update_docfield_property(field, "read_only", 1);
			});
			set_pricing_summary_visibility(frm, 0);
			frm.set_df_property("vat_rate", "hidden", 1);
			break;

		case "Rejected":
		case "Cancelled":
			// All fields visible but read-only
			all_item_fields.forEach(field => {
				frm.fields_dict["custom_furniture_items"].grid.update_docfield_property(field, "hidden", 0);
				frm.fields_dict["custom_furniture_items"].grid.update_docfield_property(field, "read_only", 1);
			});
			set_pricing_summary_visibility(frm, 0);
			frm.set_df_property("vat_rate", "hidden", 1);
			break;
	}

	frm.refresh_field("custom_furniture_items");
}


