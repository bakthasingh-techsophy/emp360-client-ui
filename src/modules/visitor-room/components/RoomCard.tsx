/**
 * Room Card Component
 * Displays room information in an intuitive card format
 */

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Calendar,
  Edit,
  Trash2,
  MoreVertical,
  Users,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Room } from '../types';
import {
  ROOM_STATUS_COLORS,
  ROOM_STATUS_LABELS,
  ROOM_TYPE_COLORS,
  ROOM_TYPE_LABELS,
  ROOM_TYPE_ICONS,
  AMENITY_ICONS,
} from '../constants';
import { mockCompanies } from '../mockData';

interface RoomCardProps {
  room: Room;
  onBook: (room: Room) => void;
  onView: (room: Room) => void;
  onEdit?: (room: Room) => void;
  onDelete?: (room: Room) => void;
  isAdmin?: boolean;
}

export function RoomCard({
  room,
  onBook,
  onView,
  onEdit,
  onDelete,
  isAdmin = false,
}: RoomCardProps) {
  // Get primary amenities (top 4)
  const primaryAmenities = Object.entries(room.amenities)
    .filter(([, value]) => value === true)
    .slice(0, 4)
    .map(([key]) => key);

  const totalAmenities = Object.values(room.amenities).filter((v) => v === true).length;
  const additionalAmenities = totalAmenities - primaryAmenities.length;

  // Get shared companies names
  const sharedCompanies = room.sharedWithCompanies
    .map((id) => mockCompanies.find((c) => c.id === id)?.name)
    .filter(Boolean);

  const ownerCompany = mockCompanies.find((c) => c.id === room.ownerCompanyId);

  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col h-full overflow-hidden">
      {/* Room Image */}
      {room.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={room.imageUrl}
            alt={room.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            <Badge className={`${ROOM_STATUS_COLORS[room.status]} pointer-events-none`}>
              {ROOM_STATUS_LABELS[room.status]}
            </Badge>
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-white/90 hover:bg-white"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(room)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(room)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start gap-2">
          <span className="text-2xl flex-shrink-0">{ROOM_TYPE_ICONS[room.type]}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base line-clamp-1">{room.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] mt-1">
              {room.description || 'No description available'}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3 space-y-3 flex-1">
        {/* Type Badge */}
        <div className="flex flex-wrap gap-2">
          <Badge className={`${ROOM_TYPE_COLORS[room.type]} pointer-events-none`}>
            {ROOM_TYPE_LABELS[room.type]}
          </Badge>
        </div>

        {/* Key Info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Users className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">Capacity: {room.capacity}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground truncate">{room.floor}</span>
          </div>
          {room.hourlyRate && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">${room.hourlyRate}/hr</span>
            </div>
          )}
          {room.utilizationRate !== undefined && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">{room.utilizationRate}% used</span>
            </div>
          )}
        </div>

        {/* Availability */}
        <div className="flex items-center gap-2 text-xs">
          <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">
            {room.availableFrom} - {room.availableTo}
          </span>
        </div>

        {/* Amenities */}
        {primaryAmenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {primaryAmenities.map((amenity) => (
              <span
                key={amenity}
                className="text-lg"
                title={amenity}
              >
                {AMENITY_ICONS[amenity]}
              </span>
            ))}
            {additionalAmenities > 0 && (
              <span className="text-xs text-muted-foreground self-center">
                +{additionalAmenities} more
              </span>
            )}
          </div>
        )}

        {/* Company Sharing Info */}
        {sharedCompanies.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Shared with:</span>{' '}
              {sharedCompanies.slice(0, 2).join(', ')}
              {sharedCompanies.length > 2 && ` +${sharedCompanies.length - 2} more`}
            </p>
          </div>
        )}
        
        {ownerCompany && ownerCompany.subscriptionType === 'shared' && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Managed by:</span> {ownerCompany.name}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex justify-end items-center w-full gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView(room)}
            className="h-8 w-8"
            title="View Details"
            disabled={room.status === 'inactive'}
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => onBook(room)}
            disabled={room.status !== 'available'}
            className="flex-1"
          >
            {room.status === 'available' ? 'Book Now' : ROOM_STATUS_LABELS[room.status]}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
