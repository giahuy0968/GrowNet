import React from 'react';
import { cn } from '../../design/tokens';
import {
    BellIcon,
    ChatBubbleLeftRightIcon,
    MagnifyingGlassIcon,
    Cog6ToothIcon,
    UserCircleIcon,
    Bars3Icon,
    ArrowRightOnRectangleIcon,
    PaperAirplaneIcon,
    CalendarDaysIcon,
    PhoneIcon,
    EllipsisVerticalIcon,
    PaperClipIcon,
    PencilSquareIcon,
    HomeIcon,
    CheckCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    XMarkIcon,
    CheckIcon,
    PlusIcon,
    MinusIcon
} from '@heroicons/react/24/outline';

const icons = {
    bell: BellIcon,
    chat: ChatBubbleLeftRightIcon,
    search: MagnifyingGlassIcon,
    settings: Cog6ToothIcon,
    user: UserCircleIcon,
    menu: Bars3Icon,
    logout: ArrowRightOnRectangleIcon,
    send: PaperAirplaneIcon,
    calendar: CalendarDaysIcon,
    phone: PhoneIcon,
    more: EllipsisVerticalIcon,
    attach: PaperClipIcon,
    edit: PencilSquareIcon,
    home: HomeIcon,
    online: CheckCircleIcon,
    chevronLeft: ChevronLeftIcon,
    chevronRight: ChevronRightIcon,
    close: XMarkIcon,
    check: CheckIcon,
    plus: PlusIcon,
    minus: MinusIcon,
};

export type IconName = keyof typeof icons;

type SizeKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
const SIZE_MAP: Record<SizeKey, number> = {
    xs: 16,
    sm: 18,
    md: 20,
    lg: 24,
    xl: 28,
};

export interface IconProps extends React.SVGProps<SVGSVGElement> {
    name: IconName;
    size?: number | SizeKey; // pixels or token
    className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 'md', className, ...rest }) => {
    const Cmp = icons[name];
    if (!Cmp) return null;
    const px = typeof size === 'number' ? size : SIZE_MAP[size] ?? SIZE_MAP.md;
    return <Cmp className={cn(className)} style={{ width: px, height: px }} {...rest} />;
};
