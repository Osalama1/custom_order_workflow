# User Manual - Custom Order Workflow

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Sales User Guide](#sales-user-guide)
4. [Manufacturing User Guide](#manufacturing-user-guide)
5. [Sales Manager Guide](#sales-manager-guide)
6. [Reports and Analytics](#reports-and-analytics)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Introduction

The Custom Order Workflow system is designed to streamline the process of handling custom furniture orders from initial customer inquiry to final sales order. This manual provides comprehensive guidance for all user types in the system.

### System Overview

The workflow consists of five main stages:

1. **Lead Creation** - Initial customer contact
2. **Pre-Quotation** - Detailed specification capture
3. **Manufacturing Costing** - Cost estimation process
4. **Internal Approval** - Management review
5. **Quotation Generation** - Customer-facing quotation

### User Roles

- **Sales User**: Creates and manages pre-quotations
- **Manufacturing User**: Provides cost estimates
- **Sales Manager**: Approves and generates quotations

## Getting Started

### Logging In

1. Open your web browser
2. Navigate to your ERPNext URL
3. Enter your username and password
4. Click "Login"

### Accessing the Sales Workspace

1. From the main dashboard, click on "Sales Workspace"
2. Or use the search bar and type "Sales Workspace"

### Navigation Overview

The Sales Workspace provides quick access to:
- New Pre-Quotation creation
- Pre-quotation lists filtered by status
- Reports and analytics
- Standard sales documents

## Sales User Guide

### Creating a New Pre-Quotation

#### Step 1: Basic Information

1. Click **"New Pre-Quotation"** from the Sales Workspace
2. Fill in the basic details:
   - **Lead**: Link to existing lead (optional)
   - **Customer**: Select or create customer
   - **Contact Person**: Primary contact name
   - **Contact Email**: Contact email address
   - **Pre-Quotation Date**: Automatically set to today
   - **Valid Until**: Set expiration date (optional)

#### Step 2: Customer Requirements

1. In the **"Customer Requirements"** section:
   - **Notes**: Add general requirements or special instructions
   - Include any specific customer preferences
   - Note delivery requirements or timelines

#### Step 3: Adding Furniture Items

1. In the **"Custom Furniture Items"** section:
   - Click **"Add Row"** to add new item
   - **Item Name**: Descriptive name (e.g., "Executive Desk", "Conference Chair")
   - **Item Type**: Select Table, Chair, Cabinet, or Other
   - **Quantity**: Number of units required
   - **Description**: Detailed description of the item

#### Step 4: Table Specifications

For items with type "Table":

1. Click on the item row to expand specifications
2. In **"Table Specifications"** section, add:
   - **Length (cm)**: Table length
   - **Width (cm)**: Table width  
   - **Height (cm)**: Table height
   - **Top Material**: Wood type, laminate, glass, etc.
   - **Top Finish**: Matte, gloss, veneer, etc.
   - **Legs/Base Material**: Steel, wood, etc.
   - **Color**: Primary color
   - **Special Features**: Cable management, adjustable height, etc.

#### Step 5: Chair Specifications

For items with type "Chair":

1. In **"Chair Specifications"** section, add:
   - **Chair Model/Style**: Base model or style
   - **Upholstery Material**: Leather, fabric, mesh, etc.
   - **Color**: Chair color
   - **Armrests**: Fixed, Adjustable, or None
   - **Base Type**: Caster, Sled, or Swivel
   - **Special Features**: Lumbar support, headrest, reclining, etc.

#### Step 6: Saving and Submitting

1. Click **"Save"** to save as draft
2. Review all information for accuracy
3. When ready, change status to **"Submit to Manufacturing"**
4. Click **"Save"** to submit

### Managing Your Pre-Quotations

#### Viewing Your Pre-Quotations

1. From Sales Workspace, click **"My Pre-Quotations"**
2. Use filters to find specific pre-quotations:
   - Filter by status
   - Filter by customer
   - Filter by date range

#### Tracking Status

Monitor your pre-quotations through different stages:

- **Draft**: Still being prepared
- **Submitted to Manufacturing**: Awaiting cost estimates
- **Costing Done**: Manufacturing has provided costs
- **Approved Internally**: Ready for quotation generation
- **Rejected**: Not approved for further processing

#### Following Up

1. Check **"Pending Costing"** regularly
2. Contact manufacturing team if delays occur
3. Review approved pre-quotations for quotation generation

### Best Practices for Sales Users

#### Specification Guidelines

1. **Be Detailed**: Provide comprehensive specifications
2. **Use Standard Terms**: Use consistent terminology
3. **Include Dimensions**: Always specify exact measurements
4. **Note Special Requirements**: Highlight any unique features
5. **Customer Preferences**: Document specific customer requests

#### Communication Tips

1. **Clear Descriptions**: Write clear, concise item descriptions
2. **Customer Language**: Use terms customers understand
3. **Visual References**: Mention style references when possible
4. **Timeline Expectations**: Set realistic delivery expectations

## Manufacturing User Guide

### Accessing Pre-Quotations for Costing

1. Navigate to **"Pre-Quotation"** list
2. Filter by status: **"Submitted to Manufacturing"**
3. Open pre-quotations assigned to you

### Reviewing Specifications

#### Understanding Requirements

1. Read customer notes carefully
2. Review each item's specifications
3. Check for any unclear requirements
4. Contact sales team if clarification needed

#### Analyzing Complexity

Consider factors affecting cost:
- Custom dimensions vs. standard sizes
- Special materials or finishes
- Complex features or mechanisms
- Quantity discounts or setup costs

### Providing Cost Estimates

#### Step 1: Calculate Material Costs

1. Review specifications for each item
2. Calculate material requirements:
   - Wood, metal, fabric quantities
   - Hardware and mechanisms
   - Finishing materials

#### Step 2: Estimate Labor Costs

Consider:
- Design and engineering time
- Manufacturing time
- Assembly complexity
- Quality control requirements

#### Step 3: Add Overhead and Margin

Include:
- Factory overhead
- Equipment usage
- Quality assurance
- Contingency for custom work

#### Step 4: Enter Estimates

1. For each item, enter **"Estimated Unit Cost"**
2. The system automatically calculates total cost
3. Add notes explaining cost factors if needed
4. Change status to **"Costing Done"**
5. Save the document

### Cost Estimation Guidelines

#### Standard Costing Factors

| Component | Typical % of Total |
|-----------|-------------------|
| Materials | 40-50% |
| Labor | 25-35% |
| Overhead | 15-20% |
| Margin | 10-15% |

#### Custom Work Multipliers

- Simple customization: 1.2x standard cost
- Moderate customization: 1.5x standard cost
- Complex customization: 2.0x+ standard cost

### Quality Assurance

1. **Double-check calculations**
2. **Verify material availability**
3. **Consider lead times**
4. **Review with supervisor if needed**

## Sales Manager Guide

### Reviewing Costed Pre-Quotations

#### Accessing Pending Approvals

1. Navigate to pre-quotations with status **"Costing Done"**
2. Review manufacturing cost estimates
3. Evaluate pricing strategy

#### Cost Review Process

1. **Verify Reasonableness**: Check if costs align with expectations
2. **Market Comparison**: Compare with similar projects
3. **Margin Analysis**: Ensure adequate profit margins
4. **Customer Budget**: Consider customer's budget constraints

### Setting Selling Prices

#### Pricing Strategy

1. Open the costed pre-quotation
2. Review **"Estimated Total Cost"**
3. Set **"Estimated Selling Price"** based on:
   - Desired margin percentage
   - Market conditions
   - Customer relationship
   - Competition analysis

#### Margin Calculations

```
Margin % = (Selling Price - Cost) / Selling Price × 100
```

Typical margins for custom furniture:
- Standard items: 40-50%
- Custom items: 50-70%
- Complex custom: 70%+

### Approval Process

#### Internal Approval

1. Review all aspects of the pre-quotation
2. Verify cost estimates are reasonable
3. Confirm selling price strategy
4. Change status to **"Approved Internally"**
5. Save the document

#### Generating Quotations

1. Open approved pre-quotation
2. Click **"Create Quotation"** button
3. Review generated quotation:
   - Verify customer details
   - Check item descriptions
   - Confirm pricing
   - Review terms and conditions
4. Modify if necessary
5. Save and send to customer

### Managing the Sales Pipeline

#### Pipeline Overview

Monitor conversion rates:
- Pre-quotations created
- Successfully costed
- Internally approved
- Quotations generated
- Orders received

#### Performance Metrics

Track key metrics:
- Conversion rate (orders/pre-quotations)
- Average order value
- Time to quotation
- Customer response rate

## Reports and Analytics

### Pre-Quotation Summary Report

#### Accessing the Report

1. Go to **"Reports"** in Sales Workspace
2. Click **"Pre-Quotation Summary"**

#### Available Filters

- Date range
- Customer
- Status
- Owner (sales person)

#### Key Metrics Displayed

- Pre-quotation count by status
- Total estimated values
- Average processing time
- Conversion rates

### Dashboard Analytics

#### Sales Dashboard Widgets

The Sales Workspace includes:
- **Total Pre-Quotations**: Current count
- **Pending Costing**: Items awaiting estimates
- **Approved**: Ready for quotation
- **Total Value**: Pipeline value

#### Conversion Funnel

Visual representation of:
- Draft pre-quotations
- Submitted for costing
- Costed items
- Approved items
- Generated quotations

### Custom Reports

#### Creating Custom Reports

1. Go to **"Setup > Report"**
2. Create new Script Report
3. Define filters and columns
4. Add to workspace

#### Useful Custom Reports

- **Sales Performance by User**
- **Manufacturing Efficiency**
- **Customer Analysis**
- **Product Category Performance**

## Best Practices

### For All Users

#### Data Quality

1. **Consistent Naming**: Use standard naming conventions
2. **Complete Information**: Fill all relevant fields
3. **Regular Updates**: Keep status current
4. **Clear Communication**: Use notes for important information

#### Workflow Efficiency

1. **Timely Processing**: Handle items promptly
2. **Clear Handoffs**: Ensure smooth transitions between stages
3. **Follow-up**: Monitor progress regularly
4. **Documentation**: Keep detailed records

### Sales Team Best Practices

#### Customer Interaction

1. **Set Expectations**: Explain the process to customers
2. **Regular Updates**: Keep customers informed of progress
3. **Detailed Specifications**: Capture complete requirements
4. **Visual Aids**: Use sketches or references when helpful

#### Internal Coordination

1. **Clear Handoffs**: Provide complete information to manufacturing
2. **Urgent Items**: Flag time-sensitive requests
3. **Follow-up**: Check on pending items regularly
4. **Feedback**: Share customer feedback with team

### Manufacturing Team Best Practices

#### Cost Estimation

1. **Detailed Analysis**: Consider all cost factors
2. **Documentation**: Explain cost assumptions
3. **Consistency**: Use standard costing methods
4. **Accuracy**: Double-check calculations

#### Communication

1. **Timely Response**: Provide estimates promptly
2. **Clear Notes**: Explain any cost drivers
3. **Questions**: Ask for clarification when needed
4. **Alternatives**: Suggest cost-saving options

### Management Best Practices

#### Process Oversight

1. **Regular Reviews**: Monitor workflow performance
2. **Bottleneck Identification**: Address delays quickly
3. **Quality Control**: Ensure accuracy at each stage
4. **Continuous Improvement**: Refine processes based on feedback

#### Strategic Analysis

1. **Conversion Tracking**: Monitor success rates
2. **Profitability Analysis**: Review margin performance
3. **Market Trends**: Analyze customer preferences
4. **Competitive Positioning**: Benchmark against competitors

## Troubleshooting

### Common Issues and Solutions

#### Cannot Create Pre-Quotation

**Problem**: Error when trying to create new pre-quotation

**Solutions**:
1. Check user permissions
2. Verify customer exists and is active
3. Ensure all required fields are filled
4. Contact system administrator

#### Email Notifications Not Received

**Problem**: Not receiving workflow notifications

**Solutions**:
1. Check email settings in user profile
2. Verify email address is correct
3. Check spam/junk folder
4. Contact IT support for email configuration

#### Cannot Change Status

**Problem**: Status dropdown is disabled or missing options

**Solutions**:
1. Verify user role permissions
2. Check current document status
3. Ensure document is saved
4. Review workflow configuration

#### Specifications Not Saving

**Problem**: Item specifications are not being saved

**Solutions**:
1. Ensure item type is selected correctly
2. Fill required specification fields
3. Save item row before saving document
4. Check for validation errors

#### Cost Calculations Incorrect

**Problem**: Total costs not calculating properly

**Solutions**:
1. Verify unit costs are entered correctly
2. Check quantity values
3. Refresh the form
4. Recalculate manually if needed

### Getting Additional Help

#### Internal Support

1. **User Manual**: Reference this document
2. **Training Materials**: Review training videos
3. **Colleagues**: Ask experienced users
4. **Supervisor**: Escalate complex issues

#### Technical Support

1. **System Administrator**: For technical issues
2. **ERPNext Community**: For general ERPNext questions
3. **Documentation**: ERPNext user manual
4. **Professional Support**: For customization needs

---

**User Manual Version:** 1.0  
**Last Updated:** January 2024  
**For:** Custom Order Workflow v0.0.1



## Enhanced Pricing Management

### Understanding the Pricing System

The enhanced Custom Order Workflow includes a comprehensive pricing management system that provides complete visibility into cost components and profit calculations. This system is designed to help manufacturing teams accurately estimate costs while enabling sales teams to optimize pricing for maximum profitability.

#### Cost Breakdown Structure

Every item in a Pre-Quotation includes detailed cost breakdown across three main categories:

**Material Costs**: This represents the raw materials required to manufacture the item. The system considers material type, quantity, waste factors, and current market prices. For example, a wooden executive desk might include costs for wood panels, hardware, finishes, and adhesives.

**Labor Costs**: This encompasses all human resources required for manufacturing. The system calculates labor based on complexity, skill requirements, and estimated production time. Factors such as assembly complexity, finishing requirements, and quality control are automatically considered.

**Overhead Costs**: This includes facility costs, equipment depreciation, utilities, and administrative expenses allocated to each item. The system typically calculates overhead as a percentage of material and labor costs, with default rates that can be customized per company.

#### Automatic Calculations

The pricing system performs real-time calculations as you enter cost information:

**Total Cost Calculation**: The system automatically sums material, labor, and overhead costs to provide the total manufacturing cost per unit. This calculation updates instantly as you modify any cost component.

**Profit Margin Management**: You can set profit margins either as a percentage or by directly entering the desired selling price. The system automatically calculates the corresponding values and updates profit amounts in real-time.

**Quantity Calculations**: All pricing calculations automatically consider quantities, providing total costs, total selling amounts, and total profit for each line item.

### Using the Visual Selector

The visual selector revolutionizes how sales teams capture customer requirements by replacing complex forms with an intuitive point-and-click interface.

#### Getting Started with Visual Selection

When creating a new Pre-Quotation, the visual selector appears above the traditional items table. This interface guides you through a step-by-step process to capture all necessary specifications without requiring technical knowledge.

**Step 1: Category Selection**: Begin by clicking on the appropriate furniture category. The system displays visual representations of different furniture types including desks, chairs, cabinets, and specialized items. Each category is represented by clear, professional images that make selection intuitive.

**Step 2: Subcategory Refinement**: After selecting a category, choose the specific type of furniture. For example, if you selected "Desks," you might choose from Executive Desk, Conference Table, Workstation, or Reception Desk. Each subcategory includes typical specifications and standard dimensions.

**Step 3: Specification Entry**: The system presents a dynamic form tailored to your selected furniture type. For a desk, you might specify dimensions, material type, finish, special features, and hardware requirements. The form adapts based on your selections, showing only relevant options.

**Step 4: Quantity and Units**: Specify the quantity required and select the appropriate unit of measurement. The system supports various units including pieces, square meters, linear meters, hours, and days, depending on the item type.

**Step 5: Additional Notes**: Add any special requirements, customer preferences, or manufacturing notes that don't fit into the standard specification fields.

#### Advanced Visual Selector Features

**Template Application**: For common furniture types, you can apply pre-configured templates that automatically populate standard specifications. This feature dramatically speeds up data entry for frequently ordered items.

**Copy and Modify**: When adding multiple similar items, use the copy function to duplicate an existing item and modify only the differences. This is particularly useful for furniture sets or variations of the same basic design.

**Real-Time Preview**: As you make selections, the system provides a real-time preview of the item specifications and estimated pricing. This immediate feedback helps ensure accuracy and completeness.

**Mobile Optimization**: The visual selector works seamlessly on tablets and smartphones, allowing sales teams to capture requirements during customer meetings or site visits.

### Pricing Operations and Management

#### Individual Item Pricing

For each item in your Pre-Quotation, you can manage pricing at a granular level:

**Cost Entry**: Enter material, labor, and overhead costs based on manufacturing estimates. The system provides guidance and default values based on item specifications, but you can override these with actual quotes from suppliers or more detailed manufacturing analysis.

**Profit Margin Setting**: Set profit margins either as a percentage of cost or by entering the desired selling price directly. The system automatically calculates the corresponding values and shows the profit amount per unit and total profit for the quantity ordered.

**Bulk Operations**: When working with multiple items, you can apply pricing changes across all items simultaneously. This is useful when applying company-wide margin policies or adjusting for market conditions.

#### Document-Level Pricing Summary

The Pre-Quotation provides comprehensive pricing summaries that aggregate all item-level calculations:

**Total Cost Summary**: View total material costs, labor costs, overhead costs, and overall project cost. This summary helps manufacturing teams understand resource requirements and production planning.

**Selling Price Summary**: See total selling prices, total profit amounts, and overall profit margins for the entire project. This information is crucial for sales management and pricing approval processes.

**Profitability Analysis**: The system calculates overall profit margins and provides visual indicators for profitability levels. This helps ensure that quotations meet company profitability targets.

### Manufacturing Costing Workflow

#### Cost Estimation Process

When a Pre-Quotation moves to the "Submitted to Manufacturing" status, manufacturing teams receive notifications to begin detailed cost estimation:

**Specification Review**: Manufacturing teams review all specifications captured through the visual selector, ensuring they have complete information for accurate costing.

**Material Sourcing**: Teams can research current material costs, considering factors such as quality grades, supplier availability, and bulk purchase opportunities.

**Production Planning**: Estimate production time, equipment requirements, and labor allocation based on current capacity and scheduling.

**Quality Requirements**: Consider any special quality requirements, testing needs, or certification requirements that might affect costs.

#### Cost Entry and Validation

Manufacturing teams enter detailed cost information using the enhanced pricing interface:

**Material Cost Breakdown**: Enter costs for all materials required, including primary materials, hardware, finishes, and consumables. The system can store supplier information and track cost variations over time.

**Labor Time Estimation**: Calculate labor requirements based on production complexity, skill requirements, and current labor rates. Consider factors such as setup time, production time, finishing time, and quality control.

**Overhead Allocation**: Apply appropriate overhead rates based on company policies and current facility utilization. The system can automatically calculate overhead based on configurable percentages or allow manual entry for special circumstances.

**Cost Validation**: Review all cost components for accuracy and completeness. The system provides validation checks to ensure no critical cost elements are missed.

### Sales Team Pricing Tools

#### Quotation Preview and Generation

Before finalizing a Pre-Quotation, sales teams can generate professional quotation previews:

**Preview Generation**: The system creates a formatted quotation preview showing how the final quotation will appear to customers. This includes item descriptions, quantities, pricing, and terms.

**Pricing Validation**: Review all pricing components to ensure accuracy and competitiveness. The system can provide alerts if margins fall below company thresholds or if pricing appears inconsistent with market standards.

**Customer Communication**: Use the preview to discuss pricing with customers, making adjustments as needed before final approval.

#### Pricing Optimization Tools

The system includes several tools to help optimize pricing for maximum profitability:

**Margin Analysis**: Compare profit margins across different items and identify opportunities for optimization. The system can highlight items with unusually high or low margins for review.

**Competitive Pricing**: While not directly integrated with external pricing databases, the system provides frameworks for incorporating competitive analysis into pricing decisions.

**Volume Discounting**: Calculate and apply volume discounts based on quantity thresholds or total project value. The system can automatically adjust pricing based on configurable discount schedules.

**Currency Management**: For international customers, the system can handle multiple currencies and exchange rate considerations, though specific currency conversion features may require additional configuration.

### Advanced Pricing Features

#### Bulk Pricing Operations

When managing large quotations with many items, bulk operations significantly improve efficiency:

**Bulk Margin Application**: Apply the same profit margin percentage across all items in a quotation. This is useful when company policy requires consistent margins or when adjusting for market conditions.

**Bulk Cost Adjustments**: Apply percentage increases or decreases to material, labor, or overhead costs across multiple items. This helps when supplier costs change or when adjusting for inflation.

**Selective Bulk Operations**: Apply bulk changes to only selected items rather than all items in a quotation. This provides flexibility when different item categories require different treatment.

#### Cost Estimation Automation

The system includes intelligent cost estimation capabilities:

**Specification-Based Estimation**: The system can automatically estimate costs based on item specifications such as dimensions, materials, and complexity. These estimates serve as starting points for more detailed cost analysis.

**Historical Cost Analysis**: When available, the system can reference historical cost data for similar items to provide more accurate initial estimates.

**Supplier Integration**: With proper configuration, the system can integrate with supplier databases to obtain current material pricing automatically.

### Reporting and Analytics

#### Pricing Performance Reports

The enhanced system provides comprehensive reporting capabilities for pricing analysis:

**Margin Analysis Reports**: Track profit margins across different time periods, customers, item types, and sales representatives. Identify trends and opportunities for improvement.

**Cost Variance Reports**: Compare estimated costs with actual costs when available, helping improve future cost estimation accuracy.

**Pricing Trend Analysis**: Monitor how pricing changes over time, helping identify market trends and competitive positioning.

#### Conversion Tracking

Monitor how pricing affects conversion rates:

**Quote-to-Order Conversion**: Track which quotations convert to orders and analyze pricing factors that influence conversion rates.

**Competitive Analysis**: When quotations are lost to competitors, track pricing factors to improve future competitiveness.

**Customer Price Sensitivity**: Analyze customer responses to different pricing levels to optimize pricing strategies.

### Integration with ERPNext

#### Quotation Generation

When a Pre-Quotation is approved, the system seamlessly creates standard ERPNext Quotations:

**Automatic Item Creation**: The system creates ERPNext Items for all custom furniture pieces, including complete specifications and pricing information.

**Quotation Formatting**: Generate professional ERPNext Quotations with proper formatting, terms, and conditions.

**Customer Integration**: Ensure customer information is properly synchronized between the Pre-Quotation system and standard ERPNext customer records.

#### Inventory Management

The enhanced workflow ensures proper inventory management:

**Delayed Stock Creation**: Stock items are created only after customer approval, preventing inventory bloat from unconfirmed quotations.

**Specification Tracking**: All custom specifications are preserved in ERPNext Item records for future reference and reordering.

**Cost Integration**: Manufacturing costs are properly integrated into ERPNext costing systems for accurate inventory valuation.

This comprehensive pricing management system transforms how furniture manufacturers handle custom orders, providing the tools and visibility needed to optimize profitability while maintaining competitive pricing and excellent customer service.

