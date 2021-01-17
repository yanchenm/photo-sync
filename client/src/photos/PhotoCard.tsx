import { PhotoProps } from 'react-photo-gallery';
import React from 'react';

type PhotoCardProps = {
  index: number;
  photo: PhotoProps;
};

const PhotoCard: React.FC<PhotoCardProps> = ({ photo }: PhotoCardProps) => {
  return (
    <div
      className="overflow-hidden rounded shadow-lg"
      style={{ cursor: 'pointer', height: photo.height, width: photo.width, margin: '2px' }}
    >
      <img alt={photo.alt} className="block h-auto w-full" src={photo.src}></img>
    </div>
  );
};

export default PhotoCard;
