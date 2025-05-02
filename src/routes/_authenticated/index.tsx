import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Users, ShoppingBag, DollarSign } from "lucide-react";

interface DashboardMetric {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
}

function DashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching dashboard data
    const fetchData = () => {
      setTimeout(() => {
        setMetrics([
          {
            title: "Total Revenue",
            value: 24500,
            change: 12,
            icon: <DollarSign className="h-5 w-5 text-muted-foreground" />,
          },
          {
            title: "Products",
            value: 342,
            change: 8,
            icon: <ShoppingBag className="h-5 w-5 text-muted-foreground" />,
          },
          {
            title: "Customers",
            value: 1205,
            change: 5,
            icon: <Users className="h-5 w-5 text-muted-foreground" />,
          },
          {
            title: "Active Orders",
            value: 28,
            change: -3,
            icon: <ShoppingBag className="h-5 w-5 text-muted-foreground" />,
          },
        ]);
        setIsLoading(false);
      }, 800);
    };

    fetchData();
  }, []);

  return (
    <div className=" w-full space-y-6 text-[#242424] bg-white dark:bg-black dark:text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-white">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.username}!
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            defaultValue="today"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-lg border bg-card p-6 animate-pulse"
            >
              <div className="h-4 w-24 bg-muted rounded mb-4"></div>
              <div className="h-6 w-16 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <div key={index} className="rounded-lg border bg-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium">{metric.title}</h3>
                {metric.icon}
              </div>
              <div className="text-2xl font-bold">
                {metric.title === "Total Revenue"
                  ? `$${metric.value.toLocaleString()}`
                  : metric.value.toLocaleString()}
              </div>
              <div
                className={`text-sm mt-1 ${metric.change >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                {metric.change >= 0 ? "↑" : "↓"} {Math.abs(metric.change)}% from
                last period
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-lg border bg-card">
          <div className="p-6">
            <h3 className="text-lg font-medium">Recent Orders</h3>
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Order chart will go here
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-3 rounded-lg border bg-card">
          <div className="p-6">
            <h3 className="text-lg font-medium">Activity</h3>
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Activity feed will go here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardPage,
});
