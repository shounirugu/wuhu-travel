/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Destination {
  id: string;
  title: string;
  category: '风景' | '项目' | '小吃' | '打卡';
  image: string;
  description: string;
  rating: number;
  priceText: string;
  address?: string;
  tag?: string; // e.g. "历史地标", "休闲健身", "中华老字号", "打卡地"
  details?: string;
  images?: string[];
}

export interface KPIStats {
  totalCount: number;
  avgRating: number;
  categoryCount: number;
  chatCount: number;
}
