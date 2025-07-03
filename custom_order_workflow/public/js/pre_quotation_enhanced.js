frappe.ui.form.on('Pre-Quotation', {
    refresh: function(frm) {
        // Initialize visual selector
        if (frm.doc.docstatus === 0) { // Only in draft mode
            frm.trigger('init_visual_selector');
        }
        
        // Add custom buttons
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
        
        // Set status color
        frm.trigger('set_status_color');
    },
    
    init_visual_selector: function(frm) {
        // Find the items table wrapper and add visual selector above it
        const itemsWrapper = frm.fields_dict.custom_furniture_items.wrapper;
        
        // Create visual selector container
        const visualContainer = document.createElement('div');
        visualContainer.id = 'visual-selector-container';
        
        // Insert before the items table
        itemsWrapper.parentNode.insertBefore(visualContainer, itemsWrapper);
        
        // Initialize visual selector
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
        let total_cost = 0;
        let total_selling = 0;
        
        frm.doc.custom_furniture_items.forEach(item => {
            total_cost += (item.estimated_cost || 0) * (item.quantity || 1);
            total_selling += (item.selling_price || 0) * (item.quantity || 1);
        });
        
        frm.set_value('estimated_total_cost', total_cost);
        frm.set_value('estimated_selling_price', total_selling);
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
                            frappe.msgprint(__('Items created successfully: ') + r.message.length + ' items');
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

// Child table events
frappe.ui.form.on('Pre-Quotation Item', {
    estimated_cost: function(frm, cdt, cdn) {
        frm.trigger('calculate_totals');
    },
    
    selling_price: function(frm, cdt, cdn) {
        frm.trigger('calculate_totals');
    },
    
    quantity: function(frm, cdt, cdn) {
        frm.trigger('calculate_totals');
    }
});

