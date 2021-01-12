import { Photo } from './photoHandler';
import React from 'react';

type PhotoCardProps = {
  photo: Photo;
  onClick: (id: string) => void;
};

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick }: PhotoCardProps) => {
  return (
    <div className="overflow-hidden rounded shadow-lg" onClick={() => onClick(photo.id)} style={{ cursor: 'pointer' }}>
      <img alt={photo.filename} className="block h-auto w-full" src={photo.thumbnail_url}></img>
    </div>
  );
};

export default PhotoCard;
