import { ReadinessStatus, SystemNode } from '../../src/types';

export const MARS_ROVER_HIERARCHY: SystemNode = {
    id: 'ROV-001',
    name: 'Mars Rover',
    productEngineerRE: 'Marcus Thorne',
    status: ReadinessStatus.IN_PROGRESS,
    imageUrl: 'https://picsum.photos/seed/rover/600/400',
    testAssets: [
        {
            id: 'T-001',
            name: 'Chassis Stress Stand',
            status: ReadinessStatus.AVAILABLE,
            description: 'High-fidelity structural jig for multi-axis load simulation and chassis fatigue analysis.',
            testEngineerRE: 'Alice Vance'
        }
    ],
    subsystems: [
        {
            id: 'MCU-001',
            name: 'Main Control Unit',
            productEngineerRE: 'Sarah Chen',
            status: ReadinessStatus.AVAILABLE,
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtRhryxS0ib9wEYfnYK4FgvoyLoGBNcbnVf_3-jEv-pBo1G_ClIr8BakKMv9NyJmPuqBSr02OcUjt2WbhSA0EO_2vSSIsbww345VYoNvfCFQ6Dsuax25a_Tm2ymftzgkYZM-ytuQHTo-UxuA4zGoBP_f-IBLjeFGxmsUV0bb36MjvzjmAeLEGZ9EXQD3Q-21ZLr1uN1OcKXIGKaSoH_enRcOI63nLxbs5fqA89a-Fhld-CzhV-eFGIL6_TzPo3tq-irPPB_hgRhvk',
            testAssets: [
                {
                    id: 'T-002',
                    name: 'Software Integration Bench',
                    status: ReadinessStatus.AVAILABLE,
                    description: 'Virtualized hardware environment for testing real-time OS kernel stability and peripheral driver compatibility.',
                    testEngineerRE: 'Kevin Flynn'
                }
            ],
            subsystems: [
                {
                    id: 'AUX-012',
                    name: 'Auxiliary Battery Unit',
                    productEngineerRE: 'Elena Volkov',
                    status: ReadinessStatus.IN_PROGRESS,
                    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6E-sYJ2j72HuPEF4eI3aZzok1TrkI-kiJ8WRKVz_4pOjKWGuZYGaQfdJkpNHu1eivCiDFtxGAPfw3OrOPUfwQ_aimGGz53R76BwwCVzUgaxz7ssVQC2R1UBlyfQFuJsoS2Clf3fD4eWbQAJuibPL4c2Wf9ihe5dgFG-97WraTas37_XkHOOxX6LjyRzYe-L5zTkak713p6BywXSLRF0WnXMK_WKV8KZUfLv0l1MQ2kryhTI44in896p7zIdvrroWiDiyaCGCMcyk',
                    testAssets: [
                        {
                            id: 'T-004',
                            name: 'Li-Ion Cell Stack A',
                            status: ReadinessStatus.AVAILABLE,
                            description: 'Primary energy storage core consisting of 128 high-density lithium-ion cells in a 16s8p configuration.',
                            testEngineerRE: 'Miles Dyson'
                        },
                        {
                            id: 'T-005',
                            name: 'BMS Control Board',
                            status: ReadinessStatus.IN_PROGRESS,
                            description: 'Sophisticated battery management system for real-time monitoring of cell voltages, current, and thermal gradients.',
                            testEngineerRE: 'Miles Dyson'
                        },
                        {
                            id: 'T-003',
                            name: 'Main Test Stand - Alpha',
                            status: ReadinessStatus.AVAILABLE,
                            description: 'Integrated validation environment for full-stack system verification including simulated mission-profile loads.',
                            testEngineerRE: 'Gordon Freeman',
                            dependsOn: ['T-004', 'T-005']
                        },
                        {
                            id: 'T-006',
                            name: 'Encapsulation Gasket',
                            status: ReadinessStatus.NOT_MADE,
                            description: 'Custom-molded silicone-based sealant designed for IP68-rated protection against vacuum and fine dust ingress.',
                            testEngineerRE: 'Gordon Freeman',
                            dependsOn: ['T-003']
                        },
                        {
                            id: 'T-021',
                            name: 'Thermal Cycling Validation',
                            status: ReadinessStatus.DEFERRED,
                            description: 'Stress testing protocol exposing hardware to extreme temperature deltas ranging from -120°C to +80°C.',
                            testEngineerRE: 'Gordon Freeman',
                            dependsOn: ['T-006']
                        }
                    ],
                    subsystems: [
                        {
                            id: 'SSR-882',
                            name: 'Solid State Relay Matrix',
                            productEngineerRE: 'Elena Volkov',
                            status: ReadinessStatus.NOT_MADE,
                            imageUrl: 'https://picsum.photos/seed/relay/600/400',
                            testAssets: [
                                {
                                    id: 'T-011',
                                    name: 'High-Speed Cycle Stress',
                                    status: ReadinessStatus.NOT_MADE,
                                    description: 'Automated relay actuation testing at frequencies exceeding 50Hz to verify solid-state switching longevity.',
                                    testEngineerRE: 'Miles Dyson'
                                }
                            ]
                        },
                        {
                            id: 'HVI-044',
                            name: 'High-Voltage Isolation Barrier',
                            productEngineerRE: 'Elena Volkov',
                            status: ReadinessStatus.DEFERRED,
                            imageUrl: 'https://picsum.photos/seed/isolation/600/400',
                            testAssets: [
                                { id: 'T-012', name: 'Dielectric Breakdown Test', status: ReadinessStatus.DEFERRED, description: 'High-voltage test to determine the voltage threshold at which the barrier\'s dielectric properties fail.', testEngineerRE: 'Isaac Kleiner' },
                                { id: 'T-013', name: 'Creepage Distance Audit', status: ReadinessStatus.DEFERRED, description: 'Geometric analysis of the shortest path between conductive parts along the surface of the insulation material.', testEngineerRE: 'Isaac Kleiner' },
                                { id: 'T-016', name: 'Surface Tracking Resistance', status: ReadinessStatus.DEFERRED, description: 'Evaluation of material performance under high voltage stress in contaminated or humid conditions.', testEngineerRE: 'Isaac Kleiner' },
                                { id: 'T-017', name: 'Corona Discharge Baseline', status: ReadinessStatus.DEFERRED, description: 'Mapping of partial discharge phenomena in high-gradient electrical fields at low atmospheric pressures.', testEngineerRE: 'Isaac Kleiner' },
                                { id: 'T-018', name: 'Transient Overvoltage Surge', status: ReadinessStatus.DEFERRED, description: 'Verification of system robustness against sub-millisecond voltage spikes and electromagnetic pulses.', testEngineerRE: 'Isaac Kleiner' },
                                { id: 'T-019', name: 'Galvanic Isolation Integrity', status: ReadinessStatus.DEFERRED, description: 'Measurement of leakage current and impedance across the primary-to-secondary isolation barrier.', testEngineerRE: 'Isaac Kleiner' },
                                { id: 'T-020', name: 'Insulation Resistance Stability', status: ReadinessStatus.DEFERRED, description: 'Long-term monitoring of electrical resistance between independent circuits under DC bias.', testEngineerRE: 'Isaac Kleiner' }
                            ]
                        }
                    ]
                },
                {
                    id: 'TSA-009',
                    name: 'Thermal Sensor Array',
                    productEngineerRE: 'Arjun Nair',
                    status: ReadinessStatus.NOT_MADE,
                    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcQkIW0S4eXubZ39rQLKjBXxV9oNSBXT7b7qJ1aH_MSBamGrAhLAkD-zaQhn6sibPsoxpQV9DhhkAc3XLfjMRPPCniTF8dNY1LNj0_Fqs3P_P4wyznu-9NMowHq4gRjjGAo1KRBr4dNWY2Pfx1IolHcL9C6mmotId2G-a7MdnqhsW1gvhO4SOw1RHe0JOWQjVh2GQopnYgFX3ngn-qq-nsHHhG4lFUdGDj8GCKqyn4-1M4k6roHmx4YWOetU7uuVgEhBDVlhf8bA0',
                    testAssets: [
                        { id: 'T-007', name: 'PT100 Probe Kit', status: ReadinessStatus.AVAILABLE, description: 'Precision platinum resistance temperature detectors with ±0.03°C accuracy for localized thermal mapping.', testEngineerRE: 'Bill Wilson' },
                        { id: 'T-008', name: 'Calibration Bridge', status: ReadinessStatus.AVAILABLE, description: 'High-accuracy Wheatstone bridge circuitry used to verify the linearity of resistive sensor inputs.', testEngineerRE: 'Bill Wilson' }
                    ],
                    subsystems: [
                        {
                            id: 'CIM-991',
                            name: 'Cryogenic Interface Module',
                            productEngineerRE: 'Arjun Nair',
                            status: ReadinessStatus.DEFERRED,
                            imageUrl: 'https://picsum.photos/seed/cryo/600/400',
                            testAssets: []
                        }
                    ]
                },
                {
                    id: 'EPS-772',
                    name: 'Emergency Protocol System',
                    productEngineerRE: 'Sarah Chen',
                    status: ReadinessStatus.AVAILABLE,
                    imageUrl: 'https://picsum.photos/seed/emergency/600/400',
                    testAssets: [
                        { id: 'T-014', name: 'Manual Override Test', status: ReadinessStatus.AVAILABLE, description: 'Validation of fail-safe mechanisms allowing for manual control bypass in case of critical MCU failure.', testEngineerRE: 'Kevin Flynn' },
                        { id: 'T-015', name: 'Secondary Power Cutoff', status: ReadinessStatus.DEFERRED, description: 'Independent hardware-level circuit breaker designed to isolate the power bus during over-current events.', testEngineerRE: 'Kevin Flynn' }
                    ]
                }
            ]
        },
        {
            id: 'PWR-402',
            name: 'Power Distribution',
            productEngineerRE: 'James Miller',
            status: ReadinessStatus.IN_PROGRESS,
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVz8CdQhP_jqfYVWWirpLq_0JM0QgTYMRe4nni2FzgzJAppPqDSKjePWsOlr3bmivT1a0A99K15uWxlr3PPxvRtJddXdQHMmOi_s2WHjozbM2cAQgr2cilKhvTA4uuAbJtczAAsAdWxHBfT-6D28oCMmIdjdeztVZxCmqpmXK1ymhNfr7CKjSiEbwZnNx2kxUPV_NYc4Wbfj8Xc5AoMg7-lJIZoCgoaw2zMvM_4dormlboUXxU51gd0mijuVnrvnzbJ2mEbOhf79U',
            testAssets: [
                { id: 'T-009', name: 'Power Bus Test Kit', status: ReadinessStatus.DEFERRED, description: 'Modular load bank for simulating various power consumption profiles across the 28V DC rover bus.', testEngineerRE: 'Dr. Wallace Breen' }
            ],
            subsystems: [
                {
                    id: 'SLR-001',
                    name: 'Solar Array Interface',
                    productEngineerRE: 'Sarah Chen',
                    status: ReadinessStatus.AVAILABLE,
                    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVz8CdQhP_jqfYVWWirpLq_0JM0QgTYMRe4nni2FzgzJAppPqDSKjePWsOlr3bmivT1a0A99K15uWxlr3PPxvRtJddXdQHMmOi_s2WHjozbM2cAQgr2cilKhvTA4uuAbJtczAAsAdWxHBfT-6D28oCMmIdjdeztVZxCmqpmXK1ymhNfr7CKjSiEbwZnNx2kxUPV_NYc4Wbfj8Xc5AoMg7-lJIZoCgoaw2zMvM_4dormlboUXxU51gd0mijuVnrvnzbJ2mEbOhf79U',
                    testAssets: [
                        { id: 'T-010', name: 'Interface Load Tester', status: ReadinessStatus.AVAILABLE, description: 'Dynamic power simulation unit for verifying the maximum throughput of the solar array MPPT controllers.', testEngineerRE: 'Kevin Flynn' }
                    ]
                }
            ]
        }
    ]
};

export default MARS_ROVER_HIERARCHY;
