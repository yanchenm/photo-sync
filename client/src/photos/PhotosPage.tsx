import { Photo, getPhotos } from './photoHandler';
import React, { FormEvent, MutableRefObject, useEffect, useRef, useState } from 'react';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import JustifiedLayout from 'justified-layout';
import PhotoCard from './PhotoCard';
import { RootState } from '../store';
import { useSelector } from 'react-redux';

const PhotosPage: React.FC = () => {
  const [photoList, setPhotoList] = useState<Array<Photo>>([]);
  const [currPage, setCurrPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [pageSize, setPageSize] = useState(30);
  const [numPages, setNumPages] = useState(1);
  const [showPages, setShowPages] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const authState = useSelector((state: RootState) => state.auth);

  const pageInputRef = useRef() as MutableRefObject<HTMLInputElement>;
  const containerRef = useRef() as MutableRefObject<HTMLDivElement>;

  useEffect(() => {
    setContainerWidth(containerRef.current ? containerRef.current.offsetWidth : 0);
    window.addEventListener('resize', () =>
      setContainerWidth(containerRef.current ? containerRef.current.offsetWidth : 0),
    );
  }, []);

  useEffect(() => {
    const fetchPhotos = async () => {
      if (authState.accessToken != null) {
        const photos = await getPhotos(authState.accessToken, (currPage - 1) * pageSize, pageSize);
        if (photos != null && photos.items.photos != null) {
          setPhotoList(photos.items.photos);

          const totalPages = Math.ceil(photos.total / pageSize);
          setNumPages(totalPages);

          if (totalPages === 1) {
            setShowPages(false);
          } else {
            setShowPages(true);
          }
        }
      } else {
        setPhotoList([]);
      }
    };

    fetchPhotos();
  }, [authState, currPage, pageSize]);

  const photoSizes = photoList.map((photo) => ({
    width: photo.details.width,
    height: photo.details.height,
  }));

  const photoLayout = JustifiedLayout(photoSizes, {
    containerWidth: containerWidth,
  });

  const photoCards = photoLayout.boxes.map((layout, index) => (
    <PhotoCard
      key={photoList[index].id}
      left={layout.left}
      top={layout.top}
      width={layout.width}
      height={layout.height}
      src={photoList[index].thumbnail_url}
      alt={photoList[index].filename}
    />
  ));

  const onPageChangeSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate new page number
    const newPageNum = parseInt(pageInput);
    if (!isNaN(newPageNum) && newPageNum >= 1 && newPageNum <= numPages) {
      setCurrPage(newPageNum);
      pageInputRef.current.blur();
      setPageInput(newPageNum.toString());
    } else {
      pageInputRef.current.blur();
    }
  };

  return (
    <div className="p-4">
      <div ref={containerRef} style={{ position: 'relative' }}>
        {photoCards}
      </div>
      {showPages && (
        <div className="flex flex-col items-center">
          <div className="flex flex-row items-center mt-4">
            {currPage !== 1 && (
              <FontAwesomeIcon
                icon={faChevronLeft}
                onClick={() => {
                  const newPage = currPage - 1;
                  setCurrPage(newPage);
                  setPageInput(newPage.toString());
                }}
                className="mr-3 text-xl"
              />
            )}
            <p className="font-default text-md">Page &nbsp;</p>
            <form onSubmit={onPageChangeSubmit}>
              <input
                className="font-default text-md appearance-none rounded relative block border border-gray-800 w-8 text-center"
                value={pageInput}
                ref={pageInputRef}
                onChange={(event) => setPageInput(event.target.value)}
                onFocus={() => setPageInput('')}
                onBlur={() => setPageInput(currPage.toString())}
              />
            </form>
            <p className="font-default text-md">&nbsp; of {numPages}</p>
            {currPage !== numPages && (
              <FontAwesomeIcon
                icon={faChevronRight}
                onClick={() => {
                  const newPage = currPage + 1;
                  setCurrPage(newPage);
                  setPageInput(newPage.toString());
                }}
                className="ml-3 text-xl"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotosPage;
