import { dbRun, dbGet, dbAll } from '../db/initDb.js';
import bcrypt from 'bcryptjs';

export const STAFF_ANALYSTS = [
  { id: 'usr_analyst_01', name: 'Lead Analyst Alex Rivera', email: 'analyst@loop.com', role: 'ANALYST', title: 'Senior Operations Lead' },
  { id: 'usr_analyst_02', name: 'Sarah Jenkins', email: 'sarah.analyst@loop.com', role: 'ANALYST', title: 'Senior Financial Analyst' },
  { id: 'usr_analyst_03', name: 'Marcus Chen', email: 'marcus.analyst@loop.com', role: 'ANALYST', title: 'Technical Operations Specialist' },
  { id: 'usr_analyst_04', name: 'Priya Sharma', email: 'priya.analyst@loop.com', role: 'ANALYST', title: 'Customer Escalations Analyst' },
  { id: 'usr_analyst_05', name: 'David Miller', email: 'david.analyst@loop.com', role: 'ANALYST', title: 'Payments & Settlement Analyst' },
  { id: 'usr_analyst_06', name: 'Elena Rostova', email: 'elena.analyst@loop.com', role: 'ANALYST', title: 'Logistics & Supply Chain Analyst' },
  { id: 'usr_analyst_07', name: 'James Wilson', email: 'james.analyst@loop.com', role: 'ANALYST', title: 'Product Quality & Safety Analyst' },
  { id: 'usr_analyst_08', name: 'Amina Diallo', email: 'amina.analyst@loop.com', role: 'ANALYST', title: 'Account Security & Compliance Analyst' },
  { id: 'usr_analyst_09', name: 'Lucas Silva', email: 'lucas.analyst@loop.com', role: 'ANALYST', title: 'Facility & Workplace Operations Analyst' },
  { id: 'usr_analyst_10', name: 'Rachel Green', email: 'rachel.analyst@loop.com', role: 'ANALYST', title: 'Service Delivery Coordinator' },
  { id: 'usr_analyst_11', name: 'Vikram Patel', email: 'vikram.analyst@loop.com', role: 'ANALYST', title: 'Fraud & Transaction Verification Analyst' }
];

const COMPLAINT_TEMPLATES = [
  // 1-15: Payment & POS Issues
  { cat: 'Payment', reason: 'Duplicate Credit Card Charge on POS Terminal', desc: 'Card swiped twice at checkout register #4 due to terminal timeout. Charged $148.50 twice.', p: 'CRITICAL', dept: 'Payments', rc: 'POS Terminal Double Swipe Error' },
  { cat: 'Payment', reason: 'UPI Payment Deducted But Merchant Transaction Failed', desc: 'Bank debited $95 via UPI but merchant terminal timed out and gave failure slip #TRX-9482.', p: 'CRITICAL', dept: 'Payments', rc: 'Interbank Switch Timeout' },
  { cat: 'Payment', reason: 'Promotional Discount Voucher Not Applied', desc: 'Entered coupon PROMO25 at payment gateway but full price $200 was billed without discount.', p: 'MEDIUM', dept: 'Payments', rc: 'Voucher Timezone Validation Bug' },
  { cat: 'Payment', reason: 'Unauthorized Recurring Card Charge', desc: 'Card charged $49.99 monthly fee even though subscription was cancelled 2 weeks prior.', p: 'HIGH', dept: 'Finance / Accounts', rc: 'Subscription Auto-Renew Cancellation Delay' },
  { cat: 'Payment', reason: 'Refund Cheque Returned With Signature Mismatch', desc: 'Corporate refund cheque of $450 bounced at bank due to missing authorized sign.', p: 'CRITICAL', dept: 'Finance / Accounts', rc: 'Signatory Specimen Outdated' },
  { cat: 'Payment', reason: 'Overcharged Sales Tax on Tax-Exempt Order', desc: 'Charged 18% GST instead of 0% tax on registered corporate tax-exempt order #84920.', p: 'MEDIUM', dept: 'Finance / Accounts', rc: 'POS Tax Exemption Tag Omission' },
  { cat: 'Payment', reason: 'International Currency Conversion Surcharge Undisclosed', desc: 'Charged 4.5% foreign transaction fee without any notice on domestic card.', p: 'MEDIUM', dept: 'Finance / Accounts', rc: 'FX Gateway Routing Error' },
  { cat: 'Payment', reason: 'Store Credit Balance Disappeared After System Update', desc: 'My $120 store gift credit balance shows $0.00 following website maintenance.', p: 'HIGH', dept: 'Payments', rc: 'User Credit Ledger Sync Failure' },
  { cat: 'Payment', reason: 'Contactless Tap to Pay Charged Incorrect Amount', desc: 'Tapped NFC card for $15 coffee order, terminal charged $150 due to decimal bug.', p: 'CRITICAL', dept: 'Payments', rc: 'POS Firmware Decimal Keypad Bug' },
  { cat: 'Payment', reason: 'Cashier Failed to Provide Printed Cash Receipt', desc: 'Paid $80 cash at register but cashier stated printer was broken and gave no proof.', p: 'LOW', dept: 'Customer Service', rc: 'Register Thermal Printer Jam' },
  { cat: 'Payment', reason: 'Delayed Bank Account Refund Exceeding 14 Days', desc: 'Return approved on 10th with 3-day refund SLA. Still no funds in bank after 16 days.', p: 'HIGH', dept: 'Finance / Accounts', rc: 'Manual Batch Settlement Queue Stalled' },
  { cat: 'Payment', reason: 'Split Payment Glitch Charged Card Twice', desc: 'Attempted split payment between cash and card; card was charged total amount.', p: 'HIGH', dept: 'Payments', rc: 'Split Tender State Inconsistency' },
  { cat: 'Payment', reason: 'QR Code Payment Redirected to Wrong Merchant ID', desc: 'Scanned counter QR stand and payment went to neighboring franchise vendor.', p: 'CRITICAL', dept: 'Payments', rc: 'Merchant QR Display Mixup' },
  { cat: 'Payment', reason: 'ATM Cash Withdrawal Debited With Zero Cash Dispensed', desc: 'Branch lobby ATM debited $300 from account but cash dispenser mechanism jammed.', p: 'CRITICAL', dept: 'Finance / Accounts', rc: 'ATM Dispenser Mechanical Jam' },
  { cat: 'Payment', reason: 'Wallet Cash Back Reward Not Credited', desc: 'Promised 10% instant cash back on $500 purchase has not posted after 7 business days.', p: 'LOW', dept: 'Customer Service', rc: 'Rewards Rule Evaluation Engine Delay' },

  // 16-30: Technical & IT Issues
  { cat: 'Technical Issue', reason: 'Payment Gateway 504 Gateway Timeout During Checkout', desc: 'Checkout page crashed on payment verification step. Order status shows Unconfirmed.', p: 'CRITICAL', dept: 'Technical / IT', rc: 'Webhook Response Timeout Under Peak Load' },
  { cat: 'Technical Issue', reason: 'iOS App Force Closes on Account Dashboard Open', desc: 'iOS App v3.4.1 crashes on launch whenever user profile picture loads.', p: 'HIGH', dept: 'Technical / IT', rc: 'Image Cache Null Pointer Exception' },
  { cat: 'Technical Issue', reason: 'Android Push Notifications Cannot Be Disabled', desc: 'Notification preference toggle resets to Enabled upon closing app.', p: 'LOW', dept: 'Technical / IT', rc: 'SharedPreferences Persistence Sync Error' },
  { cat: 'Technical Issue', reason: 'SMS OTP Code Arrives After 20 Minute Expiration Limit', desc: 'Verification SMS delayed by carrier routing; OTP always expires before entry.', p: 'HIGH', dept: 'Technical / IT', rc: 'Telecom Transactional SMS Route Throttling' },
  { cat: 'Technical Issue', reason: 'REST API Bearer Token Expiring in 30 Seconds', desc: 'OAuth token expires almost immediately breaking automated ERP data integrations.', p: 'HIGH', dept: 'Technical / IT', rc: 'Token TTL Configured in Seconds Instead of Hours' },
  { cat: 'Technical Issue', reason: 'Data Export Feature Generates Corrupted Empty CSV', desc: 'Exporting quarterly analytics produces a 0-byte file with syntax error header.', p: 'MEDIUM', dept: 'Technical / IT', rc: 'Streaming Buffer Memory Allocation Limit' },
  { cat: 'Technical Issue', reason: 'Subdomain DNS Fails Resolution Across Regional ISPs', desc: 'portal.loop.com intermittently fails to resolve on major broadband networks.', p: 'HIGH', dept: 'Technical / IT', rc: 'Anycast DNS Name Server Inconsistency' },
  { cat: 'Technical Issue', reason: 'Cloud Server Virtual Instance Provisioning Fails', desc: 'Deploy instance API times out after 10 minutes leaving virtual machine in Error state.', p: 'HIGH', dept: 'Technical / IT', rc: 'Hypervisor Node Resource Starvation' },
  { cat: 'Technical Issue', reason: 'Two-Factor Authentication Infinite Redirect Loop', desc: 'Entering valid authenticator code reloads login page without session token.', p: 'HIGH', dept: 'Technical / IT', rc: 'Secure Cookie SameSite Policy Misconfiguration' },
  { cat: 'Technical Issue', reason: 'Web Page Memory Leak Freezes Browser Tab', desc: 'Dashboard graphs consume 4GB RAM over 30 minutes freezing browser window.', p: 'MEDIUM', dept: 'Technical / IT', rc: 'WebSocket Listener Cleanup Omission' },
  { cat: 'Technical Issue', reason: 'PDF Invoice Download Link Gives 403 Forbidden', desc: 'Clicking download invoice in billing history returns permission denied error.', p: 'MEDIUM', dept: 'Technical / IT', rc: 'S3 Pre-signed URL Header Expired' },
  { cat: 'Technical Issue', reason: 'SSL Certificate Warning Displayed on Checkout', desc: 'Browser warns connection is not private due to intermediate certificate mismatch.', p: 'CRITICAL', dept: 'Technical / IT', rc: 'Intermediate CA Certificate Bundle Missing' },
  { cat: 'Technical Issue', reason: 'Search Autocomplete Feature Returns Irrelevant Data', desc: 'Searching for invoices brings up deleted records from previous fiscal year.', p: 'LOW', dept: 'Technical / IT', rc: 'ElasticSearch Index Stale Document Filter' },
  { cat: 'Technical Issue', reason: 'Dark Mode Toggle Causes Inverted Invisible Text', desc: 'Switching theme makes form input text white against white background.', p: 'LOW', dept: 'Technical / IT', rc: 'CSS Specificity Variable Conflict' },
  { cat: 'Technical Issue', reason: 'Customer Profile Session Disconnects Every 90 Seconds', desc: 'Dashboard logs out automatically while typing support responses.', p: 'HIGH', dept: 'Technical / IT', rc: 'Redis Session Cache Inactivity Timeout Too Short' },

  // 31-45: Delivery & Logistics
  { cat: 'Delivery', reason: 'Package Marked Delivered But Not Received at Door', desc: 'Tracking says delivered at 10 AM, but doorbell camera and security show no delivery truck.', p: 'HIGH', dept: 'Logistics', rc: 'Courier Driver Misdelivered to Incorrect Street' },
  { cat: 'Delivery', reason: 'Damaged Item Package Delivered With Broken Seals', desc: 'Outer cardboard box crushed and internal protective seals torn with product leakage.', p: 'HIGH', dept: 'Logistics', rc: 'Inadequate Courier Cushioning Materials' },
  { cat: 'Delivery', reason: 'Courier Tossed Fragile Glassware Over Perimeter Gate', desc: 'Driver threw fragile package over 7ft security gate causing full item breakage.', p: 'HIGH', dept: 'Logistics', rc: 'Courier Delivery Protocol Breach' },
  { cat: 'Delivery', reason: 'Partial Shipment Arrived Missing 3 Out of 5 Ordered Items', desc: 'Packing slip marked complete but parcel contained only 2 items out of 5.', p: 'MEDIUM', dept: 'Logistics', rc: 'Fulfillment Center Barcode Scanner Error' },
  { cat: 'Delivery', reason: 'Guaranteed 24-Hour Express Delivery Delayed by 4 Days', desc: 'Paid $50 priority fee for urgent medical supplies; shipment took 96 hours.', p: 'HIGH', dept: 'Logistics', rc: 'Airport Hub Ground Hold Due to Logistics Sort Delay' },
  { cat: 'Delivery', reason: 'Parcel Rerouted to Wrong State Due to Barcode Misprint', desc: 'Shipping label barcode misprinted postal code sending parcel 1000 miles away.', p: 'MEDIUM', dept: 'Logistics', rc: 'Label Thermal Print Head Streak Error' },
  { cat: 'Delivery', reason: 'Luggage Express Tag Lost in Transit Network', desc: 'Airport dispatch bag tag not registered in regional hub tracking database.', p: 'HIGH', dept: 'Logistics', rc: 'Handheld Scanner Offline Data Sync Stalled' },
  { cat: 'Delivery', reason: 'Perishable Goods Delivered Thawed and Spoiled', desc: 'Frozen food order delivered with melted dry ice and spoiled contents.', p: 'CRITICAL', dept: 'Logistics', rc: 'Cold-Chain Refrigeration Van Breakdown' },
  { cat: 'Delivery', reason: 'Delivery Driver Demanded Extra Cash Surcharge at Door', desc: 'Courier driver refused to hand over prepaid package without unauthorized $20 cash fee.', p: 'HIGH', dept: 'Customer Service', rc: 'Driver Code of Conduct Violation' },
  { cat: 'Delivery', reason: 'Delivery Window Rescheduled 3 Times Without Notice', desc: 'Customer stayed home 3 days in a row following automated reschedule texts.', p: 'LOW', dept: 'Logistics', rc: 'Last-Mile Route Optimization Overbooking' },
  { cat: 'Delivery', reason: 'Wrong Customer Name and Address On Shipping Label', desc: 'Received a completely different customer parcel with invoice attached.', p: 'HIGH', dept: 'Logistics', rc: 'Packing Line Cross-Labeling Mistake' },
  { cat: 'Delivery', reason: 'Package Left in Rain Without Protective Weather Bag', desc: 'Electronics box left exposed on open driveway during heavy rain storm.', p: 'HIGH', dept: 'Logistics', rc: 'Weather Protection Bagging Protocol Omission' },
  { cat: 'Delivery', reason: 'Signature Forged on High-Value Delivery Confirmation', desc: 'Courier marked parcel signed by customer while customer was out of the country.', p: 'CRITICAL', dept: 'Security', rc: 'Courier Signature Protocol Fraud' },
  { cat: 'Delivery', reason: 'Freight Cargo Pallet Missing Delivery Appointment', desc: 'Warehouse forklift team waited 4 hours; truck never arrived at loading dock.', p: 'MEDIUM', dept: 'Logistics', rc: 'Freight Dispatch Scheduling Conflict' },
  { cat: 'Delivery', reason: 'Address Correction Request Ignored by Hub', desc: 'Submitted unit number update 24 hours before dispatch but driver went to old address.', p: 'LOW', dept: 'Logistics', rc: 'WMS Address Update Flag Sync Delay' },

  // 46-60: Product Quality & Hardware
  { cat: 'Product', reason: 'Electronic Hardware Unit Dead on Arrival Out of Box', desc: 'Brand new device fails to power on; internal power supply blinks error code red.', p: 'HIGH', dept: 'Operations', rc: 'Factory QC Power Supply Batch Fault' },
  { cat: 'Product', reason: 'Expired Food Product Sold in Store Inventory', desc: 'Purchased product had best-before date expired 6 days prior to purchase.', p: 'HIGH', dept: 'Operations', rc: 'Shelf Rotation Stock Audit Oversight' },
  { cat: 'Product', reason: 'Medicine Blister Pack Missing Foil Seal on Tablets', desc: 'Pharmaceutical packaging compromised with open foil exposing 4 capsules.', p: 'CRITICAL', dept: 'Operations', rc: 'Blister Packaging Machine Seal Pressure Defect' },
  { cat: 'Product', reason: 'Product Color and Texture Severely Different From Photo', desc: 'Delivered furniture is dark brown vinyl instead of beige Italian leather shown online.', p: 'LOW', dept: 'Operations', rc: 'Catalog Color Profile Rendering Mismatch' },
  { cat: 'Product', reason: 'Missing Hardware Screws and User Assembly Guide', desc: 'Table flat-pack missing main bolt package and instruction booklet.', p: 'LOW', dept: 'Customer Service', rc: 'Packaging Kitting Check Omission' },
  { cat: 'Product', reason: 'Appliance Emitting Burning Plastic Odor on First Use', desc: 'Microwave oven plastic insulation melting on first 2-minute cycle.', p: 'CRITICAL', dept: 'Operations', rc: 'Heating Element Clearance Defect' },
  { cat: 'Product', reason: 'Broken Zipper on Luxury Travel Bag', desc: 'Main compartment zipper split open on first use at airport.', p: 'LOW', dept: 'Operations', rc: 'Zipper Slider Metal Fatigue Defect' },
  { cat: 'Product', reason: 'Touchscreen Digitizer Has Dead Zones and Ghost Touches', desc: 'Tablet screen does not register touch on left 25% of display area.', p: 'HIGH', dept: 'Technical / IT', rc: 'Screen Touch Controller Calibration Glitch' },
  { cat: 'Product', reason: 'Battery Swelling and Pushing Out Laptop Trackpad', desc: 'Lithium battery swelling noticed after 3 months, warping casing.', p: 'CRITICAL', dept: 'Operations', rc: 'Battery Cell Thermal Expansion Fault' },
  { cat: 'Product', reason: 'Paint Peeling Off Metal Casing Within 48 Hours', desc: 'Protective enamel coating chipping off with gentle dry cloth wipe.', p: 'LOW', dept: 'Operations', rc: 'Primer Curing Temperature Deviation' },
  { cat: 'Product', reason: 'Missing Warranty Certificate Number in Retail Box', desc: 'Box contains unit but warranty registration slip was blank.', p: 'LOW', dept: 'Customer Service', rc: 'Factory Serial Print Slip Omission' },
  { cat: 'Product', reason: 'Defective Bluetooth Antenna Range Limited to 1 Foot', desc: 'Wireless headphones disconnect as soon as phone is placed in pocket.', p: 'MEDIUM', dept: 'Technical / IT', rc: 'Antenna Soldering Contact Fault' },
  { cat: 'Product', reason: 'Sharp Burr on Metal Handle Created Cut Hazard', desc: 'Unfinished sharp metal edge on kettle handle cut customer finger.', p: 'CRITICAL', dept: 'Administration', rc: 'Machining Deburring Quality Inspection Miss' },
  { cat: 'Product', reason: 'E-Book Digital Download Corrupted File Link', desc: 'Download link gives 404 file not found after successful purchase.', p: 'LOW', dept: 'Technical / IT', rc: 'Content CDN Asset Mirroring Delay' },
  { cat: 'Product', reason: 'Software Activation License Key Already In Use', desc: 'Purchased retail boxed software; license key gives Error: Activated by Another User.', p: 'HIGH', dept: 'Customer Service', rc: 'License Key Generator Collision' },

  // 61-75: Customer Service & Staff Conduct
  { cat: 'Service', reason: 'Store Manager Refused Valid Return With Purchase Receipt', desc: 'Manager refused return within 14-day policy window claiming item was open box.', p: 'HIGH', dept: 'Customer Service', rc: 'Staff Policy Misunderstanding' },
  { cat: 'Service', reason: 'Customer Service Call Disconnected After 45 Min On Hold', desc: 'Held on queue for 45 minutes before IVR automatically hung up without agent.', p: 'MEDIUM', dept: 'Customer Service', rc: 'Telephony Max Queue Timeout Threshold' },
  { cat: 'Service', reason: 'Support Ticket Closed As Resolved Without Any Action', desc: 'Ticket #9401 closed automatically with generic reply while bug remains unfixed.', p: 'MEDIUM', dept: 'Customer Service', rc: 'Auto-Closure Rule on Stale Agent Assignment' },
  { cat: 'Service', reason: 'Promised Phone Callback Never Received From Supervisor', desc: 'Agent promised manager callback within 2 hours; 3 days passed with no call.', p: 'LOW', dept: 'Customer Service', rc: 'Escalation CRM Ticket Callback Reminder Miss' },
  { cat: 'Service', reason: 'Rude and Unhelpful Attitude From Billing Help Desk', desc: 'Support rep laughed and dismissed billing inquiry when asked about overcharge.', p: 'HIGH', dept: 'Human Resources', rc: 'Agent Professional Conduct Breach' },
  { cat: 'Service', reason: 'Counter Staff Left Service Desk Unattended for 30 Mins', desc: 'Long line formed with no staff present during official business hours.', p: 'MEDIUM', dept: 'Operations', rc: 'Shift Break Relief Scheduling Gap' },
  { cat: 'Service', reason: 'Misleading Warranty Information Given at Point of Sale', desc: 'Sales rep claimed 3-year warranty included; manufacturer states only 1 year.', p: 'MEDIUM', dept: 'Customer Service', rc: 'Sales Team Training Documentation Outdated' },
  { cat: 'Service', reason: 'Vehicle Service Checklist Marked Done But Uncompleted', desc: 'Invoice billed for oil filter change and interior clean; neither was done.', p: 'HIGH', dept: 'Operations', rc: 'Service Technician Premature Checklist Sign-Off' },
  { cat: 'Service', reason: 'Reservation Cancelled by Store Without Prior Notification', desc: 'Arrived for reserved consultation to find slot given to walk-in customer.', p: 'LOW', dept: 'Customer Service', rc: 'Appointment Calendar Sync Conflict' },
  { cat: 'Service', reason: 'Staff Refused to Assist Disabled Customer With Wheelchair', desc: 'Store entrance lacked ramp and staff refused to assist customer over steps.', p: 'CRITICAL', dept: 'Administration', rc: 'ADA Accessibility Protocol Non-Compliance' },
  { cat: 'Service', reason: 'Chatbot Repeating Loop Unable to Reach Live Agent', desc: 'Support chatbot loops endlessly refusing to transfer customer to human agent.', p: 'LOW', dept: 'Technical / IT', rc: 'Chatbot Fallback Escalation Rule Error' },
  { cat: 'Service', reason: 'Wrong Customer Records Disclosed Over Phone Support', desc: 'Agent read out confidential account address belonging to another customer.', p: 'CRITICAL', dept: 'Security', rc: 'Identity Verification Protocol Bypass by Agent' },
  { cat: 'Service', reason: 'Fitting Room Key Unavailable Attendant Missing', desc: 'Locked fitting rooms with 15 customers waiting for keyholder.', p: 'LOW', dept: 'Operations', rc: 'Fitting Room Key Custody Oversight' },
  { cat: 'Service', reason: 'Store Opened 30 Minutes Late Leaving Queue Outside', desc: 'Branch opened late in rain leaving morning customers waiting.', p: 'LOW', dept: 'Customer Service', rc: 'Store Keyholder Commute Delay' },
  { cat: 'Service', reason: 'Repeated Automated Survey Calls Received Late at Night', desc: 'Received 4 automated feedback robocalls between 11 PM and 2 AM.', p: 'MEDIUM', dept: 'Customer Service', rc: 'Survey Scheduler Timezone Calculation Bug' },

  // 76-90: Billing & Invoicing
  { cat: 'Billing', reason: 'Invoice Missing Mandatory Company Tax ID', desc: 'PDF invoice missing VAT number required for corporate expense reconciliation.', p: 'MEDIUM', dept: 'Finance / Accounts', rc: 'Invoice Template Field Mapping Omission' },
  { cat: 'Billing', reason: 'Billed for Cancelled Service Add-On Package', desc: 'Invoice includes $30 cloud backup add-on that was removed last month.', p: 'MEDIUM', dept: 'Finance / Accounts', rc: 'Add-On Provisioning Deactivation Sync Delay' },
  { cat: 'Billing', reason: 'Hidden Processing Surcharge Added at Final Payment', desc: 'Added unexpected $25 handling surcharge not disclosed on item pricing page.', p: 'MEDIUM', dept: 'Finance / Accounts', rc: 'Legacy Checkout Surcharge Rule Triggered' },
  { cat: 'Billing', reason: 'Double Invoicing for Single Annual Contract', desc: 'Received two separate invoices with different invoice numbers for same term.', p: 'HIGH', dept: 'Finance / Accounts', rc: 'Contract Auto-Renewal Duplicate Cron Job' },
  { cat: 'Billing', reason: 'Currency Billed in EUR Instead of USD Account Default', desc: 'Credit card billed in EUR with unfavorable conversion rate for US customer.', p: 'MEDIUM', dept: 'Finance / Accounts', rc: 'GeoIP Billing Currency Default Override' },
  { cat: 'Billing', reason: 'Late Fee Applied Despite On-Time Payment Settlement', desc: 'Account hit with $35 penalty although payment cleared 3 days before due date.', p: 'MEDIUM', dept: 'Finance / Accounts', rc: 'Bank Clearing Date vs Payment Date Calculation Bug' },
  { cat: 'Billing', reason: 'Itemized Invoice Calculations Do Not Add Up to Total', desc: 'Sum of line items is $450 but invoice summary displays $520.', p: 'HIGH', dept: 'Finance / Accounts', rc: 'Rounding Calculation Error in Multi-Tier Discount' },
  { cat: 'Billing', reason: 'Prepaid Account Credits Not Deducted from Invoice', desc: 'Invoice charged full card balance ignoring $100 existing wallet credits.', p: 'HIGH', dept: 'Finance / Accounts', rc: 'Prepaid Balance Ledger Application Omission' },
  { cat: 'Billing', reason: 'Enterprise Volume Tier Discount Removed Erroneously', desc: 'Account downgraded from Tier 3 enterprise rate to Tier 1 retail rate.', p: 'HIGH', dept: 'Finance / Accounts', rc: 'Enterprise Rate Contract Date Range Bug' },
  { cat: 'Billing', reason: 'Credit Note Issued With Expired Validity Date', desc: 'Refund credit note issued on 1st had expiration date set to previous month.', p: 'MEDIUM', dept: 'Finance / Accounts', rc: 'Credit Note Date Generation Format Error' },
  { cat: 'Billing', reason: 'Paper Invoice Fee Charged to Electronic Billing Account', desc: 'Billed $5 paper statement fee despite selecting paperless e-billing.', p: 'LOW', dept: 'Finance / Accounts', rc: 'Paperless Billing Preference Flag Sync Failure' },
  { cat: 'Billing', reason: 'Annual Contract Auto-Renews Without 30-Day Prior Notice', desc: 'Charged $1,200 annual renewal fee with zero advance email warning.', p: 'HIGH', dept: 'Finance / Accounts', rc: 'Automated Notice Email Dispatch Queue Stall' },
  { cat: 'Billing', reason: 'Billed Twice for Same Shipping Cargo Weight', desc: 'Freight invoice applied dimensional weight and actual weight simultaneously.', p: 'MEDIUM', dept: 'Finance / Accounts', rc: 'Freight Rating Engine Calculation Glitch' },
  { cat: 'Billing', reason: 'Direct Debit Withdrawn 5 Days Before Agreed Billing Date', desc: 'Bank account debited on 20th causing overdraft fees; scheduled date was 25th.', p: 'HIGH', dept: 'Finance / Accounts', rc: 'ACH Batch Submission Timing Offset' },
  { cat: 'Billing', reason: 'Cancelled License Seats Continued on Monthly Bill', desc: 'Removed 5 user licenses; monthly bill still charging for 20 seats instead of 15.', p: 'MEDIUM', dept: 'Finance / Accounts', rc: 'Prorated Seat Metering Calculation Bug' },

  // 91-105: Account & Security
  { cat: 'Account', reason: 'Personal Details of Another User Displayed on My Profile', desc: 'Dashboard loads another customer home address and order history.', p: 'CRITICAL', dept: 'Security', rc: 'User Session Cache Key Collision' },
  { cat: 'Account', reason: 'Unable to Reset Password Due to Broken Expired Link', desc: 'Password reset email link throws 404 page expired error immediately.', p: 'HIGH', dept: 'Technical / IT', rc: 'Token Hash Timestamp Verification Clock Drift' },
  { cat: 'Account', reason: 'Account Locked Due to Automated Security Flag', desc: 'Account locked for 4 days after logging in from hotel WiFi while traveling.', p: 'HIGH', dept: 'Security', rc: 'GeoIP Velocity Fraud Threshold Too Sensitive' },
  { cat: 'Account', reason: 'Primary Email Address Update Verification Link Broken', desc: 'Clicking email confirmation link gives server 500 error.', p: 'MEDIUM', dept: 'Technical / IT', rc: 'Email Change Verification Route Typo' },
  { cat: 'Account', reason: '2FA Recovery Backup Codes Not Working', desc: 'Lost phone; entered valid emergency backup codes but system says Invalid.', p: 'HIGH', dept: 'Security', rc: 'Backup Code Hash Salt Verification Bug' },
  { cat: 'Account', reason: 'Unrecognized Device Login Detected Without Security Alert', desc: 'Found active foreign login session with no email alert dispatched.', p: 'CRITICAL', dept: 'Security', rc: 'New Device Detection Webhook Failure' },
  { cat: 'Account', reason: 'Profile Picture Upload Gives 500 Internal Server Error', desc: 'Uploading standard JPG avatar fails with server error message.', p: 'LOW', dept: 'Technical / IT', rc: 'Image Resizing Library Memory Limit' },
  { cat: 'Account', reason: 'Account Deletion Request Pending for Over 60 Days', desc: 'Submitted GDPR data deletion request 2 months ago; account still active.', p: 'HIGH', dept: 'Legal / Compliance', rc: 'GDPR Purge Queue Processing Delay' },
  { cat: 'Account', reason: 'Corporate Domain SSO Integration Refuses Connection', desc: 'SAML SSO integration fails with signature validation error.', p: 'HIGH', dept: 'Technical / IT', rc: 'SAML IdP Certificate Expiry Mismatch' },
  { cat: 'Account', reason: 'Billing Role Permissions Lost After Plan Upgrade', desc: 'Account owner lost ability to view invoices after upgrading subscription.', p: 'MEDIUM', dept: 'Technical / IT', rc: 'Role-Based Access Control Migration Bug' },
  { cat: 'Account', reason: 'Spam Messages Sent From Compromised User Account', desc: 'Customer received spam notification originating from internal support account.', p: 'CRITICAL', dept: 'Security', rc: 'Support Account Credential Compromise' },
  { cat: 'Account', reason: 'User Audit Log Export Missing Recent 14 Days', desc: 'Downloaded compliance log only shows events up to 2 weeks ago.', p: 'MEDIUM', dept: 'Technical / IT', rc: 'Audit Log Archival Pipeline Delay' },
  { cat: 'Account', reason: 'Phone Number Verification SMS Limit Exceeded Lockout', desc: 'System locked account after 1 SMS attempt claiming rate limit reached.', p: 'MEDIUM', dept: 'Security', rc: 'Rate Limiter IP Bucket Too Restrictive' },
  { cat: 'Account', reason: 'Privacy Policy Consent Modal Loops on Every Page Load', desc: 'Clicking Accept on cookie banner does not persist choice.', p: 'LOW', dept: 'Technical / IT', rc: 'LocalStorage Consent Token Key Typo' },
  { cat: 'Account', reason: 'Sub-Account Team Member Invitation Link Expired', desc: 'Invited team member link expired in 1 hour instead of 7 days.', p: 'LOW', dept: 'Customer Service', rc: 'Invite Token Expiry Timestamp Configuration' },

  // 106-120: Facility & Safety
  { cat: 'Safety', reason: 'Wet Floor Hazard in Shopping Aisle Without Warning Sign', desc: 'Freshly mopped floor with no warning cones; customer slipped near entrance.', p: 'CRITICAL', dept: 'Administration', rc: 'Janitorial Safety Protocol Non-Compliance' },
  { cat: 'Safety', reason: 'Emergency Fire Exit Door Blocked by Inventory Pallets', desc: 'Warehouse stacked boxes blocking main fire egress door in store.', p: 'CRITICAL', dept: 'Administration', rc: 'Stock Staging in Designated Fire Exit Route' },
  { cat: 'Safety', reason: 'Exposed High-Voltage Electrical Extension Cord in Aisle', desc: 'Uncovered power wire running across customer checkout walkway.', p: 'CRITICAL', dept: 'Administration', rc: 'Temporary Display Power Cable Unprotected' },
  { cat: 'Facility', reason: 'Air Conditioning Broken in Customer Lounge During Heatwave', desc: 'Indoor customer waiting area temperature exceeding 36C with no fans.', p: 'MEDIUM', dept: 'Administration', rc: 'HVAC Chiller Compressor Breaker Trip' },
  { cat: 'Facility', reason: 'Main Customer Elevator Out of Order With No Ramp Access', desc: 'Disabled customer unable to reach 2nd floor service counter.', p: 'HIGH', dept: 'Administration', rc: 'Elevator Hydraulic Seal Repair Ongoing' },
  { cat: 'Safety', reason: 'Broken Glass on Parking Lot Walkway Left Uncleaned', desc: 'Shattered glass bottle in parking aisle causing tire and pedestrian hazard.', p: 'HIGH', dept: 'Administration', rc: 'Parking Lot Daily Inspection Oversight' },
  { cat: 'Facility', reason: 'Customer Restrooms Out of Order and Unsanitary', desc: 'Water leak in 1st floor restroom leaving toilets locked for 3 days.', p: 'MEDIUM', dept: 'Administration', rc: 'Plumbing Supply Line Valve Leak' },
  { cat: 'Facility', reason: 'Parking Barrier Arm Struck Customer Vehicle Roof', desc: 'Automated barrier arm came down prematurely denting car roof.', p: 'CRITICAL', dept: 'Administration', rc: 'Optical Sensor Alignment Calibration Glitch' },
  { cat: 'Safety', reason: 'Unsecured Shelf Unit Wobbly and Leaning Toward Aisle', desc: 'Heavy merchandise shelf unstable creating potential tipping hazard.', p: 'CRITICAL', dept: 'Administration', rc: 'Display Rack Anchor Bolt Loosened' },
  { cat: 'Facility', reason: 'Flickering High-Frequency Overhead Fluorescent Lighting', desc: 'Strobe flickering in consultation booths causing migraine headaches.', p: 'LOW', dept: 'Administration', rc: 'Ballast Electrical Failure' },
  { cat: 'Safety', reason: 'First Aid Kit at Service Desk Found Completely Empty', desc: 'Customer needed bandage for scratch; first aid box had zero supplies.', p: 'HIGH', dept: 'Administration', rc: 'First Aid Monthly Restock Check Miss' },
  { cat: 'Facility', reason: 'Automatic Sliding Entrance Doors Jamming Shut on Patrons', desc: 'Motion sensor delayed; glass door closed while customer was walking through.', p: 'CRITICAL', dept: 'Administration', rc: 'Radar Motion Sensor Sensitivity Low' },
  { cat: 'Facility', reason: 'Loud Construction Noise in Customer Consultation Area', desc: 'Drilling noise during business hours made confidential discussion impossible.', p: 'LOW', dept: 'Administration', rc: 'Contractor Work Hours Permit Breach' },
  { cat: 'Facility', reason: 'Drinking Water Cooler Dispenser Dispensing Warm Brown Water', desc: 'Water filter overdue for change dispensing discolored water.', p: 'HIGH', dept: 'Administration', rc: 'Water Purification Filter Overdue for Service' },
  { cat: 'Safety', reason: 'Ice on Entrance Steps Not Salted During Winter Freeze', desc: 'Exterior concrete steps slippery with black ice; customer nearly fell.', p: 'CRITICAL', dept: 'Administration', rc: 'Winter De-Icing Morning Schedule Delay' },

  // 121-135: General Service & Governance
  { cat: 'Service', reason: 'Executive Escalation Request Ignored by Corporate Office', desc: 'Formal letter sent to executive desk on 5th has received zero acknowledgement.', p: 'MEDIUM', dept: 'Customer Service', rc: 'Executive Correspondence Intake Delay' },
  { cat: 'Service', reason: 'Inconsistent Service Policy Between Branch and Website', desc: 'Website says item eligible for trade-in; store branch refused inspection.', p: 'MEDIUM', dept: 'Operations', rc: 'Retail Operational Memo Communication Gap' },
  { cat: 'Technical Issue', reason: 'Mobile Website Layout Broken on Tablet Screens', desc: 'Navigation menu overlaps purchase button making ordering impossible.', p: 'LOW', dept: 'Technical / IT', rc: 'Responsive Breakpoint CSS Media Query Bug' },
  { cat: 'Billing', reason: 'Tax Exemption Certificate Rejected Erroneously', desc: 'Valid 501c3 government tax certificate marked invalid by automated scanner.', p: 'MEDIUM', dept: 'Finance / Accounts', rc: 'OCR Document Expiry Parser False Positive' },
  { cat: 'Payment', reason: 'Foreign Card Payment Surcharge Billed Without Consent', desc: 'Billed 3% fee on Canadian credit card without disclosure.', p: 'MEDIUM', dept: 'Payments', rc: 'International Card Rule Surcharge Bug' },
  { cat: 'Delivery', reason: 'Hazardous Chemicals Shipped Without Required Warning Labels', desc: 'Solvent bottle package delivered with no hazard diamond sticker.', p: 'CRITICAL', dept: 'Logistics', rc: 'Hazmat Packaging Compliance Slip Miss' },
  { cat: 'Product', reason: 'Software Subscription Feature Silently Deprecated', desc: 'Key reporting module removed with no advance notice or price reduction.', p: 'MEDIUM', dept: 'Customer Service', rc: 'Feature Deprecation Notice Schedule Omission' },
  { cat: 'Account', reason: 'Account Activity Log Timestamp Shows UTC Instead of Local', desc: 'Audit timeline shows confusing timezone for local branch activities.', p: 'LOW', dept: 'Technical / IT', rc: 'Timezone Localization Formatter Bug' },
  { cat: 'Safety', reason: 'Warehouse Forklift Operating in Customer Pedestrian Zone', desc: 'Forklift reversing near customer pickup counter with no spotter.', p: 'CRITICAL', dept: 'Administration', rc: 'Warehouse Pedestrian Separation Breach' },
  { cat: 'Facility', reason: 'Customer WiFi Network Transmitting Unsecured Open Captive', desc: 'Guest WiFi captive portal credential page lacking HTTPS encryption.', p: 'HIGH', dept: 'Technical / IT', rc: 'Captive Portal SSL Certificate Binding Error' },
  { cat: 'Payment', reason: 'Partial Refund Processed Instead of Full Amount Promised', desc: 'Approved for $350 full refund; only $150 posted to bank card.', p: 'HIGH', dept: 'Finance / Accounts', rc: 'Manual Refund Form Decimal Amount Typo' },
  { cat: 'Delivery', reason: 'Heavy Furniture Pallet Left on Sidewalk Blocking Traffic', desc: 'Courier driver unloaded 300kg crate on public sidewalk refusing to move it.', p: 'HIGH', dept: 'Logistics', rc: 'Threshold Delivery Service Level Misunderstanding' },
  { cat: 'Service', reason: 'Customer Loyalty Reward Points Balance Expired Prematurely', desc: 'Points with 2-year validity expired after 6 months with zero warning email.', p: 'LOW', dept: 'Customer Service', rc: 'Loyalty Points Expiry Cron Job Date Offset' },
  { cat: 'Product', reason: 'Missing Power Cable Cord From Retail Product Package', desc: 'Main hardware box missing AC power supply adapter cord.', p: 'LOW', dept: 'Customer Service', rc: 'Kitting Line Packaging Checklist Omission' },
  { cat: 'Technical Issue', reason: 'API Rate Limiting Returning 429 Too Many Requests at 1 req/sec', desc: 'Developer account throttled immediately despite Tier 3 500 req/min quota.', p: 'HIGH', dept: 'Technical / IT', rc: 'Redis Token Bucket Token Refill Rate Mismatch' }
];

const CUSTOMER_NAMES = [
  { name: 'Emily Watson', email: 'emily.watson@gmail.com', place: 'Downtown Branch #104' },
  { name: 'David Miller', email: 'david.miller@techcorp.io', place: 'Online Checkout Portal' },
  { name: 'Sophia Martinez', email: 'sophia.m@designs.com', place: 'Metro Station Outlet' },
  { name: 'James Wilson', email: 'j.wilson89@yahoo.com', place: 'Westside Fulfillment Hub' },
  { name: 'Olivia Taylor', email: 'olivia.t@gmail.com', place: 'Customer Account Portal' },
  { name: 'Robert Chen', email: 'robert.chen@consulting.com', place: 'Airport Terminal Store' },
  { name: 'Emma Davis', email: 'emma.davis@healthnet.org', place: 'North Plaza Branch' },
  { name: 'Michael Brown', email: 'm.brown@logistics.net', place: 'Express Logistics Hub' },
  { name: 'Ava Johnson', email: 'ava.johnson@studio.com', place: 'Mobile iOS Application' },
  { name: 'William Anderson', email: 'w.anderson@firm.com', place: 'Central Business Hub' },
  { name: 'Isabella Garcia', email: 'isabella.g@marketing.com', place: 'South Bay Outlet' },
  { name: 'Alexander Wright', email: 'alex.wright@capital.com', place: 'Subscription Portal' },
  { name: 'Mia Thomas', email: 'mia.thomas@creatives.co', place: 'Eastside Store #202' },
  { name: 'Ethan White', email: 'ethan.white@builder.org', place: 'Main Distribution Center' },
  { name: 'Charlotte Harris', email: 'c.harris@education.edu', place: 'Online Self-Service' },
  { name: 'Daniel Martin', email: 'daniel.m@enterprise.com', place: 'Tech Support Desk' },
  { name: 'Amelia Clark', email: 'amelia.clark@venture.com', place: 'Harbor Branch #305' },
  { name: 'Matthew Lewis', email: 'm.lewis@tech.io', place: 'Web Dashboard' },
  { name: 'Harper Lee', email: 'harper.lee@media.com', place: 'City Center Mall' },
  { name: 'Joseph Walker', email: 'j.walker@global.org', place: 'Logistics Courier' },
  { name: 'Evelyn Hall', email: 'evelyn.hall@law.com', place: 'HQ Store Outlet' },
  { name: 'Jackson Allen', email: 'j.allen@ops.net', place: 'Android App Store' },
  { name: 'Abigail Young', email: 'abigail.y@agency.com', place: 'West End Outlet' },
  { name: 'Logan King', email: 'logan.king@dev.io', place: 'Developer Console' },
  { name: 'Emily Wright', email: 'e.wright@consulting.org', place: 'Highland Branch' },
  { name: 'Benjamin Scott', email: 'b.scott@capital.com', place: 'Regional Hub #402' },
  { name: 'Ella Green', email: 'ella.green@design.co', place: 'Payment Gateway' },
  { name: 'Lucas Adams', email: 'lucas.a@logistics.com', place: 'Courier Network' },
  { name: 'Grace Baker', email: 'grace.baker@health.org', place: 'Support Helpline' },
  { name: 'Henry Gonzalez', email: 'henry.g@engineering.com', place: 'Northside Store' }
];

export async function seed135Complaints() {
  console.log('🌱 Seeding 10 Staff Analysts & 135 Enterprise Complaints...');
  const now = new Date().toISOString();

  // 1. Seed 1 Admin & 10+ Staff Analysts
  const adminPass = await bcrypt.hash('Admin@12345', 10);
  const analystPass = await bcrypt.hash('Analyst@12345', 10);

  // Admin
  await dbRun(
    `INSERT OR REPLACE INTO staff_users (id, name, email, passwordHash, plainPassword, role, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, 'ADMIN', 'ACTIVE', ?, ?)`,
    ['usr_admin_01', 'System Administrator', 'admin@loop.com', adminPass, 'Admin@12345', now, now]
  );

  // 10 Analysts
  for (const a of STAFF_ANALYSTS) {
    await dbRun(
      `INSERT OR REPLACE INTO staff_users (id, name, email, passwordHash, plainPassword, role, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)`,
      [a.id, a.name, a.email, analystPass, 'Analyst@12345', a.role, now, now]
    );
  }

  console.log(`✅ Seeded 1 Admin & ${STAFF_ANALYSTS.length} Staff Analysts.`);

  const analystIds = STAFF_ANALYSTS.map(a => a.id);

  let insertedCount = 0;
  for (let i = 0; i < COMPLAINT_TEMPLATES.length; i++) {
    const t = COMPLAINT_TEMPLATES[i];
    const cust = CUSTOMER_NAMES[i % CUSTOMER_NAMES.length];
    const index = i + 1;
    const complaintId = `cmp_corp_${String(index).padStart(3, '0')}`;
    const complaintNumber = `LOOP-2026-${String(910000 + index)}`;
    const custEmail = cust.email.toLowerCase();

    // Customer
    let customer = await dbGet('SELECT * FROM customers WHERE LOWER(email) = ?', [custEmail]);
    if (!customer) {
      const custId = `cust_${index}`;
      await dbRun(
        'INSERT OR IGNORE INTO customers (id, name, email, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, 1, ?, ?)',
        [custId, cust.name, custEmail, now, now]
      );
      customer = { id: custId };
    }

    // Lifecycle breakdown across 135 complaints:
    // Items 1-25: UNASSIGNED (SUBMITTED / AI_ANALYZED) -> In Admin queue for testing manual assignment
    // Items 26-85: IN_PROGRESS (Assigned across the 10 analysts)
    // Items 86-105: WAITING_FOR_DEPARTMENT (Assigned with active department request)
    // Items 106-120: REPORT_SUBMITTED (Assigned with department report submitted)
    // Items 121-135: RESOLVED (Dispatched with customer response and 1-5 star ratings)
    let status = 'SUBMITTED';
    let assignedAnalystId = null;

    if (index >= 26 && index <= 85) {
      status = 'IN_PROGRESS';
      assignedAnalystId = analystIds[i % analystIds.length];
    } else if (index >= 86 && index <= 105) {
      status = 'WAITING_FOR_DEPARTMENT';
      assignedAnalystId = analystIds[i % analystIds.length];
    } else if (index >= 106 && index <= 120) {
      status = 'REPORT_SUBMITTED';
      assignedAnalystId = analystIds[i % analystIds.length];
    } else if (index >= 121) {
      status = 'RESOLVED';
      assignedAnalystId = analystIds[i % analystIds.length];
    }

    const complaintCreatedAt = new Date(Date.now() - (140 - index) * 3600000 * 2).toISOString();
    const hasProof = (index % 2 === 0);
    const attachmentUrl = hasProof ? `https://loop.com/proofs/receipt_doc_${index}.pdf` : '';

    // 1. Insert/Replace Complaint
    await dbRun(
      `INSERT OR REPLACE INTO complaints (id, complaintNumber, customerId, name, email, place, category, reason, description, attachmentUrl, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        complaintId,
        complaintNumber,
        customer.id || `cust_${index}`,
        cust.name,
        custEmail,
        cust.place,
        t.cat,
        t.reason,
        t.desc,
        attachmentUrl,
        status,
        complaintCreatedAt,
        now
      ]
    );

    // 2. Insert AI Analysis
    const priorityScore = t.p === 'CRITICAL' ? 0.95 : t.p === 'HIGH' ? 0.80 : t.p === 'MEDIUM' ? 0.60 : 0.40;
    await dbRun(
      `INSERT OR REPLACE INTO ai_analysis 
       (id, complaintId, sentiment, sentimentScore, category, theme, priority, priorityScore, summary, keywords, suggestedResponse, attachmentAnalyzed, attachmentSummary, proofMatch, rootCause, sectionName, confidence, severity, urgency, impact, affectedScope, priorityReason, keyFactors, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `ai_${complaintId}`,
        complaintId,
        t.p === 'LOW' ? 'NEUTRAL' : 'NEGATIVE',
        0.88,
        t.cat,
        t.reason,
        t.p,
        priorityScore,
        `AI Triage Engine verified ${t.cat.toLowerCase()} issue concerning "${t.reason}" at ${cust.place}. Root cause classified as ${t.rc}.`,
        JSON.stringify([t.cat, t.rc.split(' ')[0], 'verified']),
        `Dear ${cust.name},\n\nWe have investigated your case regarding "${t.reason}" at ${cust.place}. Our ${t.dept} team has taken corrective action to resolve the issue.\n\nBest regards,\nLOOP Support Team`,
        hasProof ? 1 : 0,
        hasProof ? 'Customer PDF document proof verified against system audit logs.' : 'No customer attachment.',
        hasProof ? 'VERIFIED - Customer Proof Matches Statement' : 'UNVERIFIED',
        t.rc,
        `${t.cat} Section`,
        'High (98%)',
        t.p === 'CRITICAL' ? 'Critical Operational Impact' : 'Standard Operational Priority',
        t.p === 'CRITICAL' ? 'Immediate 4-Hour SLA' : 'Standard 24-Hour SLA',
        'Customer Account & Service Integrity',
        'Direct Complainant Account',
        `Priority classified as ${t.p} based on root cause: ${t.rc}.`,
        JSON.stringify(['Customer identity verified', 'Department routed', 'Operational log confirmed']),
        complaintCreatedAt,
        now
      ]
    );

    // 3. Status History
    await dbRun(
      'INSERT OR REPLACE INTO complaint_status_history (id, complaintId, status, createdAt) VALUES (?, ?, ?, ?)',
      [`sh_${complaintId}_1`, complaintId, 'SUBMITTED', complaintCreatedAt]
    );
    await dbRun(
      'INSERT OR REPLACE INTO complaint_status_history (id, complaintId, status, createdAt) VALUES (?, ?, ?, ?)',
      [`sh_${complaintId}_2`, complaintId, 'AI_ANALYZED', complaintCreatedAt]
    );

    // 4. Assignment Action
    if (assignedAnalystId) {
      const analystObj = STAFF_ANALYSTS.find(a => a.id === assignedAnalystId);
      await dbRun(
        'INSERT OR REPLACE INTO complaint_actions (id, complaintId, analystId, action, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [`act_${complaintId}_assign`, complaintId, assignedAnalystId, 'ASSIGNED_BY_ADMIN', `Assigned to ${analystObj?.name || 'Analyst'} for investigation.`, complaintCreatedAt]
      );
      await dbRun(
        'INSERT OR REPLACE INTO complaint_status_history (id, complaintId, status, createdAt) VALUES (?, ?, ?, ?)',
        [`sh_${complaintId}_3`, complaintId, 'IN_PROGRESS', complaintCreatedAt]
      );
    }

    // 5. Department Request & Report
    if (status === 'WAITING_FOR_DEPARTMENT' || status === 'REPORT_SUBMITTED') {
      const reqId = `dreq_${complaintId}`;
      await dbRun(
        `INSERT OR REPLACE INTO department_requests (id, complaintId, departmentName, requestedBy, priority, requiredInformation, reason, deadline, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, 'P2', ?, ?, ?, ?, ?, ?)`,
        [
          reqId,
          complaintId,
          t.dept,
          assignedAnalystId || 'usr_analyst_01',
          `Verify internal logs, system transaction references, and operational activity regarding "${t.reason}".`,
          `Case investigation requires department confirmation of ${t.rc}.`,
          new Date(Date.now() + 86400000).toISOString(),
          status === 'REPORT_SUBMITTED' ? 'REPORT_SUBMITTED' : 'PENDING',
          complaintCreatedAt,
          now
        ]
      );

      if (status === 'REPORT_SUBMITTED') {
        await dbRun(
          `INSERT OR REPLACE INTO department_reports (id, requestId, complaintId, departmentName, investigationResult, evidence, finding, actionTaken, recommendation, supportingDocs, submittedAt, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `drep_${complaintId}`,
            reqId,
            complaintId,
            t.dept,
            `Department internal review completed: Verified logs confirm ${t.rc}.`,
            `Audit log reference TRX-LOG-${910000 + index}`,
            'Root cause confirmed matching customer submission.',
            'Corrective action item initiated and completed in core system.',
            'Proceed with official case resolution dispatch.',
            'https://loop.com/reports/dept_finding.pdf',
            now,
            now
          ]
        );
      }
    }

    // 6. If Resolved
    if (status === 'RESOLVED') {
      const respId = `resp_${complaintId}`;
      const responseText = `Dear ${cust.name},\n\nWe have completed our investigation into "${t.reason}" at ${cust.place}.\n\nOur ${t.dept} team has taken corrective action and the matter is now fully resolved.\n\nThank you for your patience,\nLOOP Resolution Team`;

      await dbRun(
        'INSERT OR REPLACE INTO responses (id, complaintId, analystId, responseText, sentAt, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [respId, complaintId, assignedAnalystId || 'usr_analyst_01', responseText, now, now]
      );
      await dbRun(
        'INSERT OR REPLACE INTO complaint_actions (id, complaintId, analystId, action, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [`act_${complaintId}_resolve`, complaintId, assignedAnalystId || 'usr_analyst_01', 'RESOLVED_AND_DISPATCHED', 'Official resolution response dispatched to customer email.', now]
      );
      await dbRun(
        'INSERT OR REPLACE INTO complaint_status_history (id, complaintId, status, createdAt) VALUES (?, ?, ?, ?)',
        [`sh_${complaintId}_4`, complaintId, 'RESOLVED', now]
      );

      // Customer Feedback
      const rating = (index % 5 === 0) ? 5 : (index % 4 === 0) ? 4 : 5;
      await dbRun(
        `INSERT OR REPLACE INTO complaint_feedback (id, complaintId, complaintNumber, userEmail, rating, resolvedSatisfaction, feedbackText, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `fb_${complaintId}`,
          complaintId,
          complaintNumber,
          custEmail,
          rating,
          'COMPLETELY_RESOLVED',
          'Fast resolution and excellent transparency. Highly appreciated!',
          now
        ]
      );
    }

    insertedCount++;
  }

  console.log(`✅ Successfully seeded ${insertedCount} corporate complaints across ${analystIds.length} analysts!`);
}

// Allow direct CLI execution: node src/scripts/seed135Complaints.js
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').includes('seed135Complaints.js')) {
  seed135Complaints()
    .then(() => {
      console.log('Seeding complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}
