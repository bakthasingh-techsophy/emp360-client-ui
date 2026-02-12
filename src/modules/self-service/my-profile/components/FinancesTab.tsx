import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserProfile } from '../types';
import { CreditCard, Landmark, FileText, IndianRupee } from 'lucide-react';

interface FinancesTabProps {
    profile: UserProfile;
}

export function FinancesTab({ profile }: FinancesTabProps) {
    const { finances } = profile;

    return (
        <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card>
                <CardHeader>
                    <CardTitle>Financial Overview</CardTitle>
                    <CardDescription>
                        Your compensation and banking details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <IndianRupee className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium leading-none">Salary Structure</p>
                                <p className="text-sm text-muted-foreground mt-1">{finances.salaryStructure}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium leading-none">Tax Regime</p>
                                <div className="mt-1">
                                    <Badge variant="secondary">{finances.taxRegime} Regime</Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Landmark className="w-4 h-4 text-primary" />
                            Bank Account Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-muted-foreground">Bank Name</div>
                            <div className="font-medium text-right">{finances.bankAccount.bankName}</div>

                            <div className="text-muted-foreground">Account Number</div>
                            <div className="font-medium text-right font-mono">{finances.bankAccount.accountNumber}</div>

                            <div className="text-muted-foreground">IFSC Code</div>
                            <div className="font-medium text-right font-mono">{finances.bankAccount.ifsc}</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-primary" />
                            Identify Numbers
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-muted-foreground">PF Account No</div>
                            <div className="font-medium text-right font-mono">{finances.pfAccount}</div>

                            <div className="text-muted-foreground">UAN</div>
                            <div className="font-medium text-right font-mono">{finances.uan}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
