import { format, parseISO, isValid } from 'date-fns';
import { GATEPASS_STATUS_CONFIG } from './constants';

export function formatDate(dateString, formatStr = 'dd MMM yyyy, hh:mm a') {
  if (!dateString) return '-';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return isValid(date) ? format(date, formatStr) : '-';
  } catch (error) {
    return dateString || '-';
  }
}

export function formatShortDate(dateString) {
  return formatDate(dateString, 'dd MMM yyyy');
}

export function generateGatePassId(type = 'OUT') {
  const prefix = type.toUpperCase() === 'INWARD' ? 'IN' : 'OUT';
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `GP-${prefix}-${year}-${randomNum}`;
}

export function getStatusBadgeVariant(status) {
  const config = GATEPASS_STATUS_CONFIG[status];
  return config ? config.badgeVariant : 'neutral';
}

export function getStatusLabel(status) {
  const config = GATEPASS_STATUS_CONFIG[status];
  return config ? `${config.label} (${config.marathiLabel})` : status;
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
