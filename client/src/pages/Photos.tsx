import React, { useState } from 'react';

import PhotoCard from '../components/PhotoCard';

const Photos = () => {
    const [modal, setModal] = useState(false);

    const showDetails = (id: number) => {
        console.log(id);
    };

    return (
        <div className="flex justify-center">
            <div className="max-w-3/4 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4" style={{margin: "30px"}}>
                <PhotoCard id={0} onClick={showDetails} />
                <PhotoCard id={1} onClick={showDetails} />
                <PhotoCard id={2} onClick={showDetails} />
                <PhotoCard id={3} onClick={showDetails} />
            </div>
        </div>
    );
};

export default Photos;