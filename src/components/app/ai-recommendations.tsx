
"use client";

import { useEffect, useState } from "react";
import { generateSecurityRecommendation, SecurityRecommendationOutput } from "@/ai/flows/generate-security-recommendation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lightbulb, RefreshCw, AlertTriangle, CheckCircle, ShieldAlert, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/types";
import { AffectedUsersDialog } from "./affected-users-dialog"; // New Dialog

const priorityIcons = {
  low: <CheckCircle className="h-5 w-5 text-green-500" />,
  medium: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  high: <ShieldAlert className="h-5 w-5 text-red-500" />,
};

const priorityColors: Record<SecurityRecommendationOutput['priority'], string> = {
  low: 'bg-green-500/20 text-green-700 border-green-500/50 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/50 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/30',
  high: 'bg-red-500/20 text-red-700 border-red-500/50 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',
};

interface AiRecommendationsProps {
  allUsers: User[];
}

export function AiRecommendations({ allUsers }: AiRecommendationsProps) {
  const [recommendation, setRecommendation] = useState<SecurityRecommendationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [affectedUsers, setAffectedUsers] = useState<User[]>([]);
  const [isAffectedUsersDialogOpen, setIsAffectedUsersDialogOpen] = useState(false);

  const fetchRecommendation = async () => {
    setIsLoading(true);
    setError(null);
    setAffectedUsers([]);
    try {
      const result = await generateSecurityRecommendation({
        userContext: "Admin user reviewing user management dashboard in a healthcare EHR system.",
        systemContext: "System has multiple users with varying MFA policies. Focus on enhancing overall account security.",
        allUsers: allUsers,
      });
      setRecommendation(result);
      if (result?.affectedUserIds && result.affectedUserIds.length > 0) {
        const users = allUsers.filter(user => result.affectedUserIds!.includes(user.id));
        setAffectedUsers(users);
      }
    } catch (err) {
      console.error("Failed to fetch AI recommendation:", err);
      setError("Failed to load recommendation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (allUsers.length > 0) { // Fetch only if users are loaded
        fetchRecommendation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allUsers]); // Re-fetch if allUsers list changes (e.g. new user added, though prompt might not need it immediately)

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl font-semibold">AI Security Tip</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchRecommendation} disabled={isLoading || allUsers.length === 0}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh Recommendation</span>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-3/4" /> 
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-8 w-24 mt-2" />
            </div>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : recommendation ? (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-foreground/90">{recommendation.recommendation}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{recommendation.rationale}</p>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className={`capitalize ${priorityColors[recommendation.priority]}`}>
                  {priorityIcons[recommendation.priority]} <span className="ml-1.5">{recommendation.priority} Priority</span>
                </Badge>
                {affectedUsers.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => setIsAffectedUsersDialogOpen(true)}>
                    <Users className="mr-2 h-4 w-4" />
                    View Affected Users ({affectedUsers.length})
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <p>No recommendation available at the moment, or still loading user data.</p>
          )}
        </CardContent>
        {recommendation && !isLoading && (
          <CardFooter className="text-xs text-muted-foreground pt-4">
            AI recommendations are for informational purposes only.
          </CardFooter>
        )}
      </Card>
      {affectedUsers.length > 0 && (
        <AffectedUsersDialog
          isOpen={isAffectedUsersDialogOpen}
          onOpenChange={setIsAffectedUsersDialogOpen}
          users={affectedUsers}
          recommendationTitle={recommendation?.recommendation || "Affected Users"}
        />
      )}
    </>
  );
}

    