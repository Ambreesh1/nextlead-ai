import { Mail, Plus } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MOCK_TEAM } from '@/lib/mock-team';

export default function TeamPage() {
  return (
    <div>
      <PageHeader
        title="Team"
        description="People with access to your NextLead workspace."
        actions={
          <Button size="sm">
            <Plus size={13} /> Invite member
          </Button>
        }
      />

      <Card className="overflow-hidden p-0">
        <ul className="divide-y divide-border">
          {MOCK_TEAM.map((member) => (
            <li key={member.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{member.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{member.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail size={11} /> {member.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">{member.role}</span>
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {member.leadsHandled} leads handled
                </span>
                <Badge variant={member.status === 'active' ? 'success' : 'secondary'}>
                  {member.status === 'active' ? 'Active' : 'Invited'}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <CardContent className="px-0 pt-4 text-xs text-muted-foreground">
        This is a presentational view — the assignment&apos;s backend doesn&apos;t include team/user
        management endpoints, so team data here is illustrative.
      </CardContent>
    </div>
  );
}
