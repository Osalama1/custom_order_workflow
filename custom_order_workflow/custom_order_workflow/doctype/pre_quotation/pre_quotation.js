// Copyright (c) 2024, Manus AI and contributors
// For license information, please see license.txt

frappe.ui.form.on("Pre-Quotation", {
	refresh: function(frm) {
		// Calculate totals
		calculate_totals(frm);

		// Dynamic field visibility and editability based on status
		const is_draft = frm.doc.docstatus === 0 && frm.doc.status === "Draft";
		const is_submitted_to_manufacturing = frm.doc.docstatus === 0 && frm.doc.status === "Submitted to Manufacturing";
		const is_costing_done = frm.doc.docstatus === 0 && frm.doc.status === "Costing Done";
		const is_approved_internally = frm.doc.docstatus === 0 && frm.doc.status === "Approved Internally";
		const is_converted_to_quotation = frm.doc.docstatus === 1 && frm.doc.status === "Converted to Quotation";

		// Check user roles
		const is_sales_user = frappe.user.has_role("Sales User");
		const is_manufacturing_user = frappe.user.has_role("Manufacturing User");
		const is_sales_manager = frappe.user.has_role("Sales Manager");

		// Define all fields to manage within the child table
		const item_fields_to_manage = [
			"item_name", "description", "quantity", "attached_image",
			"cost_per_unit", "total_cost",
			"profit_margin_percent", "selling_price_per_unit", "total_selling_amount", "profit_amount"
		];

		// Define main form fields to manage
		const main_fields_to_manage = [
			"estimated_total_cost", "estimated_selling_price", "total_profit_amount", "overall_profit_margin", "vat_rate"
		];

		// Reset all fields to hidden and read-only by default, then apply specific rules
		item_fields_to_manage.forEach(field => {
			frm.set_df_property(field, "hidden", 1, "custom_furniture_items");
			frm.set_df_property(field, "read_only", 1, "custom_furniture_items");
		});
		main_fields_to_manage.forEach(field => {
			frm.set_df_property(field, "hidden", 1);
			frm.set_df_property(field, "read_only", 1);
		});

		// Always ensure the main table is visible
		frm.set_df_property("custom_furniture_items", "hidden", 0);

		if (is_draft) {
			// Sales User in Draft state: only basic item details are visible and editable
			if (is_sales_user) {
				frm.set_df_property("custom_furniture_items", "read_only", 0); // Table is editable
				frm.set_df_property("item_name", "hidden", 0, "custom_furniture_items");
				frm.set_df_property("item_name", "read_only", 0, "custom_furniture_items");
				frm.set_df_property("description", "hidden", 0, "custom_furniture_items");
				frm.set_df_property("description", "read_only", 0, "custom_furniture_items");
				frm.set_df_property("quantity", "hidden", 0, "custom_furniture_items");
				frm.set_df_property("quantity", "read_only", 0, "custom_furniture_items");
				frm.set_df_property("attached_image", "hidden", 0, "custom_furniture_items");
				frm.set_df_property("attached_image", "read_only", 0, "custom_furniture_items");
				
				// VAT rate should be visible and editable in draft for sales user
				frm.set_df_property("vat_rate", "hidden", 0);
				frm.set_df_property("vat_rate", "read_only", 0);
			}
			// For other roles in draft, table might be read-only or hidden based on their permissions
			// (handled by permlevels in DocType JSON if not explicitly set here)

		} else if (is_submitted_to_manufacturing) {
			// Manufacturing User in Submitted to Manufacturing state: can edit cost_per_unit
			if (is_manufacturing_user) {
				frm.set_df_property("custom_furniture_items", "read_only", 0); // Table is editable
				// Show basic item details (read-only)
				frm.set_df_property("item_name", "hidden", 0, "custom_furniture_items");
				frm.set_df_property("description", "hidden", 0, "custom_furniture_items");
				frm.set_df_property("quantity", "hidden", 0, "custom_furniture_items");
				frm.set_df_property("attached_image", "hidden", 0, "custom_furniture_items");
				
				// Show and make cost_per_unit editable
				frm.set_df_property("cost_per_unit", "hidden", 0, "custom_furniture_items");
				frm.set_df_property("cost_per_unit", "read_only", 0, "custom_furniture_items");
				
				// Show total_cost (read-only)
				frm.set_df_property("total_cost", "hidden", 0, "custom_furniture_items");
				
				// Show estimated_total_cost in main form (read-only)
				frm.set_df_property("estimated_total_cost", "hidden", 0);
			}
			// For other roles, table and fields are read-only or hidden based on permlevels
			frm.set_df_property("custom_furniture_items", "read_only", 1);
			main_fields_to_manage.forEach(field => {
				frm.set_df_property(field, "read_only", 1);
			});

		} else if (is_costing_done || is_approved_internally) {
			// Sales Manager view: all fields visible, sales-related fields editable
			if (is_sales_manager) {
				frm.set_df_property("custom_furniture_items", "read_only", 0); // Table is editable
				item_fields_to_manage.forEach(field => {
					frm.set_df_property(field, "hidden", 0, "custom_furniture_items");
					frm.set_df_property(field, "read_only", 0, "custom_furniture_items");
				});
				// Make profit_margin_percent and selling_price_per_unit editable specifically
				frm.set_df_property("profit_margin_percent", "read_only", 0, "custom_furniture_items");
				frm.set_df_property("selling_price_per_unit", "read_only", 0, "custom_furniture_items");
				
				main_fields_to_manage.forEach(field => {
					frm.set_df_property(field, "hidden", 0);
					frm.set_df_property(field, "read_only", 0);
				});
			}
			// For other roles, table and fields are read-only or hidden based on permlevels
			frm.set_df_property("custom_furniture_items", "read_only", 1);
			main_fields_to_manage.forEach(field => {
				frm.set_df_property(field, "read_only", 1);
			});

		} else if (is_converted_to_quotation) {
			// All fields read-only and visible
			frm.set_df_property("custom_furniture_items", "read_only", 1);
			item_fields_to_manage.forEach(field => {
				frm.set_df_property(field, "hidden", 0, "custom_furniture_items");
				frm.set_df_property(field, "read_only", 1, "custom_furniture_items");
			});
			main_fields_to_manage.forEach(field => {
				frm.set_df_property(field, "hidden", 0);
				frm.set_df_property(field, "read_only", 1);
			});
		}
	},
	
	onload: function(frm) {
		// Set default valid until date (30 days from today)
		if (!frm.doc.valid_until && frm.doc.pre_quotation_date) {
			let valid_date = frappe.datetime.add_days(frm.doc.pre_quotation_date, 30);
			frm.set_value("valid_until", valid_date);
		}
	},
	
	before_submit: function(frm) {
		// Validate that items exist
		if (!frm.doc.custom_furniture_items || frm.doc.custom_furniture_items.length === 0) {
			frappe.throw(__("Please add at least one item before submitting"));
		}
		
		// Set status to Submitted
		frm.set_value("status", "Submitted");
	}
});

frappe.ui.form.on("Pre-Quotation Item", {
	quantity: function(frm, cdt, cdn) {
		calculate_item_totals(frm, cdt, cdn);
	},
	
	selling_price_per_unit: function(frm, cdt, cdn) {
		calculate_item_totals(frm, cdt, cdn);
	},
	
	cost_per_unit: function(frm, cdt, cdn) {
		calculate_item_totals(frm, cdt, cdn);
	},
	
	profit_margin_percent: function(frm, cdt, cdn) {
		let row = locals[cdt][cdn];
		// If profit margin is changed, recalculate selling price
		if (row.profit_margin_percent !== undefined && row.total_cost > 0) {
			let profit_multiplier = 1 + (row.profit_margin_percent / 100);
			row.selling_price_per_unit = row.total_cost * profit_multiplier;
		}
		calculate_item_totals(frm, cdt, cdn);
	}
});

function calculate_item_totals(frm, cdt, cdn) {
	let row = locals[cdt][cdn];
	
	// Calculate total cost
	row.total_cost = (row.cost_per_unit || 0);
	
	// Calculate total selling amount
	row.total_selling_amount = (row.selling_price_per_unit || 0) * (row.quantity || 0);
	
	// Calculate profit
	row.profit_amount = row.total_selling_amount - (row.total_cost * (row.quantity || 0));
	
	// Calculate profit margin
	if (row.total_cost > 0) {
		row.profit_margin = (row.profit_amount / (row.total_cost * (row.quantity || 0))) * 100;
	}
	
	frm.refresh_field("custom_furniture_items");
	calculate_totals(frm);
}

function calculate_totals(frm) {
	let total_selling_price_before_vat = 0;
	let estimated_total_cost = 0;
	
	frm.doc.custom_furniture_items.forEach(function(item) {
		estimated_total_cost += (item.total_cost || 0) * (item.quantity || 0);
		total_selling_price_before_vat += item.total_selling_amount || 0;
	});
	
	let total_profit = total_selling_price_before_vat - estimated_total_cost;
	let profit_margin = estimated_total_cost > 0 ? (total_profit / estimated_total_cost) * 100 : 0;
	
	// Calculate VAT
	let vat_rate = frm.doc.vat_rate || 0;
	let total_vat_amount = total_selling_price_before_vat * (vat_rate / 100);
	let total_selling_price_after_vat = total_selling_price_before_vat + total_vat_amount;

	frm.set_value("estimated_total_cost", estimated_total_cost);
	frm.set_value("estimated_selling_price", total_selling_price_after_vat);
	frm.set_value("total_profit_amount", total_profit);
	frm.set_value("overall_profit_margin", profit_margin);
	frm.set_value("total_vat_amount", total_vat_amount);
}

function create_quotation_from_pre_quotation(frm) {
	frappe.call({
		method: "custom_order_workflow.api.create_quotation_from_pre_quotation",
		args: {
			pre_quotation_name: frm.doc.name
		},
		callback: function(r) {
			if (r.message) {
				frappe.set_route("Form", "Quotation", r.message);
			}
		}
	});
}




