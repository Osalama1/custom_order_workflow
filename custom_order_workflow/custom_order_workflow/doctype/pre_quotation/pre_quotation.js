// Copyright (c) 2024, Manus AI and contributors
// For license information, please see license.txt

frappe.ui.form.on("Pre-Quotation", {
	refresh: function(frm) {
		// Calculate totals
		calculate_totals(frm);

		// Dynamic field visibility and editability based on status
		if (frm.doc.docstatus === 0) { // Draft
			// Fields for initial creation
			frm.set_df_property("custom_furniture_items", "read_only", 0);
			frm.set_df_property("custom_furniture_items", "hidden", 0);
			
			// Show Item/Description, Quantity, Attached Image in grid
			frm.set_df_property("item_name", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("description", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("quantity", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("attached_image", "hidden", 0, "custom_furniture_items");
			
			// Hide cost and pricing fields
			frm.set_df_property("material_cost", "hidden", 1, "custom_furniture_items");
			frm.set_df_property("labor_cost", "hidden", 1, "custom_furniture_items");
			frm.set_df_property("overhead_cost", "hidden", 1, "custom_furniture_items");
			frm.set_df_property("total_cost", "hidden", 1, "custom_furniture_items");
			frm.set_df_property("profit_margin_percent", "hidden", 1, "custom_furniture_items");
			frm.set_df_property("selling_price", "hidden", 1, "custom_furniture_items");
			frm.set_df_property("total_selling_amount", "hidden", 1, "custom_furniture_items");
			frm.set_df_property("profit_amount", "hidden", 1, "custom_furniture_items");
			
			frm.set_df_property("estimated_total_cost", "hidden", 1);
			frm.set_df_property("estimated_selling_price", "hidden", 1);
			frm.set_df_property("total_profit_amount", "hidden", 1);
			frm.set_df_property("overall_profit_margin", "hidden", 1);
			frm.set_df_property("vat_rate", "hidden", 1);

		} else if (frm.doc.docstatus === 1 && frm.doc.status === "Submitted to Manufacturing") { // Submitted to Manufacturing
			// Make custom_furniture_items read-only
			frm.set_df_property("custom_furniture_items", "read_only", 1);
			
			// Show only cost fields in the grid
			frm.set_df_property("item_name", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("description", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("quantity", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("attached_image", "hidden", 0, "custom_furniture_items");
			
			frm.set_df_property("material_cost", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("labor_cost", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("overhead_cost", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("total_cost", "hidden", 0, "custom_furniture_items");
			
			// Hide pricing fields
			frm.set_df_property("profit_margin_percent", "hidden", 1, "custom_furniture_items");
			frm.set_df_property("selling_price", "hidden", 1, "custom_furniture_items");
			frm.set_df_property("total_selling_amount", "hidden", 1, "custom_furniture_items");
			frm.set_df_property("profit_amount", "hidden", 1, "custom_furniture_items");
			
			frm.set_df_property("estimated_total_cost", "hidden", 0);
			frm.set_df_property("estimated_selling_price", "hidden", 1);
			frm.set_df_property("total_profit_amount", "hidden", 1);
			frm.set_df_property("overall_profit_margin", "hidden", 1);
			frm.set_df_property("vat_rate", "hidden", 1);

		} else if (frm.doc.docstatus === 1 && (frm.doc.status === "Costing Done" || frm.doc.status === "Approved Internally")) { // Sales Managers
			// Make custom_furniture_items editable for sales managers
			frm.set_df_property("custom_furniture_items", "read_only", 0);
			
			// Show cost and pricing fields
			frm.set_df_property("item_name", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("description", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("quantity", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("attached_image", "hidden", 0, "custom_furniture_items");
			
			frm.set_df_property("material_cost", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("labor_cost", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("overhead_cost", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("total_cost", "hidden", 0, "custom_furniture_items");
			
			frm.set_df_property("profit_margin_percent", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("selling_price", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("total_selling_amount", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("profit_amount", "hidden", 0, "custom_furniture_items");
			
			// Make profit_margin_percent editable
			frm.set_df_property("profit_margin_percent", "read_only", 0, "custom_furniture_items");
			
			frm.set_df_property("estimated_total_cost", "hidden", 0);
			frm.set_df_property("estimated_selling_price", "hidden", 0);
			frm.set_df_property("total_profit_amount", "hidden", 0);
			frm.set_df_property("overall_profit_margin", "hidden", 0);
			frm.set_df_property("vat_rate", "hidden", 0);

		} else if (frm.doc.docstatus === 1 && frm.doc.status === "Converted to Quotation") { // Converted to Quotation
			// Make all fields read-only
			frm.set_df_property("custom_furniture_items", "read_only", 1);
			
			// Show all relevant fields
			frm.set_df_property("item_name", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("description", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("quantity", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("attached_image", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("material_cost", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("labor_cost", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("overhead_cost", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("total_cost", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("profit_margin_percent", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("selling_price", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("total_selling_amount", "hidden", 0, "custom_furniture_items");
			frm.set_df_property("profit_amount", "hidden", 0, "custom_furniture_items");
			
			frm.set_df_property("estimated_total_cost", "hidden", 0);
			frm.set_df_property("estimated_selling_price", "hidden", 0);
			frm.set_df_property("total_profit_amount", "hidden", 0);
			frm.set_df_property("overall_profit_margin", "hidden", 0);
			frm.set_df_property("vat_rate", "hidden", 0);

		} else { // Default for other statuses or docstatus
			// Hide all custom fields by default
			frm.set_df_property("custom_furniture_items", "hidden", 1);
			frm.set_df_property("estimated_total_cost", "hidden", 1);
			frm.set_df_property("estimated_selling_price", "hidden", 1);
			frm.set_df_property("total_profit_amount", "hidden", 1);
			frm.set_df_property("overall_profit_margin", "hidden", 1);
			frm.set_df_property("vat_rate", "hidden", 1);
		}
	},
	
	onload: function(frm) {
		// Set default valid until date (30 days from today)
		if (!frm.doc.valid_until && frm.doc.pre_quotation_date) {
			let valid_date = frappe.datetime.add_days(frm.doc.pre_quotation_date, 30);
			frm.set_value('valid_until', valid_date);
		}
	},
	
	before_submit: function(frm) {
		// Validate that items exist
		if (!frm.doc.custom_furniture_items || frm.doc.custom_furniture_items.length === 0) {
			frappe.throw(__('Please add at least one item before submitting'));
		}
		
		// Set status to Submitted
		frm.set_value('status', 'Submitted');
	}
});

frappe.ui.form.on("Pre-Quotation Item", {
	quantity: function(frm, cdt, cdn) {
		calculate_item_totals(frm, cdt, cdn);
	},
	
	selling_price_per_unit: function(frm, cdt, cdn) {
		calculate_item_totals(frm, cdt, cdn);
	},
	
	material_cost: function(frm, cdt, cdn) {
		calculate_item_totals(frm, cdt, cdn);
	},
	
	labor_cost: function(frm, cdt, cdn) {
		calculate_item_totals(frm, cdt, cdn);
	},
	
	overhead_cost: function(frm, cdt, cdn) {
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
	row.total_cost = (row.material_cost || 0) + (row.labor_cost || 0) + (row.overhead_cost || 0);
	
	// Calculate total selling amount
	row.total_selling_amount = (row.selling_price_per_unit || 0) * (row.quantity || 0);
	
	// Calculate profit
	row.profit_amount = row.total_selling_amount - (row.total_cost * (row.quantity || 0));
	
	// Calculate profit margin
	if (row.total_cost > 0) {
		row.profit_margin = (row.profit_amount / (row.total_cost * (row.quantity || 0))) * 100;
	}
	
	frm.refresh_field('custom_furniture_items');
	calculate_totals(frm);
}

function calculate_totals(frm) {
	let total_material_cost = 0;
	let total_labor_cost = 0;
	let total_overhead_cost = 0;
	let total_selling_price_before_vat = 0;
	
	frm.doc.custom_furniture_items.forEach(function(item) {
		total_material_cost += (item.material_cost || 0) * (item.quantity || 0);
		total_labor_cost += (item.labor_cost || 0) * (item.quantity || 0);
		total_overhead_cost += (item.overhead_cost || 0) * (item.quantity || 0);
		total_selling_price_before_vat += item.total_selling_amount || 0;
	});
	
	let total_cost = total_material_cost + total_labor_cost + total_overhead_cost;
	let total_profit = total_selling_price_before_vat - total_cost;
	let profit_margin = total_cost > 0 ? (total_profit / total_cost) * 100 : 0;
	
	// Calculate VAT
	let vat_rate = frm.doc.vat_rate || 0;
	let total_vat_amount = total_selling_price_before_vat * (vat_rate / 100);
	let total_selling_price_after_vat = total_selling_price_before_vat + total_vat_amount;

	frm.set_value("total_material_cost", total_material_cost);
	frm.set_value("total_labor_cost", total_labor_cost);
	frm.set_value("total_overhead_cost", total_overhead_cost);
	frm.set_value("estimated_total_cost", total_cost);
	frm.set_value("estimated_selling_price", total_selling_price_after_vat);
	frm.set_value("total_profit_amount", total_profit);
	frm.set_value("overall_profit_margin", profit_margin);
	frm.set_value("total_vat_amount", total_vat_amount);
}

function create_quotation_from_pre_quotation(frm) {
	frappe.call({
		method: 'custom_order_workflow.api.create_quotation_from_pre_quotation',
		args: {
			pre_quotation_name: frm.doc.name
		},
		callback: function(r) {
			if (r.message) {
				frappe.set_route('Form', 'Quotation', r.message);
			}
		}
	});
}

