"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Props = {
    joinRoomUrl: string;
    joinUrlCopied: boolean;
    onCopy: () => void;
};

export function AdminJoinLinkCard({
    joinRoomUrl,
    joinUrlCopied,
    onCopy,
}: Props) {
    return (
        <Card className="border-zinc-200">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">
                    Participant join link
                </CardTitle>
                <CardDescription>
                    Share this URL so people open the site with this room
                    already selected. They still sign in or create an account,
                    then can join from the home screen.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <Input
                    readOnly
                    value={joinRoomUrl}
                    className="font-mono text-xs"
                    aria-label="Join URL for this room"
                />
                <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 sm:w-auto"
                    disabled={!joinRoomUrl}
                    onClick={onCopy}
                >
                    <Copy className="mr-2 h-4 w-4" />
                    {joinUrlCopied ? "Copied" : "Copy link"}
                </Button>
            </CardContent>
        </Card>
    );
}
