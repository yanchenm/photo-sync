import React from 'react';

type PhotoCardProps = {
  left: number;
  top: number;
  height: number;
  width: number;
  src: string;
  alt: string;
  onClick: () => void;
};

const PhotoCard: React.FC<PhotoCardProps> = ({ left, top, height, width, alt, src, onClick }: PhotoCardProps) => {
  return (
    <div
      style={{ cursor: 'pointer', position: 'absolute', left: left, top: top, height: height, width: width }}
      className="flex shadow rounded overflow-hidden items-center justify-center"
      onClick={onClick}
    >
      <img alt={alt} src={src} className="min-w-full min-h-full" />
    </div>
  );
};

export default PhotoCard;
