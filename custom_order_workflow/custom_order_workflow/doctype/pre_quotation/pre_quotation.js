// Copyright (c) 2024, Manus AI and contributors
// For license information, please see license.txt

frappe.ui.form.on("Pre-Quotation", {
	refresh: function(frm) {
		// Calculate totals
		calculate_totals(frm);

		// Get current workflow state
		const current_status = frm.doc.status;

		// Check user roles
		const is_sales_user = frappe.user.has_role("Sales User");
		const is_manufacturing_user = frappe.user.has_role("Manufacturing User");
		const is_sales_manager = frappe.user.has_role("Sales Manager");

		// Define all fields to manage within the child table
		const item_fields_to_manage = [
			"item_name", "description", "quantity", "attached_image",
			"cost_per_unit", "total_cost",
			"profit_margin_percent", "selling_price_per_unit", "total_selling_amount", "profit_amount", "vat_rate_item"
		];

		// Define main form fields to manage
		const main_fields_to_manage = [
			"estimated_total_cost", "estimated_selling_price", "total_profit_amount", "overall_profit_margin", "vat_rate", "total_vat_amount"
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

		// Hide all pricing summary fields by default, then show specific ones
		frm.set_df_property("estimated_total_cost", "hidden", 1);
		frm.set_df_property("estimated_selling_price", "hidden", 1);
		frm.set_df_property("overall_profit_margin", "hidden", 1);
		frm.set_df_property("total_vat_amount", "hidden", 1);
		frm.set_df_property("total_profit_amount", "hidden", 1);

		switch (current_status) {
			case "Draft":
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
					
					// Hide VAT rate in main form and item table
					frm.set_df_property("vat_rate", "hidden", 1);
					frm.set_df_property("vat_rate_item", "hidden", 1, "custom_furniture_items");
				}
				break;

			case "Submitted to Manufacturing":
				// Manufacturing User in Submitted to Manufacturing state: can edit cost_per_unit
				if (is_manufacturing_user) {
					frm.set_df_property("custom_furniture_items", "read_only", 0); // Table is editable
					// Show basic item details (read-only)
					frm.set_df_property("item_name", "hidden", 0, "custom_furniture_items");
					frm.set_df_property("item_name", "read_only", 1, "custom_furniture_items");
					frm.set_df_property("description", "hidden", 0, "custom_furniture_items");
					frm.set_df_property("description", "read_only", 1, "custom_furniture_items");
					frm.set_df_property("quantity", "hidden", 0, "custom_furniture_items");
					frm.set_df_property("quantity", "read_only", 1, "custom_furniture_items");
					frm.set_df_property("attached_image", "hidden", 0, "custom_furniture_items");
					frm.set_df_property("attached_image", "read_only", 1, "custom_furniture_items");
					
					// Show and make cost_per_unit editable
					frm.set_df_property("cost_per_unit", "hidden", 0, "custom_furniture_items");
					frm.set_df_property("cost_per_unit", "read_only", 0, "custom_furniture_items");
					
					// Show total_cost (read-only)
					frm.set_df_property("total_cost", "hidden", 0, "custom_furniture_items");
					frm.set_df_property("total_cost", "read_only", 1, "custom_furniture_items");
					
					// Hide selling-related fields and VAT rate
					frm.set_df_property("profit_margin_percent", "hidden", 1, "custom_furniture_items");
					frm.set_df_property("selling_price_per_unit", "hidden", 1, "custom_furniture_items");
					frm.set_df_property("total_selling_amount", "hidden", 1, "custom_furniture_items");
					frm.set_df_property("profit_amount", "hidden", 1, "custom_furniture_items");
					frm.set_df_property("vat_rate_item", "hidden", 1, "custom_furniture_items");
					
					// Show only Total Cost in main form
					frm.set_df_property("estimated_total_cost", "hidden", 0);
					frm.set_df_property("estimated_total_cost", "read_only", 1);

				}
				// For other roles, table and fields are read-only or hidden based on permlevels
				if (!is_manufacturing_user) {
					frm.set_df_property("custom_furniture_items", "read_only", 1);
					main_fields_to_manage.forEach(field => {
						frm.set_df_property(field, "read_only", 1);
					});
				}
				break;

			case "Costing Done":
			case "Approved Internally":
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
					
					// Show only Total Cost, Total Selling Price, Total VAT, Profit Margin in main form
					frm.set_df_property("estimated_total_cost", "hidden", 0);
					frm.set_df_property("estimated_total_cost", "read_only", 1);
					frm.set_df_property("estimated_selling_price", "hidden", 0);
					frm.set_df_property("estimated_selling_price", "read_only", 1);
					frm.set_df_property("total_vat_amount", "hidden", 0);
					frm.set_df_property("total_vat_amount", "read_only", 1);
					frm.set_df_property("overall_profit_margin", "hidden", 0);
					frm.set_df_property("overall_profit_margin", "read_only", 1);
					frm.set_df_property("total_profit_amount", "hidden", 0);
					frm.set_df_property("total_profit_amount", "read_only", 1);

				}
				// For other roles, table and fields are read-only or hidden based on permlevels
				if (!is_sales_manager) {
					frm.set_df_property("custom_furniture_items", "read_only", 1);
					main_fields_to_manage.forEach(field => {
						frm.set_df_property(field, "read_only", 1);
					});
				}
				break;

			case "Converted to Quotation":
				// All fields read-only and visible, show 

