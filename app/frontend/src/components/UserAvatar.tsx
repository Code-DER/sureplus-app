import './UserAvatar.css';
import { getUserInitials } from '../utils/avatar';

interface UserAvatarProps {
  firstName?: string | null;
  lastName?: string | null;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  title?: string;
}

export default function UserAvatar({
  firstName,
  lastName,
  size = 40,
  className = '',
  style,
  onClick,
  title,
}: UserAvatarProps) {
  const initials = getUserInitials(firstName, lastName);
  const fontSize = Math.max(10, Math.round(size * 0.375));

  return (
    <div
      className={`user-avatar${className ? ` ${className}` : ''}`}
      style={{
        width: size,
        height: size,
        fontSize,
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
      onClick={onClick}
      title={title}
    >
      {initials}
    </div>
  );
}
