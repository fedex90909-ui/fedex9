/*
# Seed demo shipments, tracking events, and payments

## Overview
Inserts 5 demo shipments with tracking events and payments so the admin panel
and public tracking page have data to display out of the box. This mirrors
the `ensureSeedData()` function from the localStorage version.

## What gets inserted
- 5 shipments with realistic routes (Memphis→Chicago, LA→NY, London→Atlanta,
  Dallas→Austin, Singapore→SF) and various statuses (created through delivered)
- 15 tracking events (3 per shipment on average, matching the status depth)
- 5 payment records (all marked as `paid`, matching the demo shipments)

## Important Notes
1. All demo shipments have `user_id = NULL` (not tied to a registered account)
2. All demo payments have `user_id = NULL` and `status = 'paid'`
3. Tracking event timestamps are offset backwards from creation time
4. IDs are hardcoded to ensure idempotency on re-run (using ON CONFLICT DO NOTHING)
*/

-- Helper function to generate timestamps offset from a base time
-- We use fixed timestamps relative to now() for the demo data

INSERT INTO shipments (id, user_id, reference, tracking_number, sender, recipient, pkg, option_id, shipping_method, price, status, current_location, estimated_delivery, payment_status, is_demo, created_at, updated_at)
VALUES
('shp_demo_001', NULL, 'FX-KQ7M-P9X2', '794621380054',
 '{"fullName":"Marcus Reed","email":"shipper2@example.com","phone":"+1 555 010 2000","address":"400 Distribution Way","city":"Memphis, TN","state":"—","country":"United States","zip":"00000"}',
 '{"fullName":"Nina Alvarez","email":"recipient2@example.com","phone":"+1 555 010 2001","address":"77 Commerce Street","city":"Chicago, IL","state":"—","country":"United States","zip":"00001"}',
 '{"type":"box","weight":"12.5","length":"14","width":"10","height":"6","description":"General cargo"}',
 'overnight', 'FedEx Overnight', 42.50, 'picked_up', 'Memphis, TN — Origin',
 now() + interval '2 days', 'paid', true,
 now() - interval '2 days', now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO shipments (id, user_id, reference, tracking_number, sender, recipient, pkg, option_id, shipping_method, price, status, current_location, estimated_delivery, payment_status, is_demo, created_at, updated_at)
VALUES
('shp_demo_002', NULL, 'FX-R3K8-V5LJ', '794633827194',
 '{"fullName":"Priya Shah","email":"shipper2@example.com","phone":"+1 555 010 2000","address":"400 Distribution Way","city":"Los Angeles, CA","state":"—","country":"United States","zip":"00000"}',
 '{"fullName":"Tom Becker","email":"recipient2@example.com","phone":"+1 555 010 2001","address":"77 Commerce Street","city":"New York, NY","state":"—","country":"United States","zip":"00001"}',
 '{"type":"parcel","weight":"8.2","length":"14","width":"10","height":"6","description":"General cargo"}',
 '2-day', 'FedEx 2 Day', 28.00, 'in_transit', 'Los Angeles, CA Hub',
 now() + interval '2 days', 'paid', true,
 now() - interval '2 days', now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO shipments (id, user_id, reference, tracking_number, sender, recipient, pkg, option_id, shipping_method, price, status, current_location, estimated_delivery, payment_status, is_demo, created_at, updated_at)
VALUES
('shp_demo_003', NULL, 'FX-T5N2-W8RC', '794651204838',
 '{"fullName":"Oliver Grant","email":"shipper3@example.com","phone":"+1 555 010 2000","address":"400 Distribution Way","city":"London","state":"—","country":"United Kingdom","zip":"00000"}',
 '{"fullName":"Dana Fox","email":"recipient3@example.com","phone":"+1 555 010 2001","address":"77 Commerce Street","city":"Atlanta, GA","state":"—","country":"United States","zip":"00001"}',
 '{"type":"box","weight":"22.0","length":"14","width":"10","height":"6","description":"General cargo"}',
 '3-day', 'FedEx Express Saver', 35.00, 'at_facility', 'Atlanta, GA — Destination Facility',
 now() + interval '3 days', 'paid', true,
 now() - interval '3 days', now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO shipments (id, user_id, reference, tracking_number, sender, recipient, pkg, option_id, shipping_method, price, status, current_location, estimated_delivery, payment_status, is_demo, created_at, updated_at)
VALUES
('shp_demo_004', NULL, 'FX-W8B4-X6ND', '794658912345',
 '{"fullName":"Lena Ortiz","email":"shipper2@example.com","phone":"+1 555 010 2000","address":"400 Distribution Way","city":"Dallas, TX","state":"—","country":"United States","zip":"00000"}',
 '{"fullName":"Chris Wang","email":"recipient2@example.com","phone":"+1 555 010 2001","address":"77 Commerce Street","city":"Austin, TX","state":"—","country":"United States","zip":"00001"}',
 '{"type":"document","weight":"1.1","length":"14","width":"10","height":"6","description":"General cargo"}',
 'same-day', 'FedEx Same Day', 65.00, 'out_for_delivery', 'Austin, TX — Local Station',
 now() + interval '0 days', 'paid', true,
 now() - interval '2 days', now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO shipments (id, user_id, reference, tracking_number, sender, recipient, pkg, option_id, shipping_method, price, status, current_location, estimated_delivery, payment_status, is_demo, created_at, updated_at)
VALUES
('shp_demo_005', NULL, 'FX-Y2C7-Q4RG', '794677104296',
 '{"fullName":"Wei Lin","email":"shipper4@example.com","phone":"+1 555 010 2000","address":"400 Distribution Way","city":"Singapore","state":"—","country":"Singapore","zip":"00000"}',
 '{"fullName":"Sarah Kim","email":"recipient4@example.com","phone":"+1 555 010 2001","address":"77 Commerce Street","city":"San Francisco, CA","state":"—","country":"United States","zip":"00001"}',
 '{"type":"parcel","weight":"15.8","length":"14","width":"10","height":"6","description":"General cargo"}',
 '3-day', 'FedEx Express Saver', 38.00, 'delivered', 'San Francisco, CA — Final Mile',
 now() + interval '4 days', 'paid', true,
 now() - interval '4 days', now()
) ON CONFLICT (id) DO NOTHING;

-- Tracking events for each demo shipment
-- Shipment 1: depth 0 (created only)
INSERT INTO tracking_events (id, shipment_id, status, location, note, timestamp, source)
VALUES
('evt_d001_1', 'shp_demo_001', 'created', 'Memphis, TN — Origin', 'Shipping label created. Shipment information received.', now() - interval '2 days', 'system')
ON CONFLICT (id) DO NOTHING;

-- Shipment 2: depth 2 (created, picked_up, in_transit)
INSERT INTO tracking_events (id, shipment_id, status, location, note, timestamp, source)
VALUES
('evt_d002_1', 'shp_demo_002', 'created', 'Los Angeles, CA — Origin', 'Shipping label created. Shipment information received.', now() - interval '2 days', 'system'),
('evt_d002_2', 'shp_demo_002', 'picked_up', 'Los Angeles, CA — Origin', 'Picked up by FedEx courier and scanned into the network.', now() - interval '48 hours', 'system'),
('evt_d002_3', 'shp_demo_002', 'in_transit', 'Los Angeles, CA Hub', 'Departed origin facility. In transit to destination.', now() - interval '30 hours', 'system')
ON CONFLICT (id) DO NOTHING;

-- Shipment 3: depth 3 (created, picked_up, in_transit, at_facility)
INSERT INTO tracking_events (id, shipment_id, status, location, note, timestamp, source)
VALUES
('evt_d003_1', 'shp_demo_003', 'created', 'London — Origin', 'Shipping label created. Shipment information received.', now() - interval '3 days', 'system'),
('evt_d003_2', 'shp_demo_003', 'picked_up', 'London — Origin', 'Picked up by FedEx courier and scanned into the network.', now() - interval '54 hours', 'system'),
('evt_d003_3', 'shp_demo_003', 'in_transit', 'London Hub', 'Departed origin facility. In transit to destination.', now() - interval '48 hours', 'system'),
('evt_d003_4', 'shp_demo_003', 'at_facility', 'Atlanta, GA — Destination Facility', 'Arrived at destination FedEx facility. Sorted and staged.', now() - interval '30 hours', 'system')
ON CONFLICT (id) DO NOTHING;

-- Shipment 4: depth 4 (created, picked_up, in_transit, at_facility, out_for_delivery)
INSERT INTO tracking_events (id, shipment_id, status, location, note, timestamp, source)
VALUES
('evt_d004_1', 'shp_demo_004', 'created', 'Dallas, TX — Origin', 'Shipping label created. Shipment information received.', now() - interval '2 days', 'system'),
('evt_d004_2', 'shp_demo_004', 'picked_up', 'Dallas, TX — Origin', 'Picked up by FedEx courier and scanned into the network.', now() - interval '48 hours', 'system'),
('evt_d004_3', 'shp_demo_004', 'in_transit', 'Dallas, TX Hub', 'Departed origin facility. In transit to destination.', now() - interval '30 hours', 'system'),
('evt_d004_4', 'shp_demo_004', 'at_facility', 'Austin, TX — Destination Facility', 'Arrived at destination FedEx facility. Sorted and staged.', now() - interval '12 hours', 'system'),
('evt_d004_5', 'shp_demo_004', 'out_for_delivery', 'Austin, TX — Local Station', 'On vehicle for final delivery.', now() - interval '3 hours', 'system')
ON CONFLICT (id) DO NOTHING;

-- Shipment 5: depth 5 (all 6 events including delivered)
INSERT INTO tracking_events (id, shipment_id, status, location, note, timestamp, source)
VALUES
('evt_d005_1', 'shp_demo_005', 'created', 'Singapore — Origin', 'Shipping label created. Shipment information received.', now() - interval '4 days', 'system'),
('evt_d005_2', 'shp_demo_005', 'picked_up', 'Singapore — Origin', 'Picked up by FedEx courier and scanned into the network.', now() - interval '96 hours', 'system'),
('evt_d005_3', 'shp_demo_005', 'in_transit', 'Singapore Hub', 'Departed origin facility. In transit to destination.', now() - interval '78 hours', 'system'),
('evt_d005_4', 'shp_demo_005', 'at_facility', 'San Francisco, CA — Destination Facility', 'Arrived at destination FedEx facility. Sorted and staged.', now() - interval '30 hours', 'system'),
('evt_d005_5', 'shp_demo_005', 'out_for_delivery', 'San Francisco, CA — Local Station', 'On vehicle for final delivery.', now() - interval '4 hours', 'system'),
('evt_d005_6', 'shp_demo_005', 'delivered', 'San Francisco, CA — Final Mile', 'Delivered. Signature captured at the door.', now() - interval '1 hour', 'system')
ON CONFLICT (id) DO NOTHING;

-- Payments for each demo shipment
INSERT INTO payments (id, shipment_id, user_id, method, amount, status, reference, card, created_at, updated_at)
VALUES
('pay_demo_001', 'shp_demo_001', NULL, 'card', 42.50, 'paid', 'PAY-KQ7M-P9X2',
 '{"cardholder":"Marcus Reed","masked":"•••• •••• •••• 4242","last4":"4242","expiry":"12/28"}',
 now() - interval '2 days', now() - interval '2 days'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO payments (id, shipment_id, user_id, method, amount, status, reference, card, created_at, updated_at)
VALUES
('pay_demo_002', 'shp_demo_002', NULL, 'card', 28.00, 'paid', 'PAY-R3K8-V5LJ',
 '{"cardholder":"Priya Shah","masked":"•••• •••• •••• 4242","last4":"4242","expiry":"12/28"}',
 now() - interval '2 days', now() - interval '2 days'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO payments (id, shipment_id, user_id, method, amount, status, reference, card, created_at, updated_at)
VALUES
('pay_demo_003', 'shp_demo_003', NULL, 'card', 35.00, 'paid', 'PAY-T5N2-W8RC',
 '{"cardholder":"Oliver Grant","masked":"•••• •••• •••• 4242","last4":"4242","expiry":"12/28"}',
 now() - interval '3 days', now() - interval '3 days'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO payments (id, shipment_id, user_id, method, amount, status, reference, card, created_at, updated_at)
VALUES
('pay_demo_004', 'shp_demo_004', NULL, 'card', 65.00, 'paid', 'PAY-W8B4-X6ND',
 '{"cardholder":"Lena Ortiz","masked":"•••• •••• •••• 4242","last4":"4242","expiry":"12/28"}',
 now() - interval '2 days', now() - interval '2 days'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO payments (id, shipment_id, user_id, method, amount, status, reference, card, created_at, updated_at)
VALUES
('pay_demo_005', 'shp_demo_005', NULL, 'card', 38.00, 'paid', 'PAY-Y2C7-Q4RG',
 '{"cardholder":"Wei Lin","masked":"•••• •••• •••• 4242","last4":"4242","expiry":"12/28"}',
 now() - interval '4 days', now() - interval '4 days'
) ON CONFLICT (id) DO NOTHING;
