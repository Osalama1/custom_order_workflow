// Enhanced Pre-Quotation client script with comprehensive pricing functionality

frappe.ui.form.on('Pre-Quotation', {
    refresh: function(frm) {
        // Initialize visual selector
        if (frm.doc.docstatus === 0) {
            frm.trigger('init_visual_selector');
        }
        
        // Add pricing action buttons
        frm.trigger('add_pricing_buttons');
        
        // Add workflow buttons
        frm.trigger('add_workflow_buttons');
        
        // Set status color
        frm.trigger('set_status_color');
        
        // Update pricing display
        frm.trigger('update_pricing_display');
    },
    
    add_pricing_buttons: function(frm) {
        if (frm.doc.docstatus === 0) {
            // Auto-estimate costing button
            frm.add_custom_button(__('Auto-Estimate Costing'), function() {
                frappe.call({
                    method: 'auto_estimate_costing',
                    doc: frm.doc,
                    callback: function(r) {
                        if (r.message && r.message.success) {
                            frappe.msgprint(__('Costing estimated successfully'));
                            frm.refresh();
                        }
                    }
                });
            }, __('Pricing'));
            
            // Bulk profit margin button
            frm.add_custom_button(__('Apply Bulk Profit Margin'), function() {
                frappe.prompt([
                    {
                        label: 'Profit Margin %',
                        fieldname: 'profit_margin',
                        fieldtype: 'Percent',
                        reqd: 1,
                        default: 25
                    }
                ], function(values) {
                    frm.call('apply_bulk_profit_margin', {
                        profit_margin_percent: values.profit_margin
                    }).then(() => {
                        frm.refresh();
                        frappe.msgprint(__('Profit margin applied to all items'));
                    });
                }, __('Set Profit Margin'));
            }, __('Pricing'));
            
            // Bulk costing button
            frm.add_custom_button(__('Apply Bulk Costing'), function() {
                frappe.prompt([
                    {
                        label: 'Material Rate',
                        fieldname: 'material_rate',
                        fieldtype: 'Currency'
                    },
                    {
                        label: 'Labor Rate',
                        fieldname: 'labor_rate',
                        fieldtype: 'Currency'
                    },
                    {
                        label: 'Overhead Rate',
                        fieldname: 'overhead_rate',
                        fieldtype: 'Currency'
                    }
                ], function(values) {
                    frm.call('apply_bulk_costing', values).then(() => {
                        frm.refresh();
                        frappe.msgprint(__('Bulk costing applied to all items'));
                    });
                }, __('Set Bulk Rates'));
            }, __('Pricing'));
            
            // Generate quotation preview
            frm.add_custom_button(__('Preview Quotation'), function() {
                frm.call('generate_quotation_preview').then(r => {
                    if (r.message) {
                        frm.trigger('show_quotation_preview', r.message);
                    }
                });
            }, __('Preview'));
        }
    },
    
    add_workflow_buttons: function(frm) {
        if (frm.doc.docstatus === 0) {
            frm.add_custom_button(__('Generate Items from Visual Selector'), function() {
                frm.trigger('generate_items_from_visual');
            });
            
            if (frm.doc.status === 'Draft') {
                frm.add_custom_button(__('Submit to Manufacturing'), function() {
                    frm.set_value('status', 'Submitted to Manufacturing');
                    frm.save();
                });
            }
        }
        
        if (frm.doc.status === 'Costing Done' && frm.doc.docstatus === 1) {
            frm.add_custom_button(__('Approve'), function() {
                frm.set_value('status', 'Approved Internally');
                frm.save();
            });
            
            frm.add_custom_button(__('Reject'), function() {
                frm.set_value('status', 'Rejected');
                frm.save();
            });
        }
        
        if (frm.doc.status === 'Approved Internally' && frm.doc.docstatus === 1) {
            frm.add_custom_button(__('Create Quotation'), function() {
                frm.trigger('create_quotation');
            }, __('Create'));
            
            frm.add_custom_button(__('Create Items'), function() {
                frm.trigger('create_items');
            }, __('Create'));
        }
    },
    
    init_visual_selector: function(frm) {
        // Find the items table wrapper and add visual selector above it
        const itemsWrapper = frm.fields_dict.custom_furniture_items.wrapper;
        
        // Create visual selector container
        let visualContainer = document.getElementById('visual-selector-container');
        if (!visualContainer) {
            visualContainer = document.createElement('div');
            visualContainer.id = 'visual-selector-container';
            
            // Insert before the items table
            itemsWrapper.parentNode.insertBefore(visualContainer, itemsWrapper);
        }
        
        // Initialize visual selector
        if (typeof VisualSelector !== 'undefined') {
            frm.visual_selector = new VisualSelector({
                container: visualContainer,
                frm: frm,
                fieldname: 'visual_items_data'
            });
            
            // Load existing data if available
            if (frm.doc.visual_items_data) {
                try {
                    const data = JSON.parse(frm.doc.visual_items_data);
                    frm.visual_selector.setData(data);
                } catch (e) {
                    console.error('Error parsing visual items data:', e);
                }
            }
        }
    },
    
    update_pricing_display: function(frm) {
        // Add pricing indicators to the dashboard
        if (frm.doc.estimated_total_cost && frm.doc.estimated_selling_price) {
            const profit = frm.doc.total_profit_amount || 0;
            const margin = frm.doc.overall_profit_margin || 0;
            
            frm.dashboard.add_indicator(
                __('Total Cost: {0}', [format_currency(frm.doc.estimated_total_cost)]),
                'blue'
            );
            
            frm.dashboard.add_indicator(
                __('Selling Price: {0}', [format_currency(frm.doc.estimated_selling_price)]),
                'green'
            );
            
            frm.dashboard.add_indicator(
                __('Profit: {0} ({1}%)', [format_currency(profit), margin.toFixed(1)]),
                profit > 0 ? 'green' : 'red'
            );
        }
    },
    
    show_quotation_preview: function(frm, preview_data) {
        // Create a dialog to show quotation preview
        const dialog = new frappe.ui.Dialog({
            title: __('Quotation Preview'),
            size: 'large',
            fields: [
                {
                    fieldtype: 'HTML',
                    fieldname: 'preview_html'
                }
            ]
        });
        
        // Generate preview HTML
        let html = `
            <div class="quotation-preview">
                <h3>Quotation for ${preview_data.customer}</h3>
                <p><strong>Date:</strong> ${preview_data.date}</p>
                <p><strong>Valid Until:</strong> ${preview_data.valid_until}</p>
                
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Description</th>
                            <th>Qty</th>
                            <th>UOM</th>
                            <th>Rate</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        preview_data.items.forEach(item => {
            html += `
                <tr>
                    <td>${item.item_name}</td>
                    <td>${item.description || ''}</td>
                    <td>${item.quantity}</td>
                    <td>${item.uom}</td>
                    <td>${format_currency(item.rate)}</td>
                    <td>${format_currency(item.amount)}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="5"><strong>Subtotal</strong></td>
                            <td><strong>${format_currency(preview_data.totals.subtotal)}</strong></td>
                        </tr>
                        <tr>
                            <td colspan="5"><strong>Tax</strong></td>
                            <td><strong>${format_currency(preview_data.totals.tax)}</strong></td>
                        </tr>
                        <tr>
                            <td colspan="5"><strong>Total</strong></td>
                            <td><strong>${format_currency(preview_data.totals.total)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
        
        dialog.fields_dict.preview_html.$wrapper.html(html);
        dialog.show();
    },
    
    visual_items_data: function(frm) {
        // Auto-generate items when visual data changes
        if (frm.doc.visual_items_data && frm.doc.docstatus === 0) {
            frm.trigger('generate_items_from_visual');
        }
    },
    
    generate_items_from_visual: function(frm) {
        if (!frm.doc.visual_items_data) {
            frappe.msgprint(__('No visual items data found. Please use the visual selector to add items.'));
            return;
        }
        
        try {
            const visualData = JSON.parse(frm.doc.visual_items_data);
            
            // Clear existing items
            frm.clear_table('custom_furniture_items');
            
            // Generate items from visual data
            visualData.forEach((visualItem, index) => {
                if (visualItem.subcategoryName) {
                    const item = frm.add_child('custom_furniture_items');
                    
                    // Basic item info
                    item.item_name = visualItem.subcategoryName;
                    item.description = frm.trigger('generate_description_from_specs', visualItem);
                    item.quantity = visualItem.quantity || 1;
                    item.uom = frm.trigger('convert_unit', visualItem.unit);
                    
                    // Specifications as JSON
                    item.specifications = JSON.stringify(visualItem.specs);
                    
                    // Notes
                    item.notes = visualItem.notes || '';
                    
                    // Generate item code
                    item.item_code = frm.trigger('generate_item_code', visualItem);
                }
            });
            
            frm.refresh_field('custom_furniture_items');
            frm.trigger('calculate_totals');
            
            frappe.msgprint(__('Items generated successfully from visual selector.'));
            
        } catch (e) {
            frappe.msgprint(__('Error processing visual items data: ') + e.message);
        }
    },
    
    generate_description_from_specs: function(frm, visualItem) {
        let description = visualItem.subcategoryName || 'Custom Item';
        
        if (visualItem.specs && Object.keys(visualItem.specs).length > 0) {
            const specs = Object.entries(visualItem.specs)
                .filter(([key, value]) => value)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
            
            if (specs) {
                description += ` (${specs})`;
            }
        }
        
        if (visualItem.notes) {
            description += ` - ${visualItem.notes}`;
        }
        
        return description;
    },
    
    convert_unit: function(frm, visualUnit) {
        const unitMap = {
            'pcs': 'Nos',
            'sqm': 'Sq Meter',
            'lm': 'Meter',
            'hours': 'Hour',
            'days': 'Day'
        };
        
        return unitMap[visualUnit] || 'Nos';
    },
    
    generate_item_code: function(frm, visualItem) {
        let code = '';
        
        if (visualItem.category) {
            code += visualItem.category.substring(0, 3).toUpperCase();
        }
        
        if (visualItem.subcategory) {
            code += '-' + visualItem.subcategory.substring(0, 3).toUpperCase();
        }
        
        // Add some specs for uniqueness
        if (visualItem.specs) {
            if (visualItem.specs.material) {
                code += '-' + visualItem.specs.material.substring(0, 3).toUpperCase();
            }
            if (visualItem.specs.length && visualItem.specs.width) {
                code += '-' + visualItem.specs.length + 'x' + visualItem.specs.width;
            }
        }
        
        // Add timestamp for uniqueness
        code += '-' + Date.now().toString().slice(-4);
        
        return code;
    },
    
    calculate_totals: function(frm) {
        // This will be handled by the server-side calculate_totals method
        // Just trigger a save to recalculate
        frm.save();
    },
    
    create_quotation: function(frm) {
        frappe.confirm(
            __('This will create a standard ERPNext Quotation and Items. Continue?'),
            function() {
                frappe.call({
                    method: 'custom_order_workflow.api.create_quotation_from_pre_quotation',
                    args: {
                        pre_quotation: frm.doc.name
                    },
                    callback: function(r) {
                        if (r.message) {
                            frappe.msgprint(__('Quotation created: ') + r.message);
                            frappe.set_route('Form', 'Quotation', r.message);
                        }
                    }
                });
            }
        );
    },
    
    create_items: function(frm) {
        frappe.confirm(
            __('This will create Items in ERPNext inventory. Continue?'),
            function() {
                frappe.call({
                    method: 'custom_order_workflow.api.create_items_from_pre_quotation',
                    args: {
                        pre_quotation: frm.doc.name
                    },
                    callback: function(r) {
                        if (r.message) {
                            frappe.msgprint(__('Items created successfully: ') + Object.keys(r.message).length + ' items');
                        }
                    }
                });
            }
        );
    },
    
    set_status_color: function(frm) {
        const status_colors = {
            'Draft': 'gray',
            'Submitted to Manufacturing': 'blue',
            'Costing Done': 'orange',
            'Approved Internally': 'green',
            'Rejected': 'red'
        };
        
        if (frm.doc.status && status_colors[frm.doc.status]) {
            frm.dashboard.set_headline_alert(
                `<div class="indicator ${status_colors[frm.doc.status]}">${frm.doc.status}</div>`
            );
        }
    }
});

// Child table events for automatic calculations
frappe.ui.form.on('Pre-Quotation Item', {
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
        calculate_item_totals(frm, cdt, cdn);
    },
    
    selling_price: function(frm, cdt, cdn) {
        calculate_item_totals(frm, cdt, cdn);
    },
    
    quantity: function(frm, cdt, cdn) {
        calculate_item_totals(frm, cdt, cdn);
    }
});

function calculate_item_totals(frm, cdt, cdn) {
    const item = locals[cdt][cdn];
    
    // Calculate total cost
    const material_cost = flt(item.material_cost, 2);
    const labor_cost = flt(item.labor_cost, 2);
    const overhead_cost = flt(item.overhead_cost, 2);
    
    item.total_cost = material_cost + labor_cost + overhead_cost;
    
    // Calculate selling price from profit margin if not manually set
    if (item.profit_margin_percent && !item.selling_price) {
        const profit_multiplier = 1 + (flt(item.profit_margin_percent) / 100);
        item.selling_price = flt(item.total_cost * profit_multiplier, 2);
    }
    
    // Calculate profit margin if selling price is set but margin is not
    else if (item.selling_price && !item.profit_margin_percent && item.total_cost > 0) {
        const profit_amount = flt(item.selling_price) - flt(item.total_cost);
        item.profit_margin_percent = flt((profit_amount / item.total_cost) * 100, 2);
    }
    
    // Calculate totals
    const quantity = flt(item.quantity, 2);
    const selling_price = flt(item.selling_price, 2);
    const total_cost = flt(item.total_cost, 2);
    
    item.total_selling_amount = quantity * selling_price;
    item.profit_amount = quantity * (selling_price - total_cost);
    
    // Refresh the field
    frm.refresh_field('custom_furniture_items');
    
    // Trigger document-level calculation
    setTimeout(() => {
        frm.trigger('calculate_totals');
    }, 100);
}

