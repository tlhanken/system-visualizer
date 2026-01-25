
import { ReadinessStatus, SystemNode, Workspace } from '../types';

export const MARS_ROVER_HIERARCHY: SystemNode = {
  id: 'ROV-001',
  name: 'Example - Mars Rover',
  owner: 'Dr. Marcus Thorne',
  status: ReadinessStatus.IN_PROGRESS,
  imageUrl: 'https://picsum.photos/seed/rover/600/400',
  testAssets: [
    { id: 'T-001', name: 'Chassis Stress Stand', status: ReadinessStatus.AVAILABLE, description: 'Bay 1 Structural Lab' }
  ],
  subsystems: [
    {
      id: 'MCU-001',
      name: 'Main Control Unit',
      owner: 'Sarah Chen',
      status: ReadinessStatus.AVAILABLE,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtRhryxS0ib9wEYfnYK4FgvoyLoGBNcbnVf_3-jEv-pBo1G_ClIr8BakKMv9NyJmPuqBSr02OcUjt2WbhSA0EO_2vSSIsbww345VYoNvfCFQ6Dsuax25a_Tm2ymftzgkYZM-ytuQHTo-UxuA4zGoBP_f-IBLjeFGxmsUV0bb36MjvzjmAeLEGZ9EXQD3Q-21ZLr1uN1OcKXIGKaSoH_enRcOI63nLxbs5fqA89a-Fhld-CzhV-eFGIL6_TzPo3tq-irPPB_hgRhvk',
      testAssets: [
        { id: 'T-002', name: 'Software Integration Bench', status: ReadinessStatus.AVAILABLE, description: 'Zone 5 Dev Lab' }
      ],
      subsystems: [
        {
          id: 'AUX-012',
          name: 'Auxiliary Battery Unit',
          owner: 'Dr. Elena Volkov',
          status: ReadinessStatus.IN_PROGRESS,
          imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6E-sYJ2j72HuPEF4eI3aZzok1TrkI-kiJ8WRKVz_4pOjKWGuZYGaQfdJkpNHu1eivCiDFtxGAPfw3OrOPUfwQ_aimGGz53R76BwwCVzUgaxz7ssVQC2R1UBlyfQFuJsoS2Clf3fD4eWbQAJuibPL4c2Wf9ihe5dgFg-97WraTas37_XkHOOxX6LjyRzYe-L5zTkak713p6BywXSLRF0WnXMK_WKV8KZUfLv0l1MQ2kryhTI44in896p7zIdvrroWiDiyaCGCMcyk',
          testAssets: [
            { id: 'T-003', name: 'Main Test Stand - Alpha', status: ReadinessStatus.AVAILABLE, description: 'Bay 4 Readiness - Certified' },
            { id: 'T-004', name: 'Li-Ion Cell Stack A', status: ReadinessStatus.AVAILABLE, description: 'Internal Component' },
            { id: 'T-005', name: 'BMS Control Board', status: ReadinessStatus.IN_PROGRESS, description: 'In Firmware Testing' },
            { id: 'T-006', name: 'Encapsulation Gasket', status: ReadinessStatus.NOT_MADE, description: 'Pending Fabrication' },
            { id: 'T-021', name: 'Thermal Cycling Validation', status: ReadinessStatus.DEFERRED, description: 'Environment chamber backlog - Q1' }
          ],
          subsystems: [
            {
              id: 'SSR-882',
              name: 'Solid State Relay Matrix',
              owner: 'Dr. Elena Volkov',
              status: ReadinessStatus.NOT_MADE,
              imageUrl: 'https://picsum.photos/seed/relay/600/400',
              testAssets: [
                { 
                  id: 'T-011', 
                  name: 'High-Speed Cycle Stress', 
                  status: ReadinessStatus.NOT_MADE, 
                  description: 'Initial firmware strobe test - awaiting board arrival' 
                }
              ]
            },
            {
              id: 'HVI-044',
              name: 'High-Voltage Isolation Barrier',
              owner: 'Dr. Elena Volkov',
              status: ReadinessStatus.DEFERRED,
              imageUrl: 'https://picsum.photos/seed/isolation/600/400',
              testAssets: [
                { 
                  id: 'T-012', 
                  name: 'Dielectric Breakdown Test', 
                  status: ReadinessStatus.DEFERRED, 
                  description: 'Postponed to HV Validation Phase' 
                },
                { 
                  id: 'T-013', 
                  name: 'Creepage Distance Audit', 
                  status: ReadinessStatus.DEFERRED, 
                  description: 'Deferred until Final Mechanical Review' 
                },
                { 
                  id: 'T-016', 
                  name: 'Surface Tracking Resistance', 
                  status: ReadinessStatus.DEFERRED, 
                  description: 'Material degradation study - Scheduled Q4' 
                },
                { 
                  id: 'T-017', 
                  name: 'Corona Discharge Baseline', 
                  status: ReadinessStatus.DEFERRED, 
                  description: 'Atmospheric pressure variation testing' 
                },
                { 
                  id: 'T-018', 
                  name: 'Transient Overvoltage Surge', 
                  status: ReadinessStatus.DEFERRED, 
                  description: 'Wait for Power Distribution Bus availability' 
                },
                { 
                  id: 'T-019', 
                  name: 'Galvanic Isolation Integrity', 
                  status: ReadinessStatus.DEFERRED, 
                  description: 'Multi-layer barrier leakage test' 
                },
                { 
                  id: 'T-020', 
                  name: 'Insulation Resistance Stability', 
                  status: ReadinessStatus.DEFERRED, 
                  description: 'Long-term bias stress test' 
                }
              ]
            }
          ]
        },
        {
          id: 'TSA-009',
          name: 'Thermal Sensor Array',
          owner: 'Arjun Nair',
          status: ReadinessStatus.NOT_MADE,
          imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcQkIW0S4eXubZ39rQLKjBXxV9oNSBXT7b7qJ1aH_MSBamGrAhLAkD-zaQhn6sibPsoxpQV9DhhkAc3XLfjMRPPCniTF8dNY1LNj0_Fqs3P_P4wyznu-9NMowHq4gRjjGAo1KRBr4dNWY2Pfx1IolHcL9C6mmotId2G-a7MdnqhsW1gvhO4SOw1RHe0JOWQjVh2GQopnYgFX3ngn-qq-nsHHhG4lFUdGDj8GCKqyn4-1M4k6roHmx4YWOetU7uuVgEhBDVlhf8bA0',
          testAssets: [
            { id: 'T-007', name: 'PT100 Probe Kit', status: ReadinessStatus.AVAILABLE, description: 'Calibration Complete' },
            { id: 'T-008', name: 'Calibration Bridge', status: ReadinessStatus.AVAILABLE, description: 'Ordered - Backlog' }
          ],
          subsystems: [
            {
              id: 'CIM-991',
              name: 'Cryogenic Interface Module',
              owner: 'Arjun Nair',
              status: ReadinessStatus.DEFERRED,
              imageUrl: 'https://picsum.photos/seed/cryo/600/400',
              testAssets: []
            }
          ]
        },
        {
          id: 'EPS-772',
          name: 'Emergency Protocol System',
          owner: 'Sarah Chen',
          status: ReadinessStatus.AVAILABLE,
          imageUrl: 'https://picsum.photos/seed/emergency/600/400',
          testAssets: [
            { id: 'T-014', name: 'Manual Override Test', status: ReadinessStatus.AVAILABLE, description: 'Mechanical link validation' },
            { id: 'T-015', name: 'Secondary Power Cutoff', status: ReadinessStatus.DEFERRED, description: 'Deferred to safety review' }
          ]
        }
      ]
    },
    {
      id: 'PWR-402',
      name: 'Power Distribution',
      owner: 'James Miller',
      status: ReadinessStatus.IN_PROGRESS,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVz8CdQhP_jqfYVWWirpLq_0JM0QgTYMRe4nni2FzgzJAppPqDSKjePWsOlr3bmivT1a0A99K15uWxlr3PPxvRtJddXdQHMmOi_s2WHjozbM2cAQgr2cilKhvTA4uuAbJtczAAsAdWxHBfT-6D28oCMmIdjdeztVZxCmqpmXK1ymhNfr7CKjSiEbwZnNx2kxUPV_NYc4Wbfj8Xc5AoMg7-lJIZoCgoaw2zMvM_4dormlboUXxU51gd0mijuVnrvnzbJ2mEbOhf79U',
      testAssets: [
        { id: 'T-009', name: 'Power Bus Test Kit', status: ReadinessStatus.DEFERRED, description: 'Deferred to Phase 2' }
      ],
      subsystems: [
        {
          id: 'SLR-001',
          name: 'Solar Array Interface',
          owner: 'Sarah Chen',
          status: ReadinessStatus.AVAILABLE,
          imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVz8CdQhP_jqfYVWWirpLq_0JM0QgTYMRe4nni2FzgzJAppPqDSKjePWsOlr3bmivT1a0A99K15uWxlr3PPxvRtJddXdQHMmOi_s2WHjozbM2cAQgr2cilKhvTA4uuAbJtczAAsAdWxHBfT-6D28oCMmIdjdeztVZxCmqpmXK1ymhNfr7CKjSiEbwZnNx2kxUPV_NYc4Wbfj8Xc5AoMg7-lJIZoCgoaw2zMvM_4dormlboUXxU51gd0mijuVnrvnzbJ2mEbOhf79U',
          testAssets: [
            { id: 'T-010', name: 'Interface Load Tester', status: ReadinessStatus.AVAILABLE, description: 'Full Load Validation Complete' }
          ]
        }
      ]
    }
  ]
};

export const LUNAR_BASE_HIERARCHY: SystemNode = {
  id: 'LUN-001',
  name: 'Example - Artemis Lunar Base',
  owner: 'Dr. Sarah Kerman',
  status: ReadinessStatus.IN_PROGRESS,
  imageUrl: 'https://picsum.photos/seed/moon/600/400',
  testAssets: [
    { id: 'LT-001', name: 'Airlock Seal Test', status: ReadinessStatus.AVAILABLE, description: 'Vacuum Chamber B' }
  ],
  subsystems: [
    {
      id: 'LSS-001',
      name: 'Life Support System',
      owner: 'Bill Wilson',
      status: ReadinessStatus.IN_PROGRESS,
      imageUrl: 'https://picsum.photos/seed/oxygen/600/400',
      testAssets: [
        { id: 'LT-002', name: 'O2 Scrubber Bench', status: ReadinessStatus.IN_PROGRESS, description: 'Filtration Lab' }
      ],
      subsystems: [
        {
          id: 'H2O-001',
          name: 'Water Reclamation',
          owner: 'Linda Sue',
          status: ReadinessStatus.NOT_MADE,
          imageUrl: 'https://picsum.photos/seed/water/600/400',
          testAssets: [
            { id: 'LT-003', name: 'Centrifuge Test', status: ReadinessStatus.NOT_MADE, description: 'Pending Install' }
          ]
        }
      ]
    }
  ]
};

export const INITIAL_WORKSPACES: Workspace[] = [
  { id: 'ws-1', name: 'Example - Mars Rover', rootNode: MARS_ROVER_HIERARCHY },
  { id: 'ws-2', name: 'Example - Artemis Lunar Base', rootNode: LUNAR_BASE_HIERARCHY }
];
