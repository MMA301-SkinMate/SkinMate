import { COLORS } from './colors';

// Must stay in sync with skinTypes in backend/src/models/CommunityPost.js
export const SKIN_TYPES = ['Da dầu mụn', 'Da khô', 'Da hỗn hợp', 'Da nhạy cảm', 'Phục hồi'];

export const POST_TAGS = ['#Routine', '#DaDauMun', '#PhucHoi', '#Review'];

export const AVATAR_COLORS = [COLORS.primary, COLORS.primaryDark, COLORS.info, COLORS.textSecondary];

export const getAvatarColor = seed => {
  const text = String(seed || '');
  const sum = [...text].reduce((total, char) => total + char.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

export const getInitials = name => String(name || '?')
  .trim()
  .split(/\s+/)
  .slice(-2)
  .map(word => word[0]?.toUpperCase() || '')
  .join('');

export const formatRelativeTime = value => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Hôm qua';
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

export const countRoutineSteps = routine => {
  const days = routine?.days?.length ? routine.days : [routine];
  return days.reduce((total, day) => total + (day?.morning?.length || 0) + (day?.evening?.length || 0), 0);
};
