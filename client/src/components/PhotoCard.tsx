import React from 'react';

type PhotoCardProps = {
  id: number;
  onClick: (id: number) => void;
};

const PhotoCard: React.FC<PhotoCardProps> = ({ id, onClick }: PhotoCardProps) => {
  return (
    <div className="overflow-hidden rounded-lg shadow-lg" onClick={() => onClick(id)} style={{ cursor: 'pointer' }}>
      <img alt="Placeholder" className="block h-auto w-full" src="https://picsum.photos/600/400/?random"></img>
    </div>
  );
};

export default PhotoCard;
