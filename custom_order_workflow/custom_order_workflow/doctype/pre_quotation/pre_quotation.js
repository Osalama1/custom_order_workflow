// Copyright (c) 2024, Manus AI and contributors
// For license information, please see license.txt

frappe.ui.form.on('Pre-Quotation', {
	refresh: function(frm) {
		// Initialize visual selector
		if (frm.doc.docstatus === 0) {
			init_visual_selector(frm);
		}
		
		// Add custom buttons
		if (frm.doc.docstatus === 1 && frm.doc.status === 'Submitted') {
			frm.add_custom_button(__('Create Quotation'), function() {
				create_quotation_from_pre_quotation(frm);
			});
		}
		
		// Calculate totals
		calculate_totals(frm);
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

frappe.ui.form.on('Pre-Quotation Item', {
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
	}
});

function init_visual_selector(frm) {
	// Load visual selector data and initialize interface
	frappe.call({
		method: 'custom_order_workflow.api.get_visual_selector_data',
		callback: function(r) {
			if (r.message) {
				render_visual_selector(frm, r.message);
			}
		}
	});
}

function render_visual_selector(frm, data) {
	let container = frm.fields_dict.visual_selector_html.$wrapper;
	container.empty();
	
	let html = `
		<div class="visual-selector">
			<div class="selector-header">
				<h4>Select Items for Your Project</h4>
				<p>Click on categories and items to add them to your quotation</p>
			</div>
			<div class="categories-container">
	`;
	
	// Render categories
	Object.keys(data).forEach(categoryId => {
		let category = data[categoryId];
		html += `
			<div class="category-card" data-category="${categoryId}">
				<div class="category-icon">${category.icon || '📦'}</div>
				<div class="category-name">${category.name}</div>
				<div class="category-description">${category.description || ''}</div>
			</div>
		`;
	});
	
	html += `
			</div>
			<div class="subcategories-container" style="display: none;"></div>
			<div class="items-container" style="display: none;"></div>
			<div class="item-details-container" style="display: none;"></div>
		</div>
	`;
	
	container.html(html);
	
	// Add event listeners
	container.find('.category-card').on('click', function() {
		let categoryId = $(this).data('category');
		show_subcategories(frm, data, categoryId);
	});
}

function show_subcategories(frm, data, categoryId) {
	let container = frm.fields_dict.visual_selector_html.$wrapper;
	let subcategoriesContainer = container.find('.subcategories-container');
	
	subcategoriesContainer.empty().show();
	
	let html = `
		<div class="selector-breadcrumb">
			<span class="breadcrumb-item active">${data[categoryId].name}</span>
		</div>
		<div class="subcategories-grid">
	`;
	
	Object.keys(data[categoryId].subcategories).forEach(subcategoryId => {
		let subcategory = data[categoryId].subcategories[subcategoryId];
		html += `
			<div class="subcategory-card" data-category="${categoryId}" data-subcategory="${subcategoryId}">
				<div class="subcategory-icon">${subcategory.icon || '📋'}</div>
				<div class="subcategory-name">${subcategory.name}</div>
				<div class="subcategory-description">${subcategory.description || ''}</div>
			</div>
		`;
	});
	
	html += '</div>';
	subcategoriesContainer.html(html);
	
	// Add event listeners
	subcategoriesContainer.find('.subcategory-card').on('click', function() {
		let subcategoryId = $(this).data('subcategory');
		show_items(frm, data, categoryId, subcategoryId);
	});
}

function show_items(frm, data, categoryId, subcategoryId) {
	let container = frm.fields_dict.visual_selector_html.$wrapper;
	let itemsContainer = container.find('.items-container');
	
	itemsContainer.empty().show();
	
	let html = `
		<div class="selector-breadcrumb">
			<span class="breadcrumb-item">${data[categoryId].name}</span>
			<span class="breadcrumb-separator">></span>
			<span class="breadcrumb-item active">${data[categoryId].subcategories[subcategoryId].name}</span>
		</div>
		<div class="items-grid">
	`;
	
	Object.keys(data[categoryId].subcategories[subcategoryId].items).forEach(itemId => {
		let item = data[categoryId].subcategories[subcategoryId].items[itemId];
		html += `
			<div class="item-card" data-category="${categoryId}" data-subcategory="${subcategoryId}" data-item="${itemId}">
				<div class="item-image">
					${item.image_url ? `<img src="${item.image_url}" alt="${item.name}">` : '<div class="no-image">📦</div>'}
				</div>
				<div class="item-name">${item.name}</div>
				<div class="item-price">$${item.base_price}</div>
				<div class="item-unit">per ${item.unit}</div>
			</div>
		`;
	});
	
	html += '</div>';
	itemsContainer.html(html);
	
	// Add event listeners
	itemsContainer.find('.item-card').on('click', function() {
		let itemId = $(this).data('item');
		show_item_details(frm, data, categoryId, subcategoryId, itemId);
	});
}

function show_item_details(frm, data, categoryId, subcategoryId, itemId) {
	let container = frm.fields_dict.visual_selector_html.$wrapper;
	let detailsContainer = container.find('.item-details-container');
	
	let item = data[categoryId].subcategories[subcategoryId].items[itemId];
	
	detailsContainer.empty().show();
	
	let html = `
		<div class="item-details">
			<div class="item-header">
				<h4>${item.name}</h4>
				<p>${item.description}</p>
			</div>
			<div class="item-specifications">
				<h5>Specifications</h5>
				<div class="specs-form" data-item-id="${itemId}">
	`;
	
	// Render specifications
	Object.keys(item.specifications || {}).forEach(specId => {
		let spec = item.specifications[specId];
		html += `
			<div class="spec-field">
				<label>${spec.name}${spec.is_required ? ' *' : ''}</label>
		`;
		
		if (spec.type === 'select') {
			html += `<select class="spec-input" data-spec="${spec.name}">`;
			spec.options.forEach((option, index) => {
				let selected = option === spec.default_value ? 'selected' : '';
				html += `<option value="${option}" ${selected}>${option}</option>`;
			});
			html += '</select>';
		} else if (spec.type === 'number') {
			html += `<input type="number" class="spec-input" data-spec="${spec.name}" value="${spec.default_value || ''}" placeholder="Enter ${spec.name}">`;
		} else {
			html += `<input type="text" class="spec-input" data-spec="${spec.name}" value="${spec.default_value || ''}" placeholder="Enter ${spec.name}">`;
		}
		
		html += '</div>';
	});
	
	html += `
				</div>
				<div class="quantity-section">
					<label>Quantity</label>
					<input type="number" class="quantity-input" value="1" min="1">
				</div>
				<div class="add-item-section">
					<button class="btn btn-primary add-item-btn">Add to Quotation</button>
				</div>
			</div>
		</div>
	`;
	
	detailsContainer.html(html);
	
	// Add event listener for add button
	detailsContainer.find('.add-item-btn').on('click', function() {
		add_item_to_quotation(frm, data, categoryId, subcategoryId, itemId);
	});
}

function add_item_to_quotation(frm, data, categoryId, subcategoryId, itemId) {
	let container = frm.fields_dict.visual_selector_html.$wrapper;
	let detailsContainer = container.find('.item-details-container');
	
	let item = data[categoryId].subcategories[subcategoryId].items[itemId];
	let quantity = parseInt(detailsContainer.find('.quantity-input').val()) || 1;
	
	// Collect specifications
	let specifications = {};
	detailsContainer.find('.spec-input').each(function() {
		let specName = $(this).data('spec');
		let specValue = $(this).val();
		specifications[specName] = specValue;
	});
	
	// Calculate price with specifications
	frappe.call({
		method: 'custom_order_workflow.api.calculate_item_price',
		args: {
			item_id: itemId,
			specifications: specifications,
			quantity: quantity
		},
		callback: function(r) {
			if (r.message && !r.message.error) {
				// Add item to child table
				let child = frm.add_child('custom_furniture_items');
				child.item_name = item.name;
				child.item_description = item.description;
				child.quantity = quantity;
				child.unit = item.unit;
				child.specifications = JSON.stringify(specifications);
				child.material_cost = r.message.final_cost;
				child.selling_price_per_unit = r.message.final_price;
				child.total_selling_amount = r.message.total_price;
				
				frm.refresh_field('custom_furniture_items');
				calculate_totals(frm);
				
				frappe.show_alert({
					message: __('Item added successfully'),
					indicator: 'green'
				});
				
				// Hide item details
				detailsContainer.hide();
			} else {
				frappe.msgprint(__('Error calculating price: ') + (r.message.error || 'Unknown error'));
			}
		}
	});
}

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
	let total_selling_price = 0;
	
	frm.doc.custom_furniture_items.forEach(function(item) {
		total_material_cost += (item.material_cost || 0) * (item.quantity || 0);
		total_labor_cost += (item.labor_cost || 0) * (item.quantity || 0);
		total_overhead_cost += (item.overhead_cost || 0) * (item.quantity || 0);
		total_selling_price += item.total_selling_amount || 0;
	});
	
	let total_cost = total_material_cost + total_labor_cost + total_overhead_cost;
	let total_profit = total_selling_price - total_cost;
	let profit_margin = total_cost > 0 ? (total_profit / total_cost) * 100 : 0;
	
	frm.set_value('total_material_cost', total_material_cost);
	frm.set_value('total_labor_cost', total_labor_cost);
	frm.set_value('total_overhead_cost', total_overhead_cost);
	frm.set_value('estimated_total_cost', total_cost);
	frm.set_value('estimated_selling_price', total_selling_price);
	frm.set_value('total_profit_amount', total_profit);
	frm.set_value('overall_profit_margin', profit_margin);
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

