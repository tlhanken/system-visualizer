import { ReadinessStatus, SystemNode } from '../../src/types';

export const LUNAR_BASE_HIERARCHY: SystemNode = {
    id: 'LUN-001',
    name: 'Artemis Lunar Base',
    productEngineerRE: 'Sarah Kerman',
    status: ReadinessStatus.IN_PROGRESS,
    imageUrl: 'https://picsum.photos/seed/moon/600/400',
    testAssets: [
        { id: 'LT-001', name: 'Airlock Seal Test', status: ReadinessStatus.AVAILABLE, description: 'Automated pressure decay testing system for verifying the hermetic integrity of the primary EVA airlock.', testEngineerRE: 'Jebediah Kerman' }
    ],
    subsystems: [
        {
            id: 'LSS-001',
            name: 'Life Support System',
            productEngineerRE: 'Bill Wilson',
            status: ReadinessStatus.IN_PROGRESS,
            imageUrl: 'https://picsum.photos/seed/oxygen/600/400',
            testAssets: [
                { id: 'LT-002', name: 'O2 Scrubber Bench', status: ReadinessStatus.IN_PROGRESS, description: 'Chemical absorption performance rig used to measure CO2 removal efficiency of the zeolite filtration system.', testEngineerRE: 'Jebediah Kerman' }
            ],
            subsystems: [
                {
                    id: 'H2O-001',
                    name: 'Water Reclamation',
                    productEngineerRE: 'Linda Sue',
                    status: ReadinessStatus.NOT_MADE,
                    imageUrl: 'https://picsum.photos/seed/water/600/400',
                    testAssets: [
                        { id: 'LT-003', name: 'Centrifuge Test', status: ReadinessStatus.NOT_MADE, description: 'Dynamic fluid separation test for verifying the operational stability of water reclamation pumps under varying G-loads.', testEngineerRE: 'Jebediah Kerman' }
                    ]
                }
            ]
        }
    ]
};

export default LUNAR_BASE_HIERARCHY;
