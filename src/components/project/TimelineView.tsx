import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TimelineView = () => {
  // Mock timeline data
  const tasks = [
    {
      id: 1,
      title: "Design landing page mockup",
      assignee: "John Doe",
      startDate: "2024-01-15",
      endDate: "2024-01-20",
      status: "complete",
    },
    {
      id: 2,
      title: "Implement authentication",
      assignee: "Jane Smith",
      startDate: "2024-01-10",
      endDate: "2024-01-25",
      status: "in-progress",
    },
    {
      id: 3,
      title: "Write API documentation",
      assignee: "Mike Johnson",
      startDate: "2024-01-20",
      endDate: "2024-01-28",
      status: "upcoming",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-success";
      case "in-progress":
        return "bg-primary";
      case "review":
        return "bg-warning";
      case "backlog":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-8">
            <div className="flex items-center text-sm text-muted-foreground border-b border-border pb-4">
              <div className="w-1/3">Task</div>
              <div className="w-1/6">Assignee</div>
              <div className="w-1/2">Timeline</div>
            </div>

            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4">
                <div className="w-1/3">
                  <p className="font-medium">{task.title}</p>
                  <Badge
                    variant="outline"
                    className="mt-1 capitalize text-xs"
                  >
                    {task.status.replace("-", " ")}
                  </Badge>
                </div>
                <div className="w-1/6 text-sm text-muted-foreground">
                  {task.assignee}
                </div>
                <div className="w-1/2">
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                      <span>{task.startDate}</span>
                      <span>→</span>
                      <span>{task.endDate}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getStatusColor(
                          task.status
                        )} transition-all duration-300`}
                        style={{
                          width: task.status === "complete" ? "100%" : "60%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground p-8 border border-dashed border-border/50 rounded-lg">
        <p>Full Gantt chart visualization coming soon</p>
        <p className="text-xs mt-2">
          This will include interactive timeline controls and dependencies
        </p>
      </div>
    </div>
  );
};

export default TimelineView;
