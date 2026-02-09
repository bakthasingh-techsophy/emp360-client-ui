import { useProjectStore } from '../store/projectStore';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

export function RoleSwitcher() {
    const { users, currentUser, switchRole } = useProjectStore();

    return (
        <Card className="mb-6 bg-slate-50 border-slate-200">
            <CardContent className="flex items-center gap-4 py-4">
                <div className="text-sm font-medium text-slate-500">
                    Viewing as:
                </div>
                <div className="w-[300px]">
                    <Select
                        value={currentUser.id}
                        onValueChange={(value) => switchRole(value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                        <SelectContent>
                            {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                    {user.name} ({user.role})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="ml-auto text-xs text-slate-400">
                    Role-Based Access Control Simulation
                </div>
            </CardContent>
        </Card>
    );
}
