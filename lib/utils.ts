import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * @description Xoa di ky tu '/' dau tien cua path
 * @param path 
 * @returns [string]
 */
export const normalizePath = (path: string) => {
  return path.startsWith('/') ? path.slice(1) : path
}


export const checkPermissionApply = (userInfor:any, keyAction:string) => {
  if ((userInfor['permissions'] as string[]).includes(keyAction)) {
    return true;
  } else {
    return false
  }
}