// Sales Dashboard Enhancements
frappe.provide('custom_order_workflow.sales_dashboard');

custom_order_workflow.sales_dashboard = {
    init: function() {
        this.setup_dashboard_widgets();
        this.setup_quick_actions();
        this.setup_status_filters();
    },
    
    setup_dashboard_widgets: function() {
        // Add custom widgets to the sales workspace
        if (frappe.workspace && frappe.workspace.name === 'Sales Workspace') {
            this.add_pre_quotation_stats();
            this.add_conversion_metrics();
        }
    },
    
    add_pre_quotation_stats: function() {
        frappe.call({
            method: 'custom_order_workflow.api.get_pre_quotation_stats',
            callback: function(r) {
                if (r.message) {
                    const stats = r.message;
                    
                    // Create stats cards
                    const stats_html = `
                        <div class="row">
                            <div class="col-sm-3">
                                <div class="card bg-primary text-white">
                                    <div class="card-body">
                                        <h5 class="card-title">${stats.total_pre_quotations}</h5>
                                        <p class="card-text">Total Pre-Quotations</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-sm-3">
                                <div class="card bg-warning text-white">
                                    <div class="card-body">
                                        <h5 class="card-title">${stats.pending_costing}</h5>
                                        <p class="card-text">Pending Costing</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-sm-3">
                                <div class="card bg-success text-white">
                                    <div class="card-body">
                                        <h5 class="card-title">${stats.approved}</h5>
                                        <p class="card-text">Approved</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-sm-3">
                                <div class="card bg-info text-white">
                                    <div class="card-body">
                                        <h5 class="card-title">${format_currency(stats.total_value)}</h5>
                                        <p class="card-text">Total Value</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    // Add to workspace
                    $('.workspace-body').prepend(stats_html);
                }
            }
        });
    },
    
    add_conversion_metrics: function() {
        frappe.call({
            method: 'custom_order_workflow.api.get_conversion_metrics',
            callback: function(r) {
                if (r.message) {
                    const metrics = r.message;
                    
                    // Create conversion chart
                    const chart_html = `
                        <div class="card mt-4">
                            <div class="card-header">
                                <h6>Pre-Quotation Conversion Funnel</h6>
                            </div>
                            <div class="card-body">
                                <canvas id="conversion-chart" width="400" height="200"></canvas>
                            </div>
                        </div>
                    `;
                    
                    $('.workspace-body').append(chart_html);
                    
                    // Initialize chart
                    this.render_conversion_chart(metrics);
                }
            }.bind(this)
        });
    },
    
    render_conversion_chart: function(metrics) {
        const ctx = document.getElementById('conversion-chart').getContext('2d');
        
        new Chart(ctx, {
            type: 'funnel',
            data: {
                labels: ['Draft', 'Submitted', 'Costed', 'Approved', 'Quotation Created'],
                datasets: [{
                    data: [
                        metrics.draft,
                        metrics.submitted,
                        metrics.costed,
                        metrics.approved,
                        metrics.quotation_created
                    ],
                    backgroundColor: [
                        '#007bff',
                        '#ffc107',
                        '#6f42c1',
                        '#28a745',
                        '#17a2b8'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed;
                            }
                        }
                    }
                }
            }
        });
    },
    
    setup_quick_actions: function() {
        // Add quick action buttons to the workspace
        const quick_actions_html = `
            <div class="quick-actions-panel mt-3">
                <h6>Quick Actions</h6>
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-custom-primary" onclick="custom_order_workflow.sales_dashboard.new_pre_quotation()">
                        <i class="fa fa-plus"></i> New Pre-Quotation
                    </button>
                    <button type="button" class="btn btn-custom-secondary" onclick="custom_order_workflow.sales_dashboard.view_pending()">
                        <i class="fa fa-clock-o"></i> View Pending
                    </button>
                    <button type="button" class="btn btn-custom-secondary" onclick="custom_order_workflow.sales_dashboard.view_reports()">
                        <i class="fa fa-bar-chart"></i> Reports
                    </button>
                </div>
            </div>
        `;
        
        $('.workspace-body').append(quick_actions_html);
    },
    
    setup_status_filters: function() {
        // Add status filter buttons
        const filter_html = `
            <div class="status-filters mt-3">
                <h6>Filter by Status</h6>
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-outline-primary active" data-status="all">All</button>
                    <button type="button" class="btn btn-outline-primary" data-status="Draft">Draft</button>
                    <button type="button" class="btn btn-outline-warning" data-status="Submitted to Manufacturing">Pending</button>
                    <button type="button" class="btn btn-outline-success" data-status="Approved Internally">Approved</button>
                </div>
            </div>
        `;
        
        $('.workspace-body').append(filter_html);
        
        // Add click handlers
        $('.status-filters .btn').click(function() {
            $('.status-filters .btn').removeClass('active');
            $(this).addClass('active');
            
            const status = $(this).data('status');
            custom_order_workflow.sales_dashboard.filter_by_status(status);
        });
    },
    
    new_pre_quotation: function() {
        frappe.new_doc('Pre-Quotation');
    },
    
    view_pending: function() {
        frappe.set_route('List', 'Pre-Quotation', {status: 'Submitted to Manufacturing'});
    },
    
    view_reports: function() {
        frappe.set_route('query-report', 'Pre-Quotation Summary');
    },
    
    filter_by_status: function(status) {
        if (status === 'all') {
            frappe.set_route('List', 'Pre-Quotation');
        } else {
            frappe.set_route('List', 'Pre-Quotation', {status: status});
        }
    }
};

// Initialize dashboard when workspace loads
$(document).ready(function() {
    if (window.location.pathname.includes('app/sales-workspace')) {
        setTimeout(function() {
            custom_order_workflow.sales_dashboard.init();
        }, 1000);
    }
});

// Helper function for currency formatting
function format_currency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0);
}

