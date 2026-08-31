import dotenv from 'dotenv';
dotenv.config();

const BACKEND_URL = 'https://loop-backend-ahtf.onrender.com/api';

const COMPLAINT_TOPICS = [
  { cat: 'Payment', reason: 'Duplicate Credit Card Charge on POS Terminal', desc: 'Card swiped twice at checkout register #4 due to terminal timeout. Charged $148.50 twice.' },
  { cat: 'Payment', reason: 'UPI Payment Deducted But Merchant Transaction Failed', desc: 'Bank debited $95 via UPI but merchant terminal timed out and gave failure slip #TRX-9482.' },
  { cat: 'Payment', reason: 'Promotional Discount Voucher Not Applied', desc: 'Entered coupon PROMO25 at payment gateway but full price $200 was billed without discount.' },
  { cat: 'Payment', reason: 'Unauthorized Recurring Card Charge', desc: 'Card charged $49.99 monthly fee even though subscription was cancelled 2 weeks prior.' },
  { cat: 'Payment', reason: 'Refund Cheque Returned With Signature Mismatch', desc: 'Corporate refund cheque of $450 bounced at bank due to missing authorized sign.' },
  { cat: 'Payment', reason: 'Overcharged Sales Tax on Tax-Exempt Order', desc: 'Charged 18% GST instead of 0% tax on registered corporate tax-exempt order #84920.' },
  { cat: 'Payment', reason: 'International Currency Conversion Surcharge Undisclosed', desc: 'Charged 4.5% foreign transaction fee without any notice on domestic card.' },
  { cat: 'Payment', reason: 'Store Credit Balance Disappeared After System Update', desc: 'My $120 store gift credit balance shows $0.00 following website maintenance.' },
  { cat: 'Payment', reason: 'Contactless Tap to Pay Charged Incorrect Amount', desc: 'Tapped NFC card for $15 coffee order, terminal charged $150 due to decimal bug.' },
  { cat: 'Payment', reason: 'Delayed Bank Account Refund Exceeding 14 Days', desc: 'Return approved on 10th with 3-day refund SLA. Still no funds in bank after 16 days.' },

  { cat: 'Technical Issue', reason: 'Payment Gateway 504 Gateway Timeout During Checkout', desc: 'Checkout page crashed on payment verification step. Order status shows Unconfirmed.' },
  { cat: 'Technical Issue', reason: 'iOS App Force Closes on Account Dashboard Open', desc: 'iOS App v3.4.1 crashes on launch whenever user profile picture loads.' },
  { cat: 'Technical Issue', reason: 'Android Push Notifications Cannot Be Disabled', desc: 'Notification preference toggle resets to Enabled upon closing app.' },
  { cat: 'Technical Issue', reason: 'SMS OTP Code Arrives After 20 Minute Expiration Limit', desc: 'Verification SMS delayed by carrier routing; OTP always expires before entry.' },
  { cat: 'Technical Issue', reason: 'REST API Bearer Token Expiring in 30 Seconds', desc: 'OAuth token expires almost immediately breaking automated ERP data integrations.' },
  { cat: 'Technical Issue', reason: 'Data Export Feature Generates Corrupted Empty CSV', desc: 'Exporting quarterly analytics produces a 0-byte file with syntax error header.' },
  { cat: 'Technical Issue', reason: 'Two-Factor Authentication Infinite Redirect Loop', desc: 'Entering valid authenticator code reloads login page without session token.' },
  { cat: 'Technical Issue', reason: 'PDF Invoice Download Link Gives 403 Forbidden', desc: 'Clicking download invoice in billing history returns permission denied error.' },
  { cat: 'Technical Issue', reason: 'SSL Certificate Warning Displayed on Checkout', desc: 'Browser warns connection is not private due to intermediate certificate mismatch.' },
  { cat: 'Technical Issue', reason: 'Customer Profile Session Disconnects Every 90 Seconds', desc: 'Dashboard logs out automatically while typing support responses.' },

  { cat: 'Delivery', reason: 'Package Marked Delivered But Not Received at Door', desc: 'Tracking says delivered at 10 AM, but doorbell camera and security show no delivery truck.' },
  { cat: 'Delivery', reason: 'Damaged Item Package Delivered With Broken Seals', desc: 'Outer cardboard box crushed and internal protective seals torn with product leakage.' },
  { cat: 'Delivery', reason: 'Courier Tossed Fragile Glassware Over Perimeter Gate', desc: 'Driver threw fragile package over 7ft security gate causing full item breakage.' },
  { cat: 'Delivery', reason: 'Partial Shipment Arrived Missing 3 Out of 5 Ordered Items', desc: 'Packing slip marked complete but parcel contained only 2 items out of 5.' },
  { cat: 'Delivery', reason: 'Guaranteed 24-Hour Express Delivery Delayed by 4 Days', desc: 'Paid $50 priority fee for urgent medical supplies; shipment took 96 hours.' },
  { cat: 'Delivery', reason: 'Perishable Goods Delivered Thawed and Spoiled', desc: 'Frozen food order delivered with melted dry ice and spoiled contents.' },
  { cat: 'Delivery', reason: 'Delivery Driver Demanded Extra Cash Surcharge at Door', desc: 'Courier driver refused to hand over prepaid package without unauthorized $20 cash fee.' },
  { cat: 'Delivery', reason: 'Wrong Customer Name and Address On Shipping Label', desc: 'Received a completely different customer parcel with invoice attached.' },
  { cat: 'Delivery', reason: 'Signature Forged on High-Value Delivery Confirmation', desc: 'Courier marked parcel signed by customer while customer was out of the country.' },
  { cat: 'Delivery', reason: 'Freight Cargo Pallet Missing Delivery Appointment', desc: 'Warehouse forklift team waited 4 hours; truck never arrived at loading dock.' },

  { cat: 'Product', reason: 'Electronic Hardware Unit Dead on Arrival Out of Box', desc: 'Brand new device fails to power on; internal power supply blinks error code red.' },
  { cat: 'Product', reason: 'Expired Food Product Sold in Store Inventory', desc: 'Purchased product had best-before date expired 6 days prior to purchase.' },
  { cat: 'Product', reason: 'Medicine Blister Pack Missing Foil Seal on Tablets', desc: 'Pharmaceutical packaging compromised with open foil exposing 4 capsules.' },
  { cat: 'Product', reason: 'Appliance Emitting Burning Plastic Odor on First Use', desc: 'Microwave oven plastic insulation melting on first 2-minute cycle.' },
  { cat: 'Product', reason: 'Battery Swelling and Pushing Out Laptop Trackpad', desc: 'Lithium battery swelling noticed after 3 months, warping casing.' },
  { cat: 'Product', reason: 'Sharp Burr on Metal Handle Created Cut Hazard', desc: 'Unfinished sharp metal edge on kettle handle cut customer finger.' },
  { cat: 'Product', reason: 'Software Activation License Key Already In Use', desc: 'Purchased retail boxed software; license key gives Error: Activated by Another User.' },
  { cat: 'Product', reason: 'Missing Hardware Screws and User Assembly Guide', desc: 'Table flat-pack missing main bolt package and instruction booklet.' },
  { cat: 'Product', reason: 'Touchscreen Digitizer Has Dead Zones and Ghost Touches', desc: 'Tablet screen does not register touch on left 25% of display area.' },
  { cat: 'Product', reason: 'Broken Zipper on Luxury Travel Bag', desc: 'Main compartment zipper split open on first use at airport.' },

  { cat: 'Service', reason: 'Store Manager Refused Valid Return With Purchase Receipt', desc: 'Manager refused return within 14-day policy window claiming item was open box.' },
  { cat: 'Service', reason: 'Customer Service Call Disconnected After 45 Min On Hold', desc: 'Held on queue for 45 minutes before IVR automatically hung up without agent.' },
  { cat: 'Service', reason: 'Support Ticket Closed As Resolved Without Any Action', desc: 'Ticket #9401 closed automatically with generic reply while bug remains unfixed.' },
  { cat: 'Service', reason: 'Rude and Unhelpful Attitude From Billing Help Desk', desc: 'Support rep laughed and dismissed billing inquiry when asked about overcharge.' },
  { cat: 'Service', reason: 'Counter Staff Left Service Desk Unattended for 30 Mins', desc: 'Long line formed with no staff present during official business hours.' },
  { cat: 'Service', reason: 'Staff Refused to Assist Disabled Customer With Wheelchair', desc: 'Store entrance lacked ramp and staff refused to assist customer over steps.' },
  { cat: 'Service', reason: 'Wrong Customer Records Disclosed Over Phone Support', desc: 'Agent read out confidential account address belonging to another customer.' },
  { cat: 'Service', reason: 'Store Opened 30 Minutes Late Leaving Queue Outside', desc: 'Branch opened late in rain leaving morning customers waiting.' },
  { cat: 'Service', reason: 'Repeated Automated Survey Calls Received Late at Night', desc: 'Received 4 automated feedback robocalls between 11 PM and 2 AM.' },
  { cat: 'Service', reason: 'Vehicle Service Checklist Marked Done But Uncompleted', desc: 'Invoice billed for oil filter change and interior clean; neither was done.' },

  { cat: 'Billing', reason: 'Invoice Missing Mandatory Company Tax ID', desc: 'PDF invoice missing VAT number required for corporate expense reconciliation.' },
  { cat: 'Billing', reason: 'Billed for Cancelled Service Add-On Package', desc: 'Invoice includes $30 cloud backup add-on that was removed last month.' },
  { cat: 'Billing', reason: 'Hidden Processing Surcharge Added at Final Payment', desc: 'Added unexpected $25 handling surcharge not disclosed on item pricing page.' },
  { cat: 'Billing', reason: 'Double Invoicing for Single Annual Contract', desc: 'Received two separate invoices with different invoice numbers for same term.' },
  { cat: 'Billing', reason: 'Currency Billed in EUR Instead of USD Account Default', desc: 'Credit card billed in EUR with unfavorable conversion rate for US customer.' },
  { cat: 'Billing', reason: 'Late Fee Applied Despite On-Time Payment Settlement', desc: 'Account hit with $35 penalty although payment cleared 3 days before due date.' },
  { cat: 'Billing', reason: 'Itemized Invoice Calculations Do Not Add Up to Total', desc: 'Sum of line items is $450 but invoice summary displays $520.' },
  { cat: 'Billing', reason: 'Prepaid Account Credits Not Deducted from Invoice', desc: 'Invoice charged full card balance ignoring $100 existing wallet credits.' },
  { cat: 'Billing', reason: 'Enterprise Volume Tier Discount Removed Erroneously', desc: 'Account downgraded from Tier 3 enterprise rate to Tier 1 retail rate.' },
  { cat: 'Billing', reason: 'Direct Debit Withdrawn 5 Days Before Agreed Billing Date', desc: 'Bank account debited on 20th causing overdraft fees; scheduled date was 25th.' },

  { cat: 'Account', reason: 'Personal Details of Another User Displayed on My Profile', desc: 'Dashboard loads another customer home address and order history.' },
  { cat: 'Account', reason: 'Unable to Reset Password Due to Broken Expired Link', desc: 'Password reset email link throws 404 page expired error immediately.' },
  { cat: 'Account', reason: 'Account Locked Due to Automated Security Flag', desc: 'Account locked for 4 days after logging in from hotel WiFi while traveling.' },
  { cat: 'Account', reason: '2FA Recovery Backup Codes Not Working', desc: 'Lost phone; entered valid emergency backup codes but system says Invalid.' },
  { cat: 'Account', reason: 'Unrecognized Device Login Detected Without Security Alert', desc: 'Found active foreign login session with no email alert dispatched.' },
  { cat: 'Account', reason: 'Corporate Domain SSO Integration Refuses Connection', desc: 'SAML SSO integration fails with signature validation error.' },
  { cat: 'Account', reason: 'Spam Messages Sent From Compromised User Account', desc: 'Customer received spam notification originating from internal support account.' },
  { cat: 'Account', reason: 'Phone Number Verification SMS Limit Exceeded Lockout', desc: 'System locked account after 1 SMS attempt claiming rate limit reached.' },
  { cat: 'Account', reason: 'Billing Role Permissions Lost After Plan Upgrade', desc: 'Account owner lost ability to view invoices after upgrading subscription.' },
  { cat: 'Account', reason: 'Privacy Policy Consent Modal Loops on Every Page Load', desc: 'Clicking Accept on cookie banner does not persist choice.' },

  { cat: 'Safety', reason: 'Wet Floor Hazard in Shopping Aisle Without Warning Sign', desc: 'Freshly mopped floor with no warning cones; customer slipped near entrance.' },
  { cat: 'Safety', reason: 'Emergency Fire Exit Door Blocked by Inventory Pallets', desc: 'Warehouse stacked boxes blocking main fire egress door in store.' },
  { cat: 'Safety', reason: 'Exposed High-Voltage Electrical Extension Cord in Aisle', desc: 'Uncovered power wire running across customer checkout walkway.' },
  { cat: 'Facility', reason: 'Air Conditioning Broken in Customer Lounge During Heatwave', desc: 'Indoor customer waiting area temperature exceeding 36C with no fans.' },
  { cat: 'Facility', reason: 'Main Customer Elevator Out of Order With No Ramp Access', desc: 'Disabled customer unable to reach 2nd floor service counter.' },
  { cat: 'Safety', reason: 'Broken Glass on Parking Lot Walkway Left Uncleaned', desc: 'Shattered glass bottle in parking aisle causing tire and pedestrian hazard.' },
  { cat: 'Facility', reason: 'Customer Restrooms Out of Order and Unsanitary', desc: 'Water leak in 1st floor restroom leaving toilets locked for 3 days.' },
  { cat: 'Facility', reason: 'Parking Barrier Arm Struck Customer Vehicle Roof', desc: 'Automated barrier arm came down prematurely denting car roof.' },
  { cat: 'Safety', reason: 'Unsecured Shelf Unit Wobbly and Leaning Toward Aisle', desc: 'Heavy merchandise shelf unstable creating potential tipping hazard.' },
  { cat: 'Facility', reason: 'Automatic Sliding Entrance Doors Jamming Shut on Patrons', desc: 'Motion sensor delayed; glass door closed while customer was walking through.' }
];

const CUSTOMERS = [
  { name: 'Emily Watson', email: 'emily.watson@gmail.com', place: 'Downtown Hub #101' },
  { name: 'David Miller', email: 'david.miller@techcorp.io', place: 'Online Portal' },
  { name: 'Sophia Martinez', email: 'sophia.m@designs.com', place: 'Metro Center' },
  { name: 'James Wilson', email: 'j.wilson89@yahoo.com', place: 'Westside Branch' },
  { name: 'Olivia Taylor', email: 'olivia.t@gmail.com', place: 'Customer Portal' },
  { name: 'Robert Chen', email: 'robert.chen@consulting.com', place: 'Airport Terminal Store' },
  { name: 'Emma Davis', email: 'emma.davis@healthnet.org', place: 'North Plaza Branch' },
  { name: 'Michael Brown', email: 'm.brown@logistics.net', place: 'Express Logistics Hub' },
  { name: 'Ava Johnson', email: 'ava.johnson@studio.com', place: 'Mobile iOS Application' },
  { name: 'William Anderson', email: 'w.anderson@firm.com', place: 'Central Business Hub' }
];

const STAFF_ANALYSTS = [
  { name: 'Lead Analyst Alex Rivera', email: 'analyst@loop.com', role: 'ANALYST' },
  { name: 'Sarah Jenkins', email: 'sarah.analyst@loop.com', role: 'ANALYST' },
  { name: 'Marcus Chen', email: 'marcus.analyst@loop.com', role: 'ANALYST' },
  { name: 'Priya Sharma', email: 'priya.analyst@loop.com', role: 'ANALYST' },
  { name: 'David Miller', email: 'david.analyst@loop.com', role: 'ANALYST' },
  { name: 'Elena Rostova', email: 'elena.analyst@loop.com', role: 'ANALYST' },
  { name: 'James Wilson', email: 'james.analyst@loop.com', role: 'ANALYST' },
  { name: 'Amina Diallo', email: 'amina.analyst@loop.com', role: 'ANALYST' },
  { name: 'Lucas Silva', email: 'lucas.analyst@loop.com', role: 'ANALYST' },
  { name: 'Rachel Green', email: 'rachel.analyst@loop.com', role: 'ANALYST' },
  { name: 'Vikram Patel', email: 'vikram.analyst@loop.com', role: 'ANALYST' }
];

async function seedLiveComplaints() {
  console.log('Connecting to Live Render Backend at:', BACKEND_URL);
  const login = await fetch(BACKEND_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@loop.com', password: 'Admin@12345' })
  }).then(r => r.json());

  if (!login.success) {
    throw new Error('Admin login failed: ' + (login.error || 'Check credentials'));
  }

  const token = login.token;
  console.log('Admin authenticated.');

  // Check if seed endpoint is live
  try {
    const directSeed = await fetch(BACKEND_URL + '/seed-database', { method: 'POST' }).then(r => r.json());
    if (directSeed.success) {
      console.log('⚡ Live Render server executed direct database seed successfully:', directSeed.message);
      return;
    }
  } catch (e) {}

  // Otherwise, ensure all 11 staff analysts exist
  const usersRes = await fetch(BACKEND_URL + '/admin/users', {
    headers: { 'Authorization': 'Bearer ' + token }
  }).then(r => r.json());

  const existingUsers = usersRes.users || [];
  console.log(`Currently found ${existingUsers.length} users on live backend.`);

  for (const analyst of STAFF_ANALYSTS) {
    const exists = existingUsers.some(u => u.email.toLowerCase() === analyst.email.toLowerCase());
    if (!exists) {
      console.log(`Creating analyst: ${analyst.name} (${analyst.email})...`);
      await fetch(BACKEND_URL + '/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: analyst.name,
          email: analyst.email,
          role: 'ANALYST',
          password: 'Analyst@12345'
        })
      });
    }
  }

  // Refetch analysts
  const updatedUsersRes = await fetch(BACKEND_URL + '/admin/users', {
    headers: { 'Authorization': 'Bearer ' + token }
  }).then(r => r.json());

  const liveAnalysts = (updatedUsersRes.users || []).filter(u => u.role === 'ANALYST');
  console.log(`Verified ${liveAnalysts.length} active operational analysts on Render.`);

  // Create 135 complaints
  const TOTAL_TARGET = 135;
  let count = 0;

  for (let i = 0; i < TOTAL_TARGET; i++) {
    const topic = COMPLAINT_TOPICS[i % COMPLAINT_TOPICS.length];
    const cust = CUSTOMERS[i % CUSTOMERS.length];
    const emailNum = Math.floor(i / CUSTOMERS.length) + 1;
    const uniqueEmail = emailNum === 1 ? cust.email : `${cust.email.split('@')[0]}_${emailNum}@${cust.email.split('@')[1]}`;

    // 1. Submit Complaint
    const submitRes = await fetch(BACKEND_URL + '/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: cust.name,
        email: uniqueEmail,
        place: cust.place,
        category: topic.cat,
        reason: `${topic.reason} (Case #${i + 1})`,
        description: topic.desc,
        attachmentUrl: (i % 2 === 0) ? `https://loop.com/proofs/receipt_${i + 1}.pdf` : ''
      })
    }).then(r => r.json());

    if (submitRes.success && submitRes.complaint) {
      const compId = submitRes.complaint.id;
      count++;

      // Assign across analysts (first 25 unassigned in incoming queue, rest assigned)
      if (i >= 25 && liveAnalysts.length > 0) {
        const assignedAnalyst = liveAnalysts[i % liveAnalysts.length];
        await fetch(`${BACKEND_URL}/admin/complaints/${compId}/assign`, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ analystId: assignedAnalyst.id })
        });
      }

      if (count % 15 === 0 || count === TOTAL_TARGET) {
        console.log(`Progress: ${count}/${TOTAL_TARGET} complaints created and distributed.`);
      }
    }
  }

  console.log(`\n🎉 Successfully populated ${count} live complaints across ${liveAnalysts.length} staff analysts!`);
}

seedLiveComplaints().catch(console.error);

