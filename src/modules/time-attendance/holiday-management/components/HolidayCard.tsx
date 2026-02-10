/**
 * Holiday Card Content Component
 * Displays holiday content only (image, name, description)
 * Actions are handled by parent DataCards component
 */

import React from 'react';
import { Holiday } from '../types';

interface HolidayCardProps {
  holiday: Holiday;
}

export const HolidayCard: React.FC<HolidayCardProps> = ({ holiday }) => {
  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Image Section */}
      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary/10 rounded-md overflow-hidden flex-shrink-0">
        {holiday.imageUrl ? (
          <img
            src={holiday.imageUrl}
            alt={holiday.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-xs text-muted-foreground">No image</p>
            </div>
          </div>
        )}
      </div>

      {/* Holiday Name */}
      <h3 className="font-semibold text-base line-clamp-2">{holiday.name}</h3>

      {/* Description */}
      {holiday.description && (
        <p className="text-sm text-muted-foreground line-clamp-3 flex-grow">
          {holiday.description}
        </p>
      )}
    </div>
  );
};
