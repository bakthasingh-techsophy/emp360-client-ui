import { useState, useEffect } from 'react';
import { useProjectStore, ProjectNature, ProjectCategory, BillingType, ParentProject, SubProject, User } from '../store/projectStore';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectToEdit: ParentProject | SubProject | null;
}

export function ProjectModal({ open, onOpenChange, projectToEdit }: ProjectModalProps) {
    const {
        createParentProject,
        updateParentProject,
        createSubProject,
        updateSubProject,
        parentProjects,
        users,
        allocations,
        updateAllocation,
        bulkUpdateAllocations
    } = useProjectStore();

    const isEditMode = !!projectToEdit;
    // Determine type of edit if in edit mode
    const isEditingParent = isEditMode && 'client' in projectToEdit && !('parentProjectId' in projectToEdit);
    const isEditingSub = isEditMode && 'parentProjectId' in projectToEdit;

    const [activeTab, setActiveTab] = useState<'parent' | 'sub'>('sub');

    // Stepper State for SubProject
    const [step, setStep] = useState(1);

    // Form State - Parent
    const [parentName, setParentName] = useState('');
    const [parentClient, setParentClient] = useState('');

    // Form State - Sub
    const [subName, setSubName] = useState('');
    const [subCode, setSubCode] = useState('');
    const [subClient, setSubClient] = useState('');
    const [revenue, setRevenue] = useState('');
    const [nature, setNature] = useState<ProjectNature>('Internal');
    const [category, setCategory] = useState<ProjectCategory>('Service');
    const [billing, setBilling] = useState<BillingType>('Non-Billable');
    const [managerId, setManagerId] = useState('');
    const [type, setType] = useState('');
    const [parentId, setParentId] = useState('');

    // Bulk Allocation State
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [tempAllocations, setTempAllocations] = useState<Record<string, number>>({});
    const [employeeSearch, setEmployeeSearch] = useState('');

    // Reset or Populate on Open/Close/Edit
    useEffect(() => {
        if (open) {
            if (isEditMode && projectToEdit) {
                if (isEditingParent) {
                    const p = projectToEdit as ParentProject;
                    setActiveTab('parent');
                    setParentName(p.name);
                    setParentClient(p.client);
                } else if (isEditingSub) {
                    const s = projectToEdit as SubProject;
                    setActiveTab('sub');
                    setSubName(s.projectName);
                    setSubCode(s.projectCode);
                    setSubClient(s.client);
                    setRevenue(String(s.revenue));
                    setNature(s.projectNature);
                    setCategory(s.category);
                    setBilling(s.billingType);
                    setManagerId(s.managerId);
                    setType(s.type);
                    setParentId(s.parentProjectId);

                    // Pre-populate allocations for this subproject
                    const projectAlloc = allocations.filter(a => a.subProjectId === s.id);
                    setSelectedEmployees(projectAlloc.map(a => a.employeeId));
                    const temp: Record<string, number> = {};
                    projectAlloc.forEach(a => temp[a.employeeId] = a.allocation);
                    setTempAllocations(temp);
                }
                setStep(1); // Always start at step 1 for edit
            } else {
                // Create Mode Reset
                resetForms();
                setStep(1);
                setActiveTab('sub'); // Default to sub
            }
        }
    }, [open, projectToEdit, isEditMode, isEditingParent, isEditingSub]);

    // Auto-populate Client from Parent
    useEffect(() => {
        if (parentId && !isEditMode) { // Only auto-pop on create, or maybe always if strict? lets do create only for flexibility
            const p = parentProjects.find(pp => pp.id === parentId);
            if (p) setSubClient(p.client);
        }
    }, [parentId, parentProjects, isEditMode]);

    const resetForms = () => {
        setParentName('');
        setParentClient('');
        setSubName('');
        setSubCode('');
        setSubClient('');
        setRevenue('');
        setManagerId('');
        setType('');
        setParentId('');
        setSelectedEmployees([]);
        setTempAllocations({});
        setEmployeeSearch('');
    };

    // ------------------------------------------
    // HANDLERS
    // ------------------------------------------

    // ------------------------------------------
    // HANDLERS
    // ------------------------------------------

    const handleSaveParent = () => {
        if (!parentName || !parentClient) return; // Basic validation

        if (isEditMode && isEditingParent) {
            updateParentProject(projectToEdit!.id, { name: parentName, client: parentClient });
        } else {
            createParentProject({ name: parentName, client: parentClient });
        }
        onOpenChange(false);
    };

    const validateSubStep1 = () => {
        // All fields mandatory
        return subName && subCode && subClient && revenue && nature && category && billing && managerId && type && parentId;
    };

    const handleSubNext = () => {
        if (validateSubStep1()) {
            setStep(2);
        } else {
            // Could show toast error here
            alert("All fields are mandatory");
        }
    };


    // Custom Hack: I will inject the ID into `createSubProject` call and hope I can fix store to use it.
    // ... actually I can't.

    // Revised Strategy:
    // For Create: Just create the project.
    // Then "Alert: Please edit project to add allocations".
    // This fails the requirement.

    // I must fix the store to respect ID or return it.
    // I will make `createSubProject` return nothing but I'll change the store logic to:
    // `{ ...project, id: project.id || sp${Date.now()} }`
    // Yes. I will do that store fix next.

    const handleBulkSubmit = () => {
        const newId = isEditMode ? projectToEdit!.id : `sp${Date.now()}`;

        const subData: any = {
            projectName: subName,
            projectCode: subCode,
            client: subClient,
            revenue: Number(revenue),
            projectNature: nature,
            category,
            billingType: billing,
            managerId,
            type,
            parentProjectId: parentId,
        };

        if (!isEditMode) {
            subData.id = newId; // Pass ID
            createSubProject(subData); // This needs store update to respect ID
        } else {
            updateSubProject(newId, subData);
        }

        const newAllocList = selectedEmployees.map(empId => ({
            employeeId: empId,
            subProjectId: newId,
            allocation: tempAllocations[empId] || 0
        }));
        bulkUpdateAllocations(newAllocList);

        onOpenChange(false);
    };

    const toggleEmployee = (empId: string) => {
        if (selectedEmployees.includes(empId)) {
            setSelectedEmployees(selectedEmployees.filter(id => id !== empId));
            const newTemp = { ...tempAllocations };
            delete newTemp[empId];
            setTempAllocations(newTemp);
        } else {
            setSelectedEmployees([...selectedEmployees, empId]);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Project' : 'Create New Project'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? 'Modify project details.' : 'Add a new project to the system.'}
                    </DialogDescription>
                </DialogHeader>

                {isEditMode && isEditingParent ? (
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>Project Name</Label>
                            <Input value={parentName} onChange={(e) => setParentName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Client</Label>
                            <Input value={parentClient} onChange={(e) => setParentClient(e.target.value)} />
                        </div>
                        <Button onClick={handleSaveParent} className="w-full mt-4">Save Changes</Button>
                    </div>
                ) : (!isEditMode && activeTab === 'parent' ? (
                    // Create Parent Mode
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="parent">Parent Project</TabsTrigger>
                            <TabsTrigger value="sub">Sub Project</TabsTrigger>
                        </TabsList>
                        <TabsContent value="parent" className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label>Project Name</Label>
                                <Input value={parentName} onChange={(e) => setParentName(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Client</Label>
                                <Input value={parentClient} onChange={(e) => setParentClient(e.target.value)} />
                            </div>
                            <Button onClick={handleSaveParent} className="w-full mt-4">Create Parent Project</Button>
                        </TabsContent>
                        <TabsContent value="sub">
                            {/* Placeholder to switch tab */}
                        </TabsContent>
                    </Tabs>
                ) : (
                    // Sub Project Mode (Create or Edit)
                    <div className="space-y-4">
                        {!isEditMode && (
                            <Tabs value="sub" onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-4">
                                    <TabsTrigger value="parent">Parent Project</TabsTrigger>
                                    <TabsTrigger value="sub">Sub Project</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        )}

                        {/* Stepper Indicator */}
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                            <span className={step === 1 ? 'font-bold text-primary' : ''}>Step 1: Details</span>
                            <span>/</span>
                            <span className={step === 2 ? 'font-bold text-primary' : ''}>Step 2: Allocation</span>
                        </div>

                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Parent Project <span className="text-red-500">*</span></Label>
                                        <Select value={parentId} onValueChange={setParentId} disabled={isEditMode}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Parent" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {parentProjects.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Manager <span className="text-red-500">*</span></Label>
                                        <Select value={managerId} onValueChange={setManagerId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Manager" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.filter(u => u.role !== 'EMPLOYEE').map((u) => (
                                                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Project Name <span className="text-red-500">*</span></Label>
                                        <Input value={subName} onChange={(e) => setSubName(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Project Code <span className="text-red-500">*</span></Label>
                                        <Input value={subCode} onChange={(e) => setSubCode(e.target.value)} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Client (Auto) <span className="text-red-500">*</span></Label>
                                        <Input value={subClient} disabled placeholder="Auto-populated" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Type <span className="text-red-500">*</span></Label>
                                        <Input value={type} onChange={(e) => setType(e.target.value)} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Revenue / Budget <span className="text-red-500">*</span></Label>
                                        <Input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Nature <span className="text-red-500">*</span></Label>
                                        <Select value={nature} onValueChange={(v) => setNature(v as ProjectNature)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Internal">Internal</SelectItem>
                                                <SelectItem value="External">External</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Category <span className="text-red-500">*</span></Label>
                                        <Select value={category} onValueChange={(v) => setCategory(v as ProjectCategory)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Service">Service</SelectItem>
                                                <SelectItem value="Product">Product</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Billing Type <span className="text-red-500">*</span></Label>
                                        <Select value={billing} onValueChange={(v) => setBilling(v as BillingType)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Billable">Billable</SelectItem>
                                                <SelectItem value="Non-Billable">Non-Billable</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button onClick={handleSubNext} className="w-full">Next: Allocation</Button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <Label>Bulk Assign Employees</Label>
                                <Input
                                    placeholder="Search employees..."
                                    value={employeeSearch}
                                    onChange={(e) => setEmployeeSearch(e.target.value)}
                                    className="mb-2"
                                />
                                <ScrollArea className="h-[300px] border rounded-md p-4">
                                    <div className="space-y-4">
                                        {users.filter(u => u.role === 'EMPLOYEE' &&
                                            (u.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
                                                u.email.toLowerCase().includes(employeeSearch.toLowerCase()))
                                        ).map(emp => (
                                            <div key={emp.id} className="flex items-center space-x-4 border-b pb-2 last:border-0 last:pb-0">
                                                <Checkbox
                                                    checked={selectedEmployees.includes(emp.id)}
                                                    onCheckedChange={() => toggleEmployee(emp.id)}
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{emp.name}</p>
                                                    <p className="text-xs text-muted-foreground">{emp.email}</p>
                                                </div>
                                                {selectedEmployees.includes(emp.id) && (
                                                    <div className="flex items-center gap-2">
                                                        <Label className="text-xs">Alloc:</Label>
                                                        <Input
                                                            type="number"
                                                            min="0" max="1" step="0.1"
                                                            className="w-20 h-8 text-xs"
                                                            value={tempAllocations[emp.id] || ''}
                                                            placeholder="0.0"
                                                            onChange={(e) => setTempAllocations({
                                                                ...tempAllocations,
                                                                [emp.id]: parseFloat(e.target.value)
                                                            })}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                                <div className="flex justify-between gap-4">
                                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                                    <Button onClick={handleBulkSubmit}>{isEditMode ? 'Update Project' : 'Create Project'}</Button>
                                    {selectedEmployees.length > 0 && (
                                        <p className="text-xs text-muted-foreground self-center">
                                            {selectedEmployees.length} employees selected
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </DialogContent>
        </Dialog>
    );
}
