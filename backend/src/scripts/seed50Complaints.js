import { dbRun, dbGet, dbAll, supabaseQuery } from '../db/initDb.js';
import bcrypt from 'bcryptjs';

export const SAMPLE_COMPLAINTS_DATA = [
  {
    name: 'Emily Watson',
    email: 'emily.watson@gmail.com',
    place: 'Downtown Branch #104',
    category: 'Payment',
    reason: 'Duplicate Credit Card Charge on POS Terminal',
    description: 'I was charged twice $148.50 for my transaction on August 24th at 2:45 PM. Cashier swiped my card twice due to reader error. Please refund the duplicate transaction immediately.',
    priority: 'CRITICAL',
    sentiment: 'NEGATIVE',
    rootCause: 'POS Terminal Double Swipe Error',
    deptName: 'Payments',
    suggestedResponse: 'We have verified transaction logs with terminal #104 and initiated an immediate reversal of $148.50 to your card.'
  },
  {
    name: 'David Miller',
    email: 'david.miller@techcorp.io',
    place: 'Online Checkout Portal',
    category: 'Technical Issue',
    reason: 'Payment Gateway Timeout & Account Deducted',
    description: 'During online payment processing, the checkout page threw a 504 Gateway Timeout error. My bank account shows $320 deducted but order status says Unpaid.',
    priority: 'CRITICAL',
    sentiment: 'NEGATIVE',
    rootCause: 'Gateway 504 Timeout on Webhook',
    deptName: 'Technical / IT',
    suggestedResponse: 'Our engineering and payments teams matched your transaction reference and updated your order status to Confirmed.'
  },
  {
    name: 'Sophia Martinez',
    email: 'sophia.m@designs.com',
    place: 'Metro Station Outlet',
    category: 'Service',
    reason: 'Excessive Wait Time & Unattended Counter',
    description: 'Waited over 45 minutes in line during lunch rush with only one counter open out of four. Staff appeared uncoordinated and unhelpful when asked about queue delays.',
    priority: 'MEDIUM',
    sentiment: 'NEGATIVE',
    rootCause: 'Understaffing During Peak Lunch Hours',
    deptName: 'Operations',
    suggestedResponse: 'We apologize for the wait time. Management has adjusted shift allocations to ensure all 4 counters are staffed during peak periods.'
  },
  {
    name: 'James Wilson',
    email: 'j.wilson89@yahoo.com',
    place: 'Westside Fulfillment Hub',
    category: 'Delivery',
    reason: 'Damaged Item Package Delivered',
    description: 'My order #84920 arrived with a crushed outer box and broken internal seals. Product liquid spilled completely inside the package.',
    priority: 'HIGH',
    sentiment: 'NEGATIVE',
    rootCause: 'Inadequate Courier Cushioning Packaging',
    deptName: 'Logistics',
    suggestedResponse: 'A replacement order with reinforced express packaging has been dispatched, and a 15% courtesy credit applied.'
  },
  {
    name: 'Olivia Taylor',
    email: 'olivia.t@gmail.com',
    place: 'Customer Account Portal',
    category: 'Account',
    reason: 'Unable to Reset Password & Locked Out',
    description: 'Password reset link sent to my email expires immediately upon clicking. I have been locked out of my premium account for 3 days.',
    priority: 'HIGH',
    sentiment: 'NEGATIVE',
    rootCause: 'Token Expiry Timestamp Clock Drift',
    deptName: 'Technical / IT',
    suggestedResponse: 'Our backend engineering team deployed a fix for the token validation TTL, and we have sent an active manual reset link.'
  },
  {
    name: 'Robert Chen',
    email: 'robert.chen@consulting.com',
    place: 'Airport Terminal Store',
    category: 'Billing',
    reason: 'Incorrect Sales Tax Applied to Invoice',
    description: 'Charged 18% GST instead of standard 5% tax code on my tax-exempt purchase receipt. Receipt #TRX-9402.',
    priority: 'MEDIUM',
    sentiment: 'NEGATIVE',
    rootCause: 'POS Tax Category Configuration Mismatch',
    deptName: 'Finance / Accounts',
    suggestedResponse: 'Finance has recalculated invoice #TRX-9402 with the correct 5% rate and issued an adjusted credit statement.'
  },
  {
    name: 'Emma Davis',
    email: 'emma.davis@healthnet.org',
    place: 'North Plaza Branch',
    category: 'Service',
    reason: 'Rude Behavior & Refusal of Valid Return',
    description: 'Store manager refused to process my valid return despite having original purchase receipt within 14-day return policy window.',
    priority: 'HIGH',
    sentiment: 'NEGATIVE',
    rootCause: 'Staff Policy Misunderstanding',
    deptName: 'Customer Service',
    suggestedResponse: 'Your return has been approved and processed directly by our executive support desk.'
  },
  {
    name: 'Michael Brown',
    email: 'm.brown@logistics.net',
    place: 'Express Logistics Hub',
    category: 'Delivery',
    reason: 'Package Marked Delivered But Not Received',
    description: 'Tracking status updated to Delivered at 10:15 AM but package was not delivered to my address or security desk. Doorbell camera shows no delivery truck.',
    priority: 'HIGH',
    sentiment: 'NEGATIVE',
    rootCause: 'Driver Misdelivered to Neighboring Building',
    deptName: 'Logistics',
    suggestedResponse: 'Courier supervisor retrieved the package from building #42 and completed verified personal delivery.'
  },
  {
    name: 'Ava Johnson',
    email: 'ava.johnson@studio.com',
    place: 'Mobile iOS Application',
    category: 'Technical Issue',
    reason: 'App Crashing Constantly During Checkout',
    description: 'iOS App version 3.2.1 force closes immediately upon tapping Pay Now button. Reinstalling app did not resolve the crash.',
    priority: 'CRITICAL',
    sentiment: 'NEGATIVE',
    rootCause: 'Null Pointer in iOS Payment SDK',
    deptName: 'Technical / IT',
    suggestedResponse: 'iOS hotfix v3.2.2 has been released on the App Store resolving the checkout crash.'
  },
  {
    name: 'William Anderson',
    email: 'w.anderson@firm.com',
    place: 'Central Business Hub',
    category: 'Product',
    reason: 'Defective Electronic Component Included',
    description: 'Hardware unit failed to power on out of the box. Power adapter indicator blinks red indicating internal short circuit.',
    priority: 'HIGH',
    sentiment: 'NEGATIVE',
    rootCause: 'Power Adapter Manufacturing Batch Fault',
    deptName: 'Operations',
    suggestedResponse: 'A replacement power unit from verified stock has been shipped via priority courier.'
  },
  {
    name: 'Isabella Garcia',
    email: 'isabella.g@marketing.com',
    place: 'South Bay Outlet',
    category: 'Safety',
    reason: 'Wet Floor Hazard Without Warning Sign',
    description: 'Slipped on freshly mopped floor near aisle 4 because no yellow hazard warning cone was placed by cleaning staff.',
    priority: 'CRITICAL',
    sentiment: 'NEGATIVE',
    rootCause: 'Janitorial Safety Protocol Non-Compliance',
    deptName: 'Administration',
    suggestedResponse: 'Facility management has mandated safety cone placement before any floor cleaning procedures.'
  },
  {
    name: 'Alexander Wright',
    email: 'alex.wright@capital.com',
    place: 'Subscription Management Portal',
    category: 'Billing',
    reason: 'Unauthorized Auto-Renewal Subscription Charge',
    description: 'Card was charged $99 annual subscription fee even though I canceled auto-renewal 10 days before the renewal date.',
    priority: 'HIGH',
    sentiment: 'NEGATIVE',
    rootCause: 'Subscription Cancellation Queue Delay',
    deptName: 'Finance / Accounts',
    suggestedResponse: 'The $99 charge has been reversed in full, and subscription status updated to Cancelled.'
  },
  {
    name: 'Mia Thomas',
    email: 'mia.thomas@creatives.co',
    place: 'Eastside Store #202',
    category: 'Product',
    reason: 'Expired Grocery Product Sold',
    description: 'Purchased dairy item yesterday only to find the expiration date was 5 days ago. Store needs to audit shelf stock inventory.',
    priority: 'HIGH',
    sentiment: 'NEGATIVE',
    rootCause: 'Store Shelf Rotation Oversight',
    deptName: 'Operations',
    suggestedResponse: 'Store #202 completed a total stock sweep and issued a replacement voucher.'
  },
  {
    name: 'Ethan White',
    email: 'ethan.white@builder.org',
    place: 'Main Distribution Center',
    category: 'Delivery',
    reason: 'Partial Order Shipped Missing Items',
    description: 'Package contained only 2 out of 5 ordered tool kits. Packing slip checked off 5 items erroneously.',
    priority: 'MEDIUM',
    sentiment: 'NEGATIVE',
    rootCause: 'Fulfillment Packing Verification Error',
    deptName: 'Logistics',
    suggestedResponse: 'Remaining 3 tool kits were dispatched with priority express tracking.'
  },
  {
    name: 'Charlotte Harris',
    email: 'c.harris@education.edu',
    place: 'Online Self-Service Portal',
    category: 'Account',
    reason: 'Personal Information Displayed Incorrectly',
    description: 'My profile dashboard displays another customer billing address under my account settings page. Urgent privacy issue.',
    priority: 'CRITICAL',
    sentiment: 'NEGATIVE',
    rootCause: 'User Cache Key Collision Bug',
    deptName: 'Security',
    suggestedResponse: 'Security engineering patched the cache isolation layer and verified your profile integrity.'
  },
  {
    name: 'Daniel Martin',
    email: 'daniel.m@enterprise.com',
    place: 'Tech Support Desk',
    category: 'Service',
    reason: 'Unresolved Support Ticket Closed Without Action',
    description: 'Support ticket #8491 was marked as Resolved automatically without anyone contacting me or fixing the configuration bug.',
    priority: 'MEDIUM',
    sentiment: 'NEGATIVE',
    rootCause: 'Automated Bot Auto-Closure Rule',
    deptName: 'Customer Service',
    suggestedResponse: 'Ticket #8491 was reopened, assigned to a senior engineer, and successfully resolved.'
  },
  {
    name: 'Amelia Clark',
    email: 'amelia.clark@venture.com',
    place: 'Harbor Branch #305',
    category: 'Payment',
    reason: 'Card Refund Promised But Not Processed',
    description: 'Returned item on August 15th and received store credit slip stating credit card refund within 3 business days. 10 days passed and no refund posted.',
    priority: 'HIGH',
    sentiment: 'NEGATIVE',
    rootCause: 'POS Manual Batch Settlement Stalled',
    deptName: 'Payments',
    suggestedResponse: 'Finance processed the refund batch manually, reference ARN #9482019482.'
  },
  {
    name: 'Matthew Lewis',
    email: 'm.lewis@tech.io',
    place: 'Web Dashboard',
    category: 'Technical Issue',
    reason: 'Data Export Feature Generates Corrupted CSV',
    description: 'Exporting monthly reports produces a broken 0-byte CSV file with syntax parsing error.',
    priority: 'MEDIUM',
    sentiment: 'NEGATIVE',
    rootCause: 'CSV Streaming Buffer Memory Limit',
    deptName: 'Technical / IT',
    suggestedResponse: 'The export pipeline was updated to stream large datasets asynchronously.'
  },
  {
    name: 'Harper Lee',
    email: 'harper.lee@media.com',
    place: 'City Center Mall Outlet',
    category: 'Facility',
    reason: 'Air Conditioning Broken in Customer Lounge',
    description: 'Extremely hot indoor temperature in waiting lounge with no ventilation or fan. Uncomfortable experience.',
    priority: 'LOW',
    sentiment: 'NEUTRAL',
    rootCause: 'HVAC Chiller Unit Circuit Tripped',
    deptName: 'Administration',
    suggestedResponse: 'Building HVAC technician repaired the circuit and restored climate control.'
  },
  {
    name: 'Joseph Walker',
    email: 'j.walker@global.org',
    place: 'Logistics Courier Delivery',
    category: 'Delivery',
    reason: 'Driver Threw Parcel Over Gate',
    description: 'Delivery driver tossed fragile glass package over 6ft perimeter fence instead of placing it at the front door.',
    priority: 'HIGH',
    sentiment: 'NEGATIVE',
    rootCause: 'Courier Protocol Breach',
    deptName: 'Logistics',
    suggestedResponse: 'Carrier management disciplined the driver and provided full item replacement.'
  },
  {
    name: 'Evelyn Hall',
    email: 'evelyn.hall@law.com',
    place: 'Corporate Headquarters Outlet',
    category: 'Billing',
    reason: 'Overcharged Item Price Compared to Shelf Tag',
    description: 'Shelf price tag clearly displayed $19.99 but POS scanner charged $29.99. Cashier refused price adjustment.',
    priority: 'MEDIUM',
    sentiment: 'NEGATIVE',
    rootCause: 'Store Tag Not Updated After Promotion Ended',
    deptName: 'Finance / Accounts',
    suggestedResponse: 'Difference refunded plus store courtesy voucher issued.'
  },
  {
    name: 'Jackson Allen',
    email: 'j.allen@ops.net',
    place: 'Android Mobile App',
    category: 'Technical Issue',
    reason: 'OTP SMS Verification Code Delayed by 2 Hours',
    description: 'Verification SMS arrives 2 hours after requesting, making login impossible due to 5-minute OTP expiry limit.',
    priority: 'HIGH',
    sentiment: 'NEGATIVE',
    rootCause: 'Telecom SMS Gateway Queue Throttling',
    deptName: 'Technical / IT',
    suggestedResponse: 'Switched primary SMS gateway provider to high-priority transactional route.'
  },
  {
    name: 'Abigail Young',
    email: 'abigail.y@agency.com',
    place: 'West End Outlet #108',
    category: 'Service',
    reason: 'Unprofessional Staff Miscommunication',
    description: 'Assured by phone that item was held at store counter, but upon arrival store staff had sold item to someone else.',
    priority: 'LOW',
    sentiment: 'NEGATIVE',
    rootCause: 'Holding Log Communication Gap',
    deptName: 'Customer Service',
    suggestedResponse: 'Item procured from regional warehouse and delivered free of charge to your residence.'
  },
  {
    name: 'Logan King',
    email: 'logan.king@dev.io',
    place: 'API Developer Portal',
    category: 'Technical Issue',
    reason: 'REST API Authentication Token Expiring Prematurely',
    description: 'OAuth bearer tokens expire within 60 seconds instead of specified 1 hour TTL.',
    priority: 'HIGH',
    sentiment: 'NEGATIVE',
    rootCause: 'Token Expiry Configuration in Seconds Instead of Minutes',
    deptName: 'Technical / IT',
    suggestedResponse: 'API Gateway token lifetime corrected to 3600 seconds.'
  },
  {
    name: 'Emily Wright',
    email: 'e.wright@consulting.org',
    place: 'Highland Outlet',
    category: 'Product',
    reason: 'Manufacturing Seal Broken Upon Delivery',
    description: 'Package outer box intact but inner protective security seal was torn open before unboxing.',
    priority: 'HIGH',
    sentiment: 'NEGATIVE',
    rootCause: 'Factory Quality Check Box Repack Failure',
    deptName: 'Operations',
    suggestedResponse: 'Product replaced with factory fresh sealed inventory.'
  },
  {
    name: 'Benjamin Scott',
    email: 'b.scott@capital.com',
    place: 'Regional Branch #402',
    category: 'Safety',
    reason: 'Blocked Emergency Exit Fire Door',
    description: 'Boxes and pallet inventory stacked directly against emergency exit door in main shopping hall.',
    priority: 'CRITICAL',
    sentiment: 'NEGATIVE',
    rootCause: 'Temporary Stock Overflow Blocking Exit',
    deptName: 'Administration',
    suggestedResponse: 'Store safety marshal cleared exit route immediately and filed compliance log.'
  },
  {
    name: 'Ella Green',
    email: 'ella.green@design.co',
    place: 'Online Payment Gateway',
    category: 'Payment',
    reason: 'UPI Transaction Failed Money Deducted',
    description: 'Payment via UPI failed with error code 99, money debited from bank account but merchant received no credit.',
    priority: 'CRITICAL',
    sentiment: 'NEGATIVE',
    rootCause: 'Interbank UPI Switch Timeout',
    deptName: 'Payments',
    suggestedResponse: 'Bank reconciled transaction and auto-refunded debited amount to your bank account.'
  },
  {
    name: 'Lucas Adams',
    email: 'lucas.a@logistics.com',
    place: 'Courier Delivery Network',
    category: 'Delivery',
    reason: 'Incorrect Shipping Address Route',
    description: 'Parcel routed to wrong state due to postal barcode misprint by shipping department.',
    priority: 'MEDIUM',
    sentiment: 'NEGATIVE',
    rootCause: 'Barcode Sorting Optical Reader Misread',
    deptName: 'Logistics',
    suggestedResponse: 'Parcel rerouted via expedited air transit to correct destination.'
  },
  {
    name: 'Grace Baker',
    email: 'grace.baker@health.org',
    place: 'Customer Service Helpline',
    category: 'Service',
    reason: 'Call Disconnected After 30 Min Hold Time',
    description: 'Held on customer service phone line for 32 minutes before automated system disconnected the call.',
    priority: 'MEDIUM',
    sentiment: 'NEGATIVE',
    rootCause: 'IVR Telephony Max Hold Timeout Bug',
    deptName: 'Customer Service',
    suggestedResponse: 'Senior customer care executive placed a direct callback to resolve your query.'
  },
  {
    name: 'Henry Gonzalez',
    email: 'henry.g@engineering.com',
    place: 'Northside Hub Store',
    category: 'Product',
    reason: 'Missing Warranty Card and User Manual',
    description: 'Box contains main hardware unit but missing warranty card, safety guide, and manual.',
    priority: 'LOW',
    sentiment: 'NEUTRAL',
    rootCause: 'Factory Packaging Line Insert Omission',
    deptName: 'Customer Service',
    suggestedResponse: 'Digital documentation and registered warranty certificate sent via email.'
  },
  {
    name: 'Chloe Nelson',
    email: 'chloe.nelson@media.net',
    place: 'Web Portal Login Page',
    category: 'Account',
    reason: 'Two-Factor Authentication Loop Issue',
    description: 'Entering correct 2FA code redirects back to login page without authenticating.',
    priority: 'HIGH',
    sentiment: 'NEGATIVE',
    rootCause: 'Session Cookie Secure Attribute Flag on Redirect',
    deptName: 'Technical / IT',
    suggestedResponse: 'Auth gateway session handling bug resolved.'
  },
  {
    name: 'Alexander Carter',
    email: 'a.carter@finance.com',
    place: 'Southside Outlet #501',
    category: 'Billing',
    reason: 'Service Fee Added Without Disclosure',
    description: 'Unexpected $15 processing fee added to final invoice without prior customer disclosure.',
    priority: 'MEDIUM',
    sentiment: 'NEGATIVE',
    rootCause: 'Legacy Surcharge Code Triggered by Mistake',
    deptName: 'Finance / Accounts',
    suggestedResponse: 'The $15 fee was credited back immediately.'
  },
  {
    name: 'Victoria Mitchell',
    email: 'victoria.m@fashion.com',
    place: 'Express Store',
    category: 'Service',
    reason: 'Fitting Room Key Unavailable',
    description: 'Attendant away for over 20 minutes leaving fitting rooms locked and inaccessible.',
    priority: 'LOW',
    sentiment: 'NEUTRAL',
    rootCause: 'Floor Staff Break Schedule Overlap',
    deptName: 'Operations',
    suggestedResponse: 'Store schedule updated to ensure continuous attendant presence.'
  },
  {
    name: 'Sebastian Perez',
    email: 's.perez@systems.io',
    place: 'Mobile App Store',
    category: 'Technical Issue',
    reason: 'Push Notifications Unable to Disable',
    description: 'Notification settings toggle in app does not save preference, continuing to send marketing alerts.',
    priority: 'LOW',
    sentiment: 'NEUTRAL',
    rootCause: 'Local User Settings Sync Bug',
    deptName: 'Technical / IT',
    suggestedResponse: 'App patch v3.2.3 pushed with fixed notification preferences sync.'
  },
  {
    name: 'Lily Roberts',
    email: 'lily.roberts@arts.org',
    place: 'Downtown Gallery Store',
    category: 'Product',
    reason: 'Color Discrepancy From Website Photo',
    description: 'Delivered item color is dark brown instead of bright red shown in online product gallery.',
    priority: 'LOW',
    sentiment: 'NEUTRAL',
    rootCause: 'Product Image Color Profile Calibration',
    deptName: 'Operations',
    suggestedResponse: 'Item exchanged for correct color variant.'
  },
  {
    name: 'Jack Turner',
    email: 'jack.turner@build.net',
    place: 'Central Warehouse Depot',
    category: 'Delivery',
    reason: 'Delayed Freight Express Shipping',
    description: 'Paid $45 extra for guaranteed 24-hour delivery, parcel delivered after 4 business days.',
    priority: 'HIGH',
    sentiment: 'NEGATIVE',
    rootCause: 'Freight Carrier Weather Ground Stop',
    deptName: 'Logistics',
    suggestedResponse: 'Express shipping fee of $45 refunded in full.'
  },
  {
    name: 'Zoe Phillips',
    email: 'zoe.p@research.com',
    place: 'Account Security Settings',
    category: 'Account',
    reason: 'Unable to Update Primary Email Address',
    description: 'Email change verification link throws 404 Not Found error.',
    priority: 'MEDIUM',
    sentiment: 'NEGATIVE',
    rootCause: 'Verification Route Parameter Typo',
    deptName: 'Technical / IT',
    suggestedResponse: 'Route handler corrected and email updated.'
  },
  {
    name: 'Samuel Campbell',
    email: 'samuel.c@energy.com',
    place: 'Bay Area Branch',
    category: 'Safety',
    reason: 'Exposed Electrical Wiring Near Customer Desk',
    description: 'Uncovered power extension cord lying across pedestrian aisle creating trip and shock risk.',
    priority: 'CRITICAL',
    sentiment: 'NEGATIVE',
    rootCause: 'Temporary Workstation Cable Tray Missing',
    deptName: 'Administration',
    suggestedResponse: 'Wiring enclosed in protective floor channel.'
  },
  {
    name: 'Penelope Parker',
    email: 'penelope.p@events.com',
    place: 'Online Ticket Desk',
    category: 'Payment',
    reason: 'Promotional Discount Code Failed to Apply',
    description: 'Entered valid promo code PROMO20 but full non-discounted price was billed to credit card.',
    priority: 'MEDIUM',
    sentiment: 'NEGATIVE',
    rootCause: 'Promo Code Validation Timezone Offset',
    deptName: 'Payments',
    suggestedResponse: '20% discount difference refunded to card.'
  },
  {
    name: 'Luke Evans',
    email: 'luke.evans@motors.com',
    place: 'Service Center Outlet',
    category: 'Service',
    reason: 'Vehicle Handover Inspection Incomplete',
    description: 'Service checklist marked interior cleaning completed but seats were uncleaned.',
    priority: 'LOW',
    sentiment: 'NEUTRAL',
    rootCause: 'Quality Inspection Checklist Premature Sign-Off',
    deptName: 'Operations',
    suggestedResponse: 'Complimentary detailing service completed.'
  },
  {
    name: 'Layla Edwards',
    email: 'layla.e@pharma.org',
    place: 'Pharmacy Express Branch',
    category: 'Product',
    reason: 'Medicine Packaging Defect',
    description: 'Blister pack missing foil seal on 3 medicine tablets.',
    priority: 'CRITICAL',
    sentiment: 'NEGATIVE',
    rootCause: 'Blister Packing Machine Pressure Glitch',
    deptName: 'Operations',
    suggestedResponse: 'Batch quarantined and replacement provided.'
  },
  {
    name: 'Gabriel Collins',
    email: 'gabriel.c@security.com',
    place: 'User Profile Portal',
    category: 'Account',
    reason: 'Session Expiring Every 2 Minutes',
    description: 'User dashboard logs out automatically every 120 seconds forcing constant re-login.',
    priority: 'MEDIUM',
    sentiment: 'NEGATIVE',
    rootCause: 'Redis Session Store Inactive TTL Setting',
    deptName: 'Technical / IT',
    suggestedResponse: 'Session TTL extended to 8 hours.'
  },
  {
    name: 'Nora Stewart',
    email: 'nora.stewart@travel.com',
    place: 'Airport Pickup Desk',
    category: 'Delivery',
    reason: 'Luggage Express Tag Lost in Transit',
    description: 'Luggage dispatch receipt number not tracked in courier scanner database.',
    priority: 'HIGH',
    sentiment: 'NEGATIVE',
    rootCause: 'Handheld Scanner Offline Data Sync Stalled',
    deptName: 'Logistics',
    suggestedResponse: 'Luggage located and delivered to hotel.'
  },
  {
    name: 'Julian Sanchez',
    email: 'julian.s@networks.io',
    place: 'ISP Customer Portal',
    category: 'Technical Issue',
    reason: 'DNS Resolution Error on Portal Subdomain',
    description: 'Subdomain portal.loop.com fails DNS lookup intermittently from regional ISP networks.',
    priority: 'HIGH',
    sentiment: 'NEGATIVE',
    rootCause: 'Authoritative Nameserver Anycast Routing Anomaly',
    deptName: 'Technical / IT',
    suggestedResponse: 'DNS propagation verified across all regional backbones.'
  },
  {
    name: 'Hazel Morris',
    email: 'hazel.m@apparel.com',
    place: 'Flagship Store #001',
    category: 'Facility',
    reason: 'Elevator Out of Order No Ramp Access',
    description: 'Main elevator disabled for maintenance without wheelchair ramp alternative.',
    priority: 'HIGH',
    sentiment: 'NEGATIVE',
    rootCause: 'Elevator Hydraulic Seal Repair Ongoing',
    deptName: 'Administration',
    suggestedResponse: 'Temporary ADA ramp installed during elevator repair.'
  },
  {
    name: 'Wyatt Rogers',
    email: 'wyatt.r@consulting.net',
    place: 'Online Order Portal',
    category: 'Billing',
    reason: 'Invoice PDF Missing Company Tax ID',
    description: 'Generated PDF invoice missing mandatory VAT registration number required for accounting.',
    priority: 'MEDIUM',
    sentiment: 'NEUTRAL',
    rootCause: 'Invoice Template Formatting Field Omission',
    deptName: 'Finance / Accounts',
    suggestedResponse: 'Re-issued complete tax compliant invoice PDF.'
  },
  {
    name: 'Aurora Reed',
    email: 'aurora.reed@labs.com',
    place: 'West Plaza Branch',
    category: 'Service',
    reason: 'Long Queue at Billing Counter During Opening Hours',
    description: 'Store opened 20 minutes late leaving 30 customers waiting outside in heat.',
    priority: 'LOW',
    sentiment: 'NEGATIVE',
    rootCause: 'Keyholder Transit Delay',
    deptName: 'Customer Service',
    suggestedResponse: 'Backup keyholder protocols instituted for all branch openings.'
  },
  {
    name: 'Lincoln Cook',
    email: 'lincoln.c@finance.org',
    place: 'Credit Support Desk',
    category: 'Payment',
    reason: 'Refund Cheque Bounced Due to Signature Mismatch',
    description: 'Refund cheque issued by finance office rejected by bank due to missing authorized signature.',
    priority: 'CRITICAL',
    sentiment: 'NEGATIVE',
    rootCause: 'Cheque Signatory Specimen Update Delay',
    deptName: 'Finance / Accounts',
    suggestedResponse: 'Direct bank transfer credited immediately to customer account.'
  },
  {
    name: 'Samantha Morgan',
    email: 'samantha.m@media.com',
    place: 'Digital Downloads Portal',
    category: 'Product',
    reason: 'Purchased E-Book Download Link Broken',
    description: 'Clicking download link yields 403 Forbidden file permission error.',
    priority: 'LOW',
    sentiment: 'NEUTRAL',
    rootCause: 'S3 Cloud Storage Pre-signed URL Expiry Header',
    deptName: 'Technical / IT',
    suggestedResponse: 'Download link regenerated with permanent customer library access.'
  },
  {
    name: 'Mateo Bell',
    email: 'mateo.bell@software.io',
    place: 'Cloud Console',
    category: 'Technical Issue',
    reason: 'Cloud Server Instance Provisioning Failure',
    description: 'API call to spin up cloud instance times out after 10 minutes leaving instance in Error state.',
    priority: 'HIGH',
    sentiment: 'NEGATIVE',
    rootCause: 'Hypervisor Node Resource Exhaustion',
    deptName: 'Technical / IT',
    suggestedResponse: 'Node provisioned on high-capacity cluster with SLA credit.'
  }
];

export async function seed50Complaints() {
  console.log('🌱 Seeding 50 Corporate Complaints into LOOP DB...');

  // 1. Ensure Staff Users exist
  const passwordHash = await bcrypt.hash('Analyst@12345', 10);
  const adminHash = await bcrypt.hash('Admin@12345', 10);
  const now = new Date().toISOString();

  const staffUsers = [
    { id: 'usr_admin_01', name: 'System Administrator', email: 'admin@loop.com', role: 'ADMIN', pass: adminHash, plain: 'Admin@12345' },
    { id: 'usr_analyst_01', name: 'Lead Analyst', email: 'analyst@loop.com', role: 'ANALYST', pass: passwordHash, plain: 'Analyst@12345' },
    { id: 'usr_analyst_02', name: 'Analyst Sarah Jenkins', email: 'sarah.analyst@loop.com', role: 'ANALYST', pass: passwordHash, plain: 'Analyst@12345' },
    { id: 'usr_analyst_03', name: 'Analyst Marcus Chen', email: 'marcus.analyst@loop.com', role: 'ANALYST', pass: passwordHash, plain: 'Analyst@12345' },
    { id: 'usr_analyst_04', name: 'Analyst Priya Sharma', email: 'priya.analyst@loop.com', role: 'ANALYST', pass: passwordHash, plain: 'Analyst@12345' }
  ];

  for (const u of staffUsers) {
    const existing = await dbGet('SELECT * FROM staff_users WHERE id = ? OR email = ?', [u.id, u.email]);
    if (!existing) {
      await dbRun(
        `INSERT INTO staff_users (id, name, email, passwordHash, plainPassword, role, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)`,
        [u.id, u.name, u.email, u.pass, u.plain, u.role, now, now]
      );
    } else {
      await dbRun('UPDATE staff_users SET plainPassword = ?, passwordHash = ? WHERE id = ?', [u.plain, u.pass, u.id]);
    }
  }

  const analystsList = ['usr_analyst_01', 'usr_analyst_02', 'usr_analyst_03', 'usr_analyst_04'];

  let count = 0;
  for (let i = 0; i < SAMPLE_COMPLAINTS_DATA.length; i++) {
    const sample = SAMPLE_COMPLAINTS_DATA[i];
    const index = i + 1;
    const complaintId = `cmp_seed_${String(index).padStart(3, '0')}`;
    const complaintNumber = `LOOP-2026-${String(849000 + index)}`;
    const trimmedEmail = sample.email.toLowerCase();

    // Check if complaint already exists
    const existingCmp = await dbGet('SELECT * FROM complaints WHERE id = ? OR complaintNumber = ?', [complaintId, complaintNumber]);
    if (existingCmp) {
      continue;
    }

    // Customer record
    let customer = await dbGet('SELECT * FROM customers WHERE LOWER(email) = ?', [trimmedEmail]);
    if (!customer) {
      const custId = `cust_seed_${index}`;
      await dbRun(
        `INSERT OR IGNORE INTO customers (id, name, email, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, 1, ?, ?)`,
        [custId, sample.name, trimmedEmail, now, now]
      );
      customer = { id: custId, name: sample.name, email: trimmedEmail };
    }

    // Lifecycle division:
    // 1-8: SUBMITTED / AI_ANALYZED (Unassigned in Admin queue)
    // 9-16: IN_PROGRESS (Assigned to usr_analyst_01 - Lead Analyst)
    // 17-24: WAITING_FOR_DEPARTMENT / REPORT_SUBMITTED (Assigned to usr_analyst_01 & others)
    // 25-36: IN_PROGRESS (Distributed across Sarah, Marcus, Priya)
    // 37-50: RESOLVED (Distributed across all analysts with feedback)
    let status = 'SUBMITTED';
    let assignedAnalystId = null;

    if (index >= 9 && index <= 16) {
      status = 'IN_PROGRESS';
      assignedAnalystId = 'usr_analyst_01'; // Lead Analyst
    } else if (index >= 17 && index <= 20) {
      status = 'WAITING_FOR_DEPARTMENT';
      assignedAnalystId = 'usr_analyst_01'; // Lead Analyst
    } else if (index >= 21 && index <= 24) {
      status = 'REPORT_SUBMITTED';
      assignedAnalystId = analystsList[i % analystsList.length];
    } else if (index >= 25 && index <= 36) {
      status = 'IN_PROGRESS';
      assignedAnalystId = analystsList[i % analystsList.length];
    } else if (index >= 37) {
      status = 'RESOLVED';
      assignedAnalystId = analystsList[i % analystsList.length];
    }

    const complaintCreatedAt = new Date(Date.now() - (55 - index) * 3600000 * 3).toISOString();

    const complaintData = {
      id: complaintId,
      complaintNumber,
      customerId: customer.id,
      name: sample.name,
      email: trimmedEmail,
      place: sample.place,
      category: sample.category,
      reason: sample.reason,
      description: sample.description,
      attachmentUrl: (index % 2 === 0) ? `https://loop.com/proofs/receipt_${index}.pdf` : '',
      status,
      createdAt: complaintCreatedAt,
      updatedAt: now
    };

    // 1. Insert Complaint
    await dbRun(
      `INSERT INTO complaints (id, complaintNumber, customerId, name, email, place, category, reason, description, attachmentUrl, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        complaintData.id,
        complaintData.complaintNumber,
        complaintData.customerId,
        complaintData.name,
        complaintData.email,
        complaintData.place,
        complaintData.category,
        complaintData.reason,
        complaintData.description,
        complaintData.attachmentUrl,
        complaintData.status,
        complaintData.createdAt,
        complaintData.updatedAt
      ]
    );

    // 2. Insert AI Analysis
    const aiData = {
      id: `ai_${complaintId}`,
      complaintId,
      sentiment: sample.sentiment || 'NEGATIVE',
      sentimentScore: 0.85,
      category: sample.category,
      theme: sample.reason,
      priority: sample.priority || 'MEDIUM',
      priorityScore: sample.priority === 'CRITICAL' ? 0.95 : sample.priority === 'HIGH' ? 0.80 : 0.60,
      summary: `Automated AI triage verified ${sample.category.toLowerCase()} complaint concerning "${sample.reason}" at ${sample.place}.`,
      keywords: JSON.stringify([sample.category, sample.rootCause.split(' ')[0], 'verified']),
      suggestedResponse: sample.suggestedResponse,
      attachmentAnalyzed: complaintData.attachmentUrl ? 1 : 0,
      attachmentSummary: complaintData.attachmentUrl ? 'Verified customer PDF receipt matching statement parameters.' : 'No document proof submitted.',
      proofMatch: complaintData.attachmentUrl ? 'VERIFIED - Proof Document Matches Statement' : 'UNVERIFIED',
      rootCause: sample.rootCause,
      sectionName: `${sample.category} Section`,
      confidence: 'High (96%)',
      severity: sample.priority === 'CRITICAL' ? 'Critical Impact' : 'Operational Significant',
      urgency: sample.priority === 'CRITICAL' ? 'Immediate 4h SLA' : 'Standard 24h SLA',
      impact: 'Customer Operations',
      affectedScope: 'Individual Account',
      priorityReason: `Classified as ${sample.priority} based on root cause: ${sample.rootCause}.`,
      keyFactors: JSON.stringify(['Verified customer identity', 'Document proof analyzed', 'Department routed']),
      createdAt: complaintData.createdAt,
      updatedAt: now
    };

    await dbRun(
      `INSERT INTO ai_analysis 
       (id, complaintId, sentiment, sentimentScore, category, theme, priority, priorityScore, summary, keywords, suggestedResponse, attachmentAnalyzed, attachmentSummary, proofMatch, rootCause, sectionName, confidence, severity, urgency, impact, affectedScope, priorityReason, keyFactors, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        aiData.id,
        aiData.complaintId,
        aiData.sentiment,
        aiData.sentimentScore,
        aiData.category,
        aiData.theme,
        aiData.priority,
        aiData.priorityScore,
        aiData.summary,
        aiData.keywords,
        aiData.suggestedResponse,
        aiData.attachmentAnalyzed,
        aiData.attachmentSummary,
        aiData.proofMatch,
        aiData.rootCause,
        aiData.sectionName,
        aiData.confidence,
        aiData.severity,
        aiData.urgency,
        aiData.impact,
        aiData.affectedScope,
        aiData.priorityReason,
        aiData.keyFactors,
        aiData.createdAt,
        aiData.updatedAt
      ]
    );

    // 3. Status History Steps
    await dbRun(
      'INSERT INTO complaint_status_history (id, complaintId, status, createdAt) VALUES (?, ?, ?, ?)',
      [`sh_${complaintId}_1`, complaintId, 'SUBMITTED', complaintData.createdAt]
    );
    await dbRun(
      'INSERT INTO complaint_status_history (id, complaintId, status, createdAt) VALUES (?, ?, ?, ?)',
      [`sh_${complaintId}_2`, complaintId, 'AI_ANALYZED', complaintData.createdAt]
    );

    // 4. If Assigned, Record Assignment Action & Status History
    if (assignedAnalystId) {
      const actId = `act_${complaintId}_assign`;
      await dbRun(
        'INSERT INTO complaint_actions (id, complaintId, analystId, action, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [actId, complaintId, assignedAnalystId, 'ASSIGNED_BY_ADMIN', `Assigned to analyst for investigation of ${sample.rootCause}.`, complaintData.createdAt]
      );
      await dbRun(
        'INSERT INTO complaint_status_history (id, complaintId, status, createdAt) VALUES (?, ?, ?, ?)',
        [`sh_${complaintId}_3`, complaintId, 'IN_PROGRESS', complaintData.createdAt]
      );
    }

    // 5. Department Coordination Requests for specific complaints
    if (status === 'WAITING_FOR_DEPARTMENT' || status === 'REPORT_SUBMITTED') {
      const reqId = `dreq_${complaintId}`;
      const deptName = sample.deptName || 'Operations';
      await dbRun(
        `INSERT INTO department_requests (id, complaintId, departmentName, requestedBy, priority, requiredInformation, reason, deadline, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, 'P2', ?, ?, ?, ?, ?, ?)`,
        [
          reqId,
          complaintId,
          deptName,
          assignedAnalystId || 'usr_analyst_01',
          `Verify internal logs, system transaction references, and operational activity regarding "${sample.reason}".`,
          `Case investigation requires department confirmation of ${sample.rootCause}.`,
          new Date(Date.now() + 86400000).toISOString(),
          status === 'REPORT_SUBMITTED' ? 'REPORT_SUBMITTED' : 'PENDING',
          complaintData.createdAt,
          now
        ]
      );

      if (status === 'REPORT_SUBMITTED') {
        await dbRun(
          `INSERT INTO department_reports (id, requestId, complaintId, departmentName, investigationResult, evidence, finding, actionTaken, recommendation, supportingDocs, submittedAt, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `drep_${complaintId}`,
            reqId,
            complaintId,
            deptName,
            `Department internal review completed: Verified logs confirm ${sample.rootCause}.`,
            `Audit log reference TRX-LOG-${849000 + index}`,
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

    // 6. If Resolved, Record Resolution Action, Response, and Customer Feedback Loop
    if (status === 'RESOLVED') {
      const respId = `resp_${complaintId}`;
      const responseText = sample.suggestedResponse || `Dear ${sample.name},\n\nWe have investigated your case regarding "${sample.reason}" at ${sample.place}.\n\nOur team has completed corrective actions and finalized the resolution.\n\nThank you,\nLOOP Resolution Team`;
      
      await dbRun(
        'INSERT OR IGNORE INTO responses (id, complaintId, analystId, responseText, sentAt, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [respId, complaintId, assignedAnalystId || 'usr_analyst_01', responseText, now, now]
      );
      await dbRun(
        'INSERT INTO complaint_actions (id, complaintId, analystId, action, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [`act_${complaintId}_resolve`, complaintId, assignedAnalystId || 'usr_analyst_01', 'RESOLVED_AND_DISPATCHED', 'Official resolution response dispatched to customer email.', now]
      );
      await dbRun(
        'INSERT INTO complaint_status_history (id, complaintId, status, createdAt) VALUES (?, ?, ?, ?)',
        [`sh_${complaintId}_4`, complaintId, 'RESOLVED', now]
      );

      // Customer Feedback Loop (1 to 5 stars)
      const rating = (index % 4 === 0) ? 5 : (index % 3 === 0) ? 4 : 5;
      await dbRun(
        `INSERT OR IGNORE INTO complaint_feedback (id, complaintId, complaintNumber, userEmail, rating, resolvedSatisfaction, feedbackText, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `fb_${complaintId}`,
          complaintId,
          complaintNumber,
          trimmedEmail,
          rating,
          'COMPLETELY_RESOLVED',
          'Prompt resolution and clear transparent updates throughout the case. Thank you!',
          now
        ]
      );
    }

    // 7. Audit Log
    await dbRun(
      'INSERT INTO audit_logs (id, userId, action, entity, entityId, ipAddress, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        `aud_${complaintId}`,
        assignedAnalystId || 'usr_admin_01',
        status === 'RESOLVED' ? 'CASE_RESOLVED' : assignedAnalystId ? 'CASE_ASSIGNED' : 'COMPLAINT_CREATED',
        'complaints',
        complaintId,
        '127.0.0.1',
        complaintData.createdAt
      ]
    );

    count++;
  }

  console.log(`✅ Successfully seeded ${count} complete corporate complaints with assignments and analytics!`);
}

// Allow direct CLI execution: node src/scripts/seed50Complaints.js
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').includes('seed50Complaints.js')) {
  seed50Complaints()
    .then(() => {
      console.log('Seeding complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}
