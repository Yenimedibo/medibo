import type { Handler } from 'express';

export function createPreviewApp(options?: {
  staticDirectory?: string;
  fallthrough?: boolean;
}): Handler;
