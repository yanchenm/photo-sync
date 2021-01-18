import Gallery, { RenderImageProps } from 'react-photo-gallery';
import { Photo, getPhotos } from './photoHandler';
import React, { FormEvent, MutableRefObject, useEffect, useRef, useState } from 'react';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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

  const authState = useSelector((state: RootState) => state.auth);

  const pageInputRef = useRef() as MutableRefObject<HTMLInputElement>;

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

  const photos = photoList.map((photo) => ({
    alt: photo.filename,
    src: photo.thumbnail_url,
    height: photo.details.height,
    width: photo.details.width,
    key: photo.id,
  }));

  const imageRenderer = ({ index, photo }: RenderImageProps) => (
    <PhotoCard index={index} key={photo.key} photo={photo} />
  );

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
    <div className="overflow-hidden">
      <div className="p-4 overflow-y-scroll">
        <Gallery photos={photos} renderImage={imageRenderer} />
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
    </div>
  );
};

export default PhotosPage;
