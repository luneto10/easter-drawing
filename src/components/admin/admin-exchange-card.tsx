"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

type Props = {
    drawEnabled: boolean | null;
    loading: boolean;
    onOpenDraw: () => void;
    onCloseDraw: () => void;
};

export function AdminExchangeCard({
    drawEnabled,
    loading,
    onOpenDraw,
    onCloseDraw,
}: Props) {
    return (
        <Card className="border-zinc-200">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Exchange</CardTitle>
                <CardDescription>
                    When the draw is closed, new people cannot join the room and
                    nobody can reveal their assignment.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    {drawEnabled === null ? (
                        <span className="text-sm text-zinc-500">
                            Loading status…
                        </span>
                    ) : (
                        <Badge
                            className={
                                drawEnabled
                                    ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                                    : "border border-red-200 bg-red-50 text-red-900"
                            }
                        >
                            <span
                                className={`mr-2 inline-block h-2 w-2 rounded-full ${drawEnabled ? "bg-emerald-500" : "bg-red-500"}`}
                                aria-hidden
                            />
                            {drawEnabled
                                ? "Open — joins and reveals allowed"
                                : "Closed — joins and reveals blocked"}
                        </Badge>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        size="sm"
                        disabled={
                            loading ||
                            drawEnabled === null ||
                            drawEnabled === true
                        }
                        onClick={() => void onOpenDraw()}
                    >
                        Open draw
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={
                            loading ||
                            drawEnabled === null ||
                            drawEnabled === false
                        }
                        onClick={() => void onCloseDraw()}
                    >
                        Close draw
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
