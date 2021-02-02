import React from 'react';

type PhotoCardProps = {
  left: number;
  top: number;
  height: number;
  width: number;
  src: string;
  alt: string;
  onClick: () => void;
  onLoad: () => void;
};

const PhotoCard: React.FC<PhotoCardProps> = ({
  left,
  top,
  height,
  width,
  alt,
  src,
  onClick,
  onLoad,
}: PhotoCardProps) => {
  return (
    <div
      style={{ cursor: 'pointer', position: 'absolute', left: left, top: top, height: height, width: width }}
      className="flex shadow rounded overflow-hidden items-center justify-center"
      onClick={onClick}
      onLoad={onLoad}
    >
      <img alt={alt} src={src} className="min-w-full min-h-full" />
    </div>
  );
};

export default PhotoCard;
