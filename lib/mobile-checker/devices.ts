import { Smartphone, Tablet, Monitor, Ruler, type LucideIcon } from 'lucide-react'

export type DeviceCategory = 'phone' | 'tablet' | 'desktop' | 'custom'

export interface Device {
  id: string
  label: string
  brand: string
  width: number
  height: number
  icon: LucideIcon
  category: DeviceCategory
}

function phone(id: string, label: string, brand: string, width: number, height: number): Device {
  return { id, label, brand, width, height, icon: Smartphone, category: 'phone' }
}
function tablet(id: string, label: string, brand: string, width: number, height: number): Device {
  return { id, label, brand, width, height, icon: Tablet, category: 'tablet' }
}
function desktop(id: string, label: string, brand: string, width: number, height: number): Device {
  return { id, label, brand, width, height, icon: Monitor, category: 'desktop' }
}

export const BUILT_IN_DEVICES: Device[] = [
  // ── Apple iPhone ──────────────────────────────────────────
  phone('iphone-se', 'iPhone SE', 'Apple', 375, 667),
  phone('iphone-13-mini', 'iPhone 13 mini', 'Apple', 375, 812),
  phone('iphone-13', 'iPhone 13', 'Apple', 390, 844),
  phone('iphone-14', 'iPhone 14', 'Apple', 390, 844),
  phone('iphone-14-plus', 'iPhone 14 Plus', 'Apple', 428, 926),
  phone('iphone-14-pro', 'iPhone 14 Pro', 'Apple', 393, 852),
  phone('iphone-14-pro-max', 'iPhone 14 Pro Max', 'Apple', 430, 932),
  phone('iphone-15', 'iPhone 15', 'Apple', 393, 852),
  phone('iphone-15-pro-max', 'iPhone 15 Pro Max', 'Apple', 430, 932),
  phone('iphone-16-pro-max', 'iPhone 16 Pro Max', 'Apple', 440, 956),

  // ── Samsung Galaxy ────────────────────────────────────────
  phone('galaxy-s21', 'Galaxy S21', 'Samsung', 360, 800),
  phone('galaxy-s22', 'Galaxy S22', 'Samsung', 360, 780),
  phone('galaxy-s23', 'Galaxy S23', 'Samsung', 393, 851),
  phone('galaxy-s23-ultra', 'Galaxy S23 Ultra', 'Samsung', 412, 915),
  phone('galaxy-s24-ultra', 'Galaxy S24 Ultra', 'Samsung', 412, 918),
  phone('galaxy-a54', 'Galaxy A54', 'Samsung', 393, 873),
  phone('galaxy-z-flip5', 'Galaxy Z Flip5', 'Samsung', 374, 838),
  phone('galaxy-note20', 'Galaxy Note 20', 'Samsung', 412, 869),

  // ── Google Pixel ──────────────────────────────────────────
  phone('pixel-6', 'Pixel 6', 'Google', 412, 915),
  phone('pixel-6-pro', 'Pixel 6 Pro', 'Google', 412, 892),
  phone('pixel-7', 'Pixel 7', 'Google', 412, 892),
  phone('pixel-7-pro', 'Pixel 7 Pro', 'Google', 412, 892),
  phone('pixel-8', 'Pixel 8', 'Google', 412, 915),
  phone('pixel-8-pro', 'Pixel 8 Pro', 'Google', 412, 892),

  // ── Other Android ─────────────────────────────────────────
  phone('oneplus-11', 'OnePlus 11', 'OnePlus', 412, 919),
  phone('oneplus-nord', 'OnePlus Nord', 'OnePlus', 412, 915),
  phone('xiaomi-13', 'Xiaomi 13', 'Xiaomi', 393, 873),
  phone('redmi-note-12', 'Redmi Note 12', 'Xiaomi', 393, 851),

  // ── Tablets ───────────────────────────────────────────────
  tablet('ipad-mini', 'iPad Mini', 'Apple', 768, 1024),
  tablet('ipad-air', 'iPad Air', 'Apple', 820, 1180),
  tablet('ipad-pro-11', 'iPad Pro 11"', 'Apple', 834, 1194),
  tablet('ipad-pro-12', 'iPad Pro 12.9"', 'Apple', 1024, 1366),
  tablet('galaxy-tab-s8', 'Galaxy Tab S8', 'Samsung', 800, 1280),
  tablet('galaxy-tab-s9-ultra', 'Galaxy Tab S9 Ultra', 'Samsung', 1848, 2960),
  tablet('surface-pro', 'Surface Pro 9', 'Microsoft', 912, 1368),

  // ── Desktop / Laptop ──────────────────────────────────────
  desktop('laptop', 'Laptop', 'Generic', 1366, 768),
  desktop('laptop-large', 'Laptop (Large)', 'Generic', 1440, 900),
  desktop('macbook-air', 'MacBook Air 13"', 'Apple', 1280, 800),
  desktop('macbook-pro-16', 'MacBook Pro 16"', 'Apple', 1512, 982),
  desktop('desktop-fhd', 'Desktop (Full HD)', 'Generic', 1920, 1080),
  desktop('desktop-2k', 'Desktop (2K)', 'Generic', 2560, 1440),
]

export const CATEGORY_ICON: Record<DeviceCategory, LucideIcon> = {
  phone: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
  custom: Ruler,
}

export const CATEGORY_LABEL: Record<DeviceCategory, string> = {
  phone: 'Phones',
  tablet: 'Tablets',
  desktop: 'Desktop',
  custom: 'Custom',
}
