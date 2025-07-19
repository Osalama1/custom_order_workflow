from . import __version__ as app_version

app_name = "custom_order_workflow"
app_title = "Custom Order Workflow"
app_publisher = "Manus AI"
app_description = "Custom order workflow for furniture manufacturing with visual selector"
app_email = "support@manus.ai"
app_license = "MIT"

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/custom_order_workflow/css/custom_order_workflow.css"
# app_include_js = "/assets/custom_order_workflow/js/custom_order_workflow.js"

# include js, css files in header of web template
# web_include_css = "/assets/custom_order_workflow/css/custom_order_workflow.css"
# web_include_js = "/assets/custom_order_workflow/js/custom_order_workflow.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "custom_order_workflow/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views - CLEANED UP, JS files are now in DocType folders
# doctype_js = {}
# doctype_listview_js = {}
# doctype_tree_js = {}
# doctype_calendar_js = {}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
#	"methods": "custom_order_workflow.utils.jinja_methods",
#	"filters": "custom_order_workflow.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "custom_order_workflow.install.before_install"
# after_install = "custom_order_workflow.install.after_install"

# Uninstallation
# ---------------

# before_uninstall = "custom_order_workflow.uninstall.before_uninstall"
# after_uninstall = "custom_order_workflow.uninstall.after_uninstall"

# Desk Notifications
# -------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "custom_order_workflow.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
#	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
#	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
#	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
#	"*": {
#		"on_update": "method",
#		"on_cancel": "method",
#		"on_trash": "method"
#	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
#	"all": [
#		"custom_order_workflow.tasks.all"
#	],
#	"daily": [
#		"custom_order_workflow.tasks.daily"
#	],
#	"hourly": [
#		"custom_order_workflow.tasks.hourly"
#	],
#	"weekly": [
#		"custom_order_workflow.tasks.weekly"
#	],
#	"monthly": [
#		"custom_order_workflow.tasks.monthly"
#	],
# }

# Testing
# -------

# before_tests = "custom_order_workflow.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
#	"frappe.desk.doctype.event.event.get_events": "custom_order_workflow.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
#	"Task": "custom_order_workflow.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["custom_order_workflow.utils.before_request"]
# after_request = ["custom_order_workflow.utils.after_request"]

# Job Events
# ----------
# before_job = ["custom_order_workflow.utils.before_job"]
# after_job = ["custom_order_workflow.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
#	{
#		"doctype": "{doctype_1}",
#		"filter_by": "{filter_by}",
#		"redact_fields": ["{field_1}", "{field_2}"],
#		"partial": 1,
#	},
#	{
#		"doctype": "{doctype_2}",
#		"filter_by": "{filter_by}",
#		"strict": False,
#	},
#	{
#		"doctype": "{doctype_3}",
#		"filter_by": "{filter_by}",
#		"partial": 1,
#	},
#	{
#		"doctype": "{doctype_4}",
#		"filter_by": "{filter_by}",
#		"redact_fields": ["{field_1}", "{field_2}"],
#		"partial": 1,
#	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
#	"custom_order_workflow.auth.validate"
# ]
fixtures = [
    {
        "doctype": "Workflow",
        "filters": {
            "name": ["in", ["Pre-Quotation Workflow"]]
        }
    },
    {
        "doctype": "Workflow State",
        "filters": {
            "name": ["in", [
                "Draft",
                "Submitted to Manufacturing",
                "Costing Done",
                "Approved Internally",
                "Converted to Quotation",
                "Rejected",
                "Cancelled"
            ]]
        }
    },
    {
        "doctype": "Workflow Action Master",
        "filters": {
            "name": ["in", [
                "Submit to Manufacturing",
                "Complete Costing",
                "Reject",
                "Approve Internally",
                "Convert to Quotation",
                "Cancel"
            ]]
        }
    },
   {
        "doctype": "Custom Field",
        "filters": {
            "dt": ["=", "Pre-Quotation"]
        }
    },
    {
        "doctype": "Custom DocPerm",
        "filters": {
            "parent": ["=", "Pre-Quotation"]
        }
    }
]


doctype_js = {
    "Lead": "public/js/lead.js",
    "Customer": "public/js/customer.js"
}

