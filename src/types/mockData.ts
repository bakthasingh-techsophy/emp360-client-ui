export interface DemoUser {
    id: string;
    email: string;
    password: string;
    name: string;
    role: 'org-owner' | 'org-admin';
    orgId: string;
    avatar?: string;
    createdAt: string;
}

export const demoUsers: DemoUser[] = [
    {
        id: 'user-1',
        email: 'owner@example.com',
        password: 'demo123',
        name: 'Sarah Johnson',
        role: 'org-owner',
        orgId: 'org-1',
        createdAt: '2023-02-15',
    },
    {
        id: 'user-2',
        email: 'admin@example.com',
        password: 'demo123',
        name: 'Michael Chen',
        role: 'org-admin',
        orgId: 'org-1',
        createdAt: '2023-03-20',
    },
];
