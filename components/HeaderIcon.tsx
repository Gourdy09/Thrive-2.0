import { icons } from 'lucide-react-native';

interface HeaderIconProps {
    iconName: keyof typeof icons;
    color: string;
    size: number;
}

export default function HeaderIcon ({ iconName, color, size }: HeaderIconProps) {
  const LucideIcon = icons[iconName];

  return <LucideIcon color={color} size={size} />;
};