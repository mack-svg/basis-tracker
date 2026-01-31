-- Iowa Grain Facilities Seed Data
-- Major companies with verified addresses

INSERT INTO facilities (name, company, city, state, address, lat, lng, is_verified) VALUES
-- Cargill Locations (from cargillag.com)
('Cargill Bettendorf', 'Cargill', 'Bettendorf', 'IA', '2655 Depot St', 41.5317, -90.4785, true),
('Cargill Cedar Rapids Mill', 'Cargill', 'Cedar Rapids', 'IA', '1710 16th St SE', 41.9690, -91.6480, true),
('Cargill Eddyville', 'Cargill', 'Eddyville', 'IA', '17540 Monroe Wapello Rd', 41.1565, -92.6370, true),
('Cargill Muscatine', 'Cargill', 'Muscatine', 'IA', '700 Oregon St', 41.4186, -91.0651, true),
('Cargill Davenport', 'Cargill', 'Davenport', 'IA', '607 Schmidt Rd', 41.5428, -90.5687, true),
('Cargill Cedar Rapids East (Crush)', 'Cargill', 'Cedar Rapids', 'IA', '410 C Ave NE', 41.9850, -91.6580, true),
('Cargill Iowa Falls (Crush)', 'Cargill', 'Iowa Falls', 'IA', '602 Industrial Rd', 42.5175, -93.2680, true),
('Cargill Sioux City (Crush)', 'Cargill', 'Sioux City', 'IA', '980 Clark St', 42.4850, -96.3920, true),

-- ADM Locations (from Iowa Dept of Ag licensed dealers)
('ADM Corn Processing', 'ADM', 'Cedar Rapids', 'IA', '1350 Waconia Ave SW', 41.9580, -91.6750, true),
('ADM Grain Clinton', 'ADM', 'Clinton', 'IA', '2200 S 2nd St', 41.8280, -90.2180, true),
('ADM Grain Burlington', 'ADM', 'Burlington', 'IA', '3333 Agency St', 40.7970, -91.1370, true),
('ADM Processing Des Moines', 'ADM', 'Des Moines', 'IA', '2201 SE 8th St', 41.5720, -93.5980, true),

-- Major Iowa Cooperatives
('Heartland Co-op Waukee', 'Heartland Co-op', 'Waukee', 'IA', '205 Warrior Ln', 41.6090, -93.8780, true),
('Heartland Co-op Slater', 'Heartland Co-op', 'Slater', 'IA', '210 Railroad St', 41.8790, -93.6850, true),
('Heartland Co-op Nevada', 'Heartland Co-op', 'Nevada', 'IA', '1030 Lincoln Hwy', 42.0230, -93.4520, true),
('Heartland Co-op Prairie City', 'Heartland Co-op', 'Prairie City', 'IA', '121 W Jefferson St', 41.5990, -93.2350, true),

('Landus Cooperative Ames', 'Landus Cooperative', 'Ames', 'IA', '2323 N Loop Dr', 42.0550, -93.6190, true),
('Landus Cooperative Jefferson', 'Landus Cooperative', 'Jefferson', 'IA', '1500 N Elm St', 42.0280, -94.3850, true),
('Landus Cooperative Boone', 'Landus Cooperative', 'Boone', 'IA', '1928 Industrial Park Rd', 42.0650, -93.8680, true),

('NEW Cooperative Fort Dodge', 'NEW Cooperative', 'Fort Dodge', 'IA', '1902 Central Ave', 42.5150, -94.1680, true),
('NEW Cooperative Manson', 'NEW Cooperative', 'Manson', 'IA', '712 Main St', 42.5290, -94.5350, true),
('NEW Cooperative Goldfield', 'NEW Cooperative', 'Goldfield', 'IA', '314 E Main St', 42.7390, -93.9210, true),

('Farmers Cooperative Farnhamville', 'Farmers Cooperative', 'Farnhamville', 'IA', '107 Main St', 42.2780, -94.4090, true),
('Farmers Cooperative Gowrie', 'Farmers Cooperative', 'Gowrie', 'IA', '1205 Market St', 42.2810, -94.2890, true),

('Key Cooperative Grinnell', 'Key Cooperative', 'Grinnell', 'IA', '1111 West St S', 41.7350, -92.7380, true),
('Key Cooperative Roland', 'Key Cooperative', 'Roland', 'IA', '109 N Main St', 42.1660, -93.5010, true),
('Key Cooperative State Center', 'Key Cooperative', 'State Center', 'IA', '113 2nd St NE', 42.0170, -93.1630, true),

('Five Star Cooperative New Hampton', 'Five Star Cooperative', 'New Hampton', 'IA', '101 Industrial Dr', 43.0590, -92.3180, true),
('Five Star Cooperative Cresco', 'Five Star Cooperative', 'Cresco', 'IA', '500 2nd Ave SE', 43.3770, -92.1140, true),

('Cooperative Farmers Elevator Hanover', 'CFE', 'Hanover', 'IA', '102 Center St', 43.0820, -94.6380, true),
('Cooperative Farmers Elevator Wesley', 'CFE', 'Wesley', 'IA', '309 Main St', 43.0890, -94.0030, true),

-- Bunge (major grain trader)
('Bunge Council Bluffs', 'Bunge', 'Council Bluffs', 'IA', '3800 9th Ave', 41.2280, -95.8520, true),

-- CHS (major cooperative)
('CHS Primghar', 'CHS', 'Primghar', 'IA', '140 S Birch St', 43.0870, -95.6270, true),
('CHS Sioux City', 'CHS', 'Sioux City', 'IA', '2801 Hawkeye Ave', 42.4350, -96.3680, true)

ON CONFLICT DO NOTHING;
