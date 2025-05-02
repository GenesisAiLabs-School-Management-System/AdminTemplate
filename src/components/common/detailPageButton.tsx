import { Link } from '@tanstack/react-router';
import { Button } from '../ui/button.js';
import { SquareArrowOutUpRightIcon } from 'lucide-react';

export function DetailPageButton({
    to,
    label,
    disabled,
}: {
    to: string;
    label: string | React.ReactNode;
    disabled?: boolean;
}) {
    const targetPath = to === '.' ? './$id' : to;

    return (
        <Button asChild variant="ghost" disabled={disabled}>
            <Link to={targetPath}>
                {label}
                {!disabled && <SquareArrowOutUpRightIcon className="h-3 w-3 text-muted-foreground" />}
            </Link>
        </Button>
    );
}
