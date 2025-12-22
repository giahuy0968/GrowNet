import React from 'react';
import { cn } from '../../design/tokens'; // Giả sử hàm cn đã được định nghĩa đúng cách
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
    HomeIcon, // Dùng để lấy kiểu props cơ sở
    ClockIcon,
    CheckCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    XMarkIcon,
    ArrowLeftIcon,
    CheckIcon,
    PlusIcon,
    MinusIcon,
    SunIcon,
    MoonIcon,
    // ... import các icon khác
} from '@heroicons/react/24/outline';

// 1. Định nghĩa map các icons
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
    clock: ClockIcon,
    phone: PhoneIcon,
    more: EllipsisVerticalIcon,
    attach: PaperClipIcon,
    edit: PencilSquareIcon,
    home: HomeIcon,
    'arrow-left': ArrowLeftIcon,
    online: CheckCircleIcon,
    chevronLeft: ChevronLeftIcon,
    chevronRight: ChevronRightIcon,
    close: XMarkIcon,
    check: CheckIcon,
    plus: PlusIcon,
    minus: MinusIcon,
    sun: SunIcon,
    moon: MoonIcon,
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

type HeroIconProps = Omit<React.ComponentPropsWithoutRef<typeof HomeIcon>, 'className' | 'style'>;

// 2. Định nghĩa Props an toàn và rõ ràng hơn
export interface IconProps extends HeroIconProps {
    /** Tên icon, phải là một trong các key đã định nghĩa trong 'icons' map */
    name: IconName;
    
    /** Kích thước icon (ví dụ: 'md', 24) */
    size?: number | SizeKey; 
    
    /** ClassName tùy chọn */
    className?: string;
}

// 3. Component Icon đã sửa lỗi với Type Assertion (Casting)
// Chúng ta định nghĩa Icon dưới dạng một component không tên (anonymous) sau đó gán nó
// cho biến Icon với kiểu React.FC.
export const Icon: React.FC<IconProps> = ({ name, size = 'md', className, ...rest }) => {
    
    // **Bước Sửa Lỗi Quan Trọng:** // Ép kiểu biến Cmp thành một React Component Element Type cơ bản.
    // Điều này vượt qua sự kiểm tra nghiêm ngặt về ForwardRefExoticComponent.
    const Cmp = icons[name] as React.ElementType; 
    
    if (!Cmp) {
        console.warn(`Icon "${name}" not found.`);
        return null; 
    }
    
    // Tính toán kích thước pixel
    const px = typeof size === 'number' ? size : SIZE_MAP[size] ?? SIZE_MAP.md;

    return (
        <Cmp 
            // Cần phải gán kiểu cho 'rest' để tránh lỗi spread operator phức tạp
            className={cn(className)} 
            style={{ width: px, height: px, minWidth: px, minHeight: px }} 
            {...(rest as HeroIconProps)} 
        />
    );
};