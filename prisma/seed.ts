import { PrismaClient, UserRole, ProjectType, ProjectStatus, SupervisorStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    try {
        // 1. Create Projects
        console.log('Creating projects...');
        const project1 = await prisma.project.create({
            data: {
                projectName: 'Sunrise Villa',
                projectType: 'villa', // ProjectType.villa if using enum directly, but string literals work with Prisma types too usually. Using strings to be safe against slight enum mismatch in import if any, though importing enum is better.
                location: 'Hyderabad',
                initialStatus: 'Inprogress',
                startDate: new Date(),
                expectedCompletion: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                totalBudget: 5000000,
                materialName: 'Cement',
                quantity: 1000,
                notes: 'Luxury villa project',
            }
        });

        const project2 = await prisma.project.create({
            data: {
                projectName: 'Skyline Apartments',
                projectType: 'apartment',
                location: 'Bangalore',
                initialStatus: 'Planning',
                startDate: new Date(),
                expectedCompletion: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
                totalBudget: 15000000,
                materialName: 'Steel',
                quantity: 5000,
                notes: 'High-rise apartment complex',
            }
        });

        console.log(`Created projects: ${project1.projectName} (${project1.projectId}), ${project2.projectName} (${project2.projectId})`);

        // 2. Create Supervisors (and their User accounts)
        const saltRounds = 10;
        const password = await bcrypt.hash('Password@123', saltRounds);

        const supervisorsData = [
            { name: 'John Doe', email: 'john.doe@example.com', phone: '9876543210' },
            { name: 'Jane Smith', email: 'jane.smith@example.com', phone: '9876543211' },
            { name: 'Robert Brown', email: 'robert.brown@example.com', phone: '9876543212' },
        ];

        for (const s of supervisorsData) {
            // Check if user exists to avoid unique constraint error if re-running
            const existingUser = await prisma.user.findFirst({ where: { email: s.email } });
            if (existingUser) {
                console.log(`Skipping ${s.name}, already exists.`);
                continue;
            }

            // Create User
            const user = await prisma.user.create({
                data: {
                    userName: s.name,
                    role: 'supervisor', // UserRole.supervisor
                    email: s.email,
                    password: password,
                    contact: s.phone,
                }
            });

            // Create Supervisor
            const supervisor = await prisma.supervisor.create({
                data: {
                    fullName: s.name,
                    email: s.email,
                    phoneNumber: s.phone,
                    password: password,
                    status: 'Active', // SupervisorStatus.Active
                    userId: user.userId,
                    // Assign to both projects for demonstration
                    projects: {
                        connect: [
                            { projectId: project1.projectId },
                            { projectId: project2.projectId }
                        ]
                    }
                }
            });

            console.log(`Created supervisor: ${supervisor.fullName} with User ID: ${user.userId}`);
        }

        console.log('Seeding finished successfully.');
    } catch (error) {
        console.error('Error seeding data:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
